import { createElementWithAttributes } from "./helpers.js";
import { deleteIcon, editIcon, editSquareIcon } from "./icons.js";
let tasks = [];
let editIndex = null;

const input = document.querySelector("#input");
const addTaskButton = document.querySelector("#add-task");
const taskList = document.querySelector("#task-list");
const microphone = document.querySelector("#microphone");

document.addEventListener("DOMContentLoaded", () => {
    addTaskButton.addEventListener("click", addTask);
    const storedTasks = JSON.parse(localStorage.getItem("tasks"));

    if (storedTasks) {
        tasks = storedTasks;
        updateTaskList();
        updateStats();
    }

    const recognition = setUpSpeechRecognition();

    microphone.addEventListener("click", () => {
        recognition.start();
        input.classList.add("active");
    });

    recognition.addEventListener("end", () => {
        recognition.stop();
        input.classList.remove("active");
    });

    recognition.addEventListener("result", (e) => {
        const speechToText = e.results[0][0].transcript;

        input.value = speechToText;
    });
});

const addTask = () => {
    const text = input.value.trim();
    if (!text) return;

    if (editIndex !== null) {
        tasks[editIndex].text = text;
        editIndex = null;
        Array.from(taskList.children).forEach((task) =>
            task.classList.remove("editing")
        );
    } else {
        tasks.push({ text, isComplete: false });
    }

    input.value = "";

    updateTaskList();
    updateStats();
    saveTasks();
};

const toggleTaskCompleted = (index, target) => {
    tasks[index].isComplete = !tasks[index].isComplete;

    const task = target.parentElement.parentElement;

    task.classList.toggle("completed");

    updateStats();
    saveTasks();
};
const editTask = (index, target) => {
    Array.from(taskList.children).forEach((task) =>
        task.classList.remove("editing")
    );

    const task = target.parentElement.parentElement;

    task.classList.add("editing");

    input.value = tasks[index].text;

    editIndex = index;

    addTaskButton.innerHTML = editIcon;
};

const deleteTask = (index) => {
    tasks.splice(index, 1);

    updateTaskList();
    updateStats();
    saveTasks();
};

const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
};

const updateTaskList = () => {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = createElementWithAttributes("li", {
            className: `task ${task.isComplete ? "completed" : ""}`,
        });
        const checkBoxContainer = createCheckBoxContainer(task, index);
        const actions = createActionsContainer(index);

        li.appendChild(checkBoxContainer);
        li.appendChild(actions);

        taskList.appendChild(li);
    });
};

const createCheckBoxContainer = (task, index) => {
    const checkBoxId = `checkbox-${index}`;

    const checkBoxContainer = createElementWithAttributes("div", {
        className: "checkbox-container",
    });
    const input = createElementWithAttributes("input", {
        type: "checkbox",
        className: "checkbox",
        id: checkBoxId,
        checked: task.isComplete,
    });

    input.addEventListener("change", (e) =>
        toggleTaskCompleted(index, e.target)
    );

    const label = createElementWithAttributes("label", {
        htmlfor: checkBoxId,
        textContent: task.text,
    });

    checkBoxContainer.appendChild(input);
    checkBoxContainer.appendChild(label);

    return checkBoxContainer;
};

const createActionsContainer = (index) => {
    const actions = createElementWithAttributes("div", {
        className: "actions",
    });

    const editButton = createElementWithAttributes("button", {
        innerHTML: editSquareIcon,
    });

    editButton.addEventListener("click", (e) => editTask(index, e.target));

    const deleteButton = createElementWithAttributes("button", {
        className: "delete",
        innerHTML: deleteIcon,
    });

    deleteButton.addEventListener("click", () => deleteTask(index));

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    return actions;
};

const updateStats = () => {
    const taskSummary = document.querySelector("#task-summary");
    const progress = document.querySelector("#progress");

    const totalCompletedTasks = tasks.filter((task) => task.isComplete).length;
    const totalTasks = tasks.length;

    const completionPercentage = (totalCompletedTasks / totalTasks) * 100;

    progress.style.width = `${completionPercentage}%`;

    taskSummary.textContent = `${totalCompletedTasks} / ${totalTasks}`;
};

const setUpSpeechRecognition = () => {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "de-DE";
    recognition.interInResults = false;
    recognition.maxAlternatives = 1;

    return recognition;
};
