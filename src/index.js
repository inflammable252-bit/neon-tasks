import "./style.css";
import "./reset.css";
import { addDrag, timers, getDue } from "./cards.js";
import { modalOn, displayDelete, displayProjectForm, displayTaskForm, createButtons, displayBackup } from "./modal-window.js";
import { Element, Image, Project, updateLocalStorage } from "./components.js";
import closeIcon from "./images/close-svgrepo-com.svg";

export { projectsList, addProject, updateProjectList, deleteTask, updateTaskList, currentProjectIndex, drag, autoSpread, addTask, addCard, addCardsToDesk, deleteActiveTask, deleteActiveProject, projectOrTask, activeIndexToDelete, removeEmptyItems }

let autoSpread = true;
let drag = true;
let projectsList = []
let currentProjectIndex = 0;

let mode = "dawn";
let modeRandom = true;
const modeSelect = document.getElementById("mode-select");
const modes = ["night", "dusk", "dawn"];

console.log("start: ", {
    autoSpread, drag, modeRandom, mode
});

const body = document.querySelector("body");
const cardWrapper = document.getElementById("card-wrapper");

const autoSpreadToggle = document.getElementById("adjust-toggle");
autoSpreadToggle.addEventListener("change", (e) => {
    e.target.checked === true ? autoSpread = true : autoSpread = false;
    localStorage.setItem("autoSpread", autoSpread)
})
const dragToggle = document.getElementById("drag-toggle");
dragToggle.addEventListener("change", (e) => {
    e.target.checked === true ? drag = true : drag = false;
    localStorage.setItem("drag", drag)
})
const randomModeToggle = document.getElementById("theme-toggle");
randomModeToggle.addEventListener("change", (e) => {
    e.target.checked === true ? modeRandom = true : modeRandom = false;
    localStorage.setItem("modeRandom", modeRandom)
})

modeSelect.addEventListener("change", (e) => {
    changeTheme(e.target.value)
    mode = e.target.value;
    localStorage.setItem("mode", mode)
})
function updateProjectList() {
    const list = document.querySelector("#projects-list ul");
    list.replaceChildren("")
    projectsList.forEach((item, index) => {
        const liObj = new Element({tag: "li", classes: `project-item project-${index}`})
        const li = liObj.create();
        li.tabIndex = 0;
        if (index === currentProjectIndex) li.classList.add("selected-project");
        const project = new Element({tag: "p", classes: "project-item-text", text: `${item.name} [${item.taskList.length}]`}).create()
        li.addEventListener("click", (e) => {
            let projectIndex = Array.from(li.parentElement.children).indexOf(li);
            currentProjectIndex = projectIndex;
            updateProjectList();
            updateTaskList()
            addCardsToDesk(currentProjectIndex)
        })
        li.append(addDeleteButton("project"), project, addEditButton("project"))
        list.append(li);
    })
    const buttonObj = new Element({tag: "button", id: "create-project", text: "Create Project"})
    const button = buttonObj.create();
    button.addEventListener("click", (e) => displayModal(e))
    list.append(button)
}
function updateTaskList() {
    const list = document.querySelector("#tasks-list ul");
    list.replaceChildren("")
    const activeProject = projectsList[currentProjectIndex];
    const activeTasks = activeProject.getTasks();
    activeTasks.forEach((item, index) => {
        // console.log("Updating task list: ", item)
        const liObj = new Element({tag: "li", classes: `task-item task-${index}`});
        const li = liObj.create();
        li.tabIndex = 0;
        const task = new Element({tag: "p", classes: "task-item-text", text: item.title}).create();
        li.append(addDeleteButton("task"), task, addEditButton("task"));
        list.append(li)
    })
    const buttonObj = new Element({tag: "button", id: "create-task", text: "Create Task"});
    const button = buttonObj.create();
    button.addEventListener("click", (e) => displayModal(e))
    list.append(button)
   
    list.addEventListener("focus", (e) => {
        if (e.target.tagName === "BUTTON") return;
        let cards = document.querySelectorAll("article.card");
        const liIndex = Array.from(list.children).indexOf(e.target);
        removeEmptyItems();
        cards[liIndex].classList.add("selected-card")
    }, true)
    list.addEventListener("blur", (e) => {
        if (e.target.tagName === "BUTTON") return;
        let cards = document.querySelectorAll("article.card");
        const liIndex = Array.from(list.children).indexOf(e.target);
        removeEmptyItems();
        cards[liIndex].classList.remove("selected-card")
    }, true)
}

let projectOrTask;
let activeIndexToDelete;

function addDeleteButton(fromList) {
    const deleteButton = new Image({classes: `delete-icon delete-${fromList}`, src: closeIcon, alt: "Delete task"}).create();
    deleteButton.addEventListener("click", (e) => {
        getIndex(e)
        displayModal(e)
    })
    return deleteButton
}
function addEditButton(fromList) {
    const editButton = new Element({tag: "button", classes: `edit-item edit-${fromList}`, text: "Edit"}).create();
    editButton.addEventListener("click", (e) => {
        console.log(e)
        e.preventDefault()
        getIndex(e)
        displayModal(e, activeIndexToDelete)
    })
    return editButton
}
function getIndex(e) {
    let ulParent = e.target.parentElement.parentElement.parentElement;
        ulParent.id === "tasks-list" ? projectOrTask = "task" : projectOrTask = "project";
        let liItems = (e.target.parentElement).parentElement.children;
        let liItemsArr = Array.from(liItems);
        activeIndexToDelete = liItemsArr.indexOf(e.target.parentElement)
}
function displayModal(e, index) {
    modalOn("on");
    const closeButton = document.getElementById("close-modal");
    closeButton.addEventListener("click", (e) =>
    modalOn("off"))
    if (e.target.id==="create-task" || e.target.id ==="add-icon") {
        createButtons("create")
        displayTaskForm("create")
    }
    if (e.target.id==="create-project") displayProjectForm("create");
    if (e.target.classList.contains("delete-icon")) displayDelete();
    if (e.target.id==="backup") displayBackup()
    if (e.target.classList.contains("edit-project")) displayProjectForm("edit")
    if (e.target.classList.contains("edit-task")) {
        createButtons("edit")
        displayTaskForm("edit", index)
    }
}
const addIcon = document.getElementById("add-icon");
addIcon.addEventListener("click", (e) => {
    displayModal(e)
})
const listIcon = document.getElementById("list-icon");
listIcon.addEventListener("click", () => toggleSidebar())
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("show")
}
const settingsIcon = document.getElementById("settings-icon");
settingsIcon.addEventListener("click", () => toggleSettingsSidebar())
function toggleSettingsSidebar() {
    const settings = document.querySelector("div.toggle-inputs-wrapper");
    console.log(settings)
    settings.classList.toggle("selected-settings")
}
function addProject(projectName) {
    const newProject = new Project(projectName);
}
function deleteProject(projectIndex) {
    removeEmptyItems();
    console.log(`Deleted project: ${projectsList[projectIndex].name}!`);
    delete projectsList[projectIndex];
    if (projectIndex === 0) currentProjectIndex = 0;
    else currentProjectIndex--
    // console.log("new: ", currentProjectIndex)
}
function deleteActiveProject() {
    deleteProject(activeIndexToDelete)
    removeEmptyItems()
    updateTaskList()
    addCardsToDesk(currentProjectIndex)
    updateLocalStorage()
}
function updateActiveTask(target) {
    const selectedTask = projectsList[currentProjectIndex].projectList[index];
    const selectedCard = cards[index];

    selectedTask.update(task)
    selectedCard.replaceWith(selectedTask.createCard())
}

function addTask(projectIndex, task) {
    projectsList[projectIndex].addTaskToList(task)
}
function getTask(projectIndex, taskIndex) {
    return projectsList[projectIndex].taskList[taskIndex]
}
function updateTask(projectIndex, taskIndex, update) {
    getTask(projectIndex, taskIndex).update(update)
}
function deleteTask(projectIndex, taskIndex) {
    removeEmptyItems();
    const currentTasks = projectsList[projectIndex].taskList;
    const currentCards = document.querySelectorAll("article.card");
    console.log(`Deleted ${currentTasks[taskIndex].type}: ${currentTasks[taskIndex].title}!`);
    delete currentTasks[taskIndex];
    currentCards[taskIndex].remove()
}
function deleteActiveTask() {
    deleteTask(currentProjectIndex, activeIndexToDelete)
    updateTaskList()
    updateLocalStorage()
}
function removeEmptyItems() {
    if (projectsList[currentProjectIndex]) projectsList[currentProjectIndex].taskList = projectsList[currentProjectIndex].taskList.filter((task) => task !== undefined);
    projectsList = projectsList.filter((project) => project !== undefined)
}
let currentTimer;
function addCardsToDesk(projectIndex) {
    removeEmptyItems();
    timers.length = 0;
    updateTimers();
    const currentProjectTasks = projectsList[projectIndex].taskList;
    cardWrapper.replaceChildren("")
    let counter = 0;
    for (const task of currentProjectTasks) {
        try {
            task.createCard()
        } catch (error) {
            console.log(error)
            console.warn("No task found")
        }
        task.assignedIndex = counter;
        counter++
    }
    addDrag()
}
function addCard() {
    const taskList = projectsList[currentProjectIndex].taskList
    const task = taskList[taskList.length-1];
    console.log(taskList)
    task.createCard();
    updateTimers()
}
function updateTimers() {
    clearInterval(currentTimer)
    currentTimer = setInterval(() => {
        timers.forEach((set) => {
            const task = set[0];
            const timer = set[1]; 
            timer.textContent = getDue(task).getMsg();
            timer.style.color = getDue(task).getColor()
        })
    }, 45000);
}

const backupButton = document.getElementById("backup");
backupButton.addEventListener("click", (e) => displayModal(e))

function changeTheme(theme) {
    const root = document.documentElement;
    let newBg = `--bg-${theme}`;
    let newBgS = `--bg-${theme}-s`;
    let newBgColor = `--bg-${theme}-color`;
    let newDark = `--theme-${theme}-dark`;
    let newColor =  `--theme-${theme}-color`;
    let newOp = `--theme-${theme}-op`;
    let newAccent = `--theme-${theme}-accent`;
    let newFont = `--theme-${theme}-font`
    let newFontL = `--theme-${theme}-font-l`
    root.style.setProperty("--bg-current", `var(${newBg})`);
    root.style.setProperty("--bg-current-s", `var(${newBgS})`);
    root.style.setProperty("--bg-current-color", `var(${newBgColor})`);
    root.style.setProperty("--theme-current-dark", `var(${newDark})`);
    root.style.setProperty("--theme-current-color", `var(${newColor}`);
    root.style.setProperty("--theme-current-op", `var(${newOp})`);
    root.style.setProperty("--theme-current-accent", `var(${newAccent})`);
    root.style.setProperty("--theme-current-font", `var(${newFont})`);
    root.style.setProperty("--theme-current-font-l", `var(${newFontL})`);

    modeSelect.value = theme
    localStorage.setItem("mode", mode)
}

function test() {
addProject("Your First Project")
addProject("Your Second Project")
addTask(0, {title: "Your first note!", description: "Note description goes here.", priority: "Low", type: "note"})
addTask(0, {title: "Checklist", description: ["Laundry", "Vaccuum", "Clean bathroom"], dueDate: "2026-07-24", dueTime: "17:00", type: "checklist"})
addTask(0, {title: "Date Note", description: "A date will be emphasized above with a description and an optional timer.", priority: "High", type: "date", dueDate: "2026-07-28", dueTime: "16:00", timer: "on"})
addTask(0, {title: "Date Note", description: "A date will be emphasized above with a description and an optional timer.", priority: "High", type: "date", dueDate: "2026-07-28", dueTime: "16:00", timer: "off"})
addTask(1, {title: "Your new task", type: "note", text: "what"})

updateProjectList()
updateTaskList()
addCardsToDesk(currentProjectIndex)
}

function init() {
    try {
        console.log("Loading...")
        load()
    } catch (error) {
        console.log("Initial load!")
        const projectsJson = localStorage.getItem("projectsList");
        localStorage.setItem("autoSpread", autoSpread);
        localStorage.setItem("drag", drag);
        localStorage.setItem("modeRandom", modeRandom);
        addProject("Welcome");
        addTask(0, {title: "Tips", description: ["Add tasks and projects from the sidebar.", "Click an item then the 'x' icon to delete it.", "Double-click a card to expand it."], dueDate: "2026-07-24", dueTime: "17:00", type: "checklist"});
        console.log(error)
    } finally {
        updateDesk()
        console.log("Initialize complete!")
    }
}
function updateDesk() {
    console.log("Updating desk")
    modeInit();
    updateProjectList()
    updateTaskList()
    addCardsToDesk(currentProjectIndex)
    updateToggles()
}
function load() {
    const projectsJson = localStorage.getItem("projectsList")
    let projectsJsonParsed = JSON.parse(projectsJson);
    console.log("localStorage log: ", {
        json: projectsJson,
        parsed: projectsJsonParsed,
        currentTasks: projectsJsonParsed[currentProjectIndex].taskList
    })
    console.log("Current page settings", {autoSpread: autoSpread, drag: drag, modeRandom: modeRandom, mode: mode},)
    projectsJsonParsed.forEach((project, index) => {
        // console.log("Adding ", project.name)
        addProject(project.name)
        project.taskList.forEach((task) => {
            addTask(index, task)
            // console.log("Adding task ", task)
        })
    })
    getSettingsFromLocalStorage()
    console.log("Load complete!")
}

function modeInit() {
    if (modeRandom) {
        mode = modes[Math.floor((Math.random() * 3))];
    }
    changeTheme(mode)
    console.log(`Mode set as ${mode}. Random mode: ${modeRandom}`)
}
function getSettingsFromLocalStorage() {
    console.log("Getting settings from localStorage...")
    autoSpread = JSON.parse(localStorage.getItem("autoSpread")) ?? true;
    drag = JSON.parse(localStorage.getItem("drag")) ?? true;
    mode = localStorage.getItem("mode") ?? "dawn";
    modeRandom = JSON.parse(localStorage.getItem("modeRandom")) ?? true;

    console.log("Updated page settings: ", {
    autoSpread, drag, modeRandom, mode
    });
    console.log("localStorage Settings log: ", {
    autoSpread: localStorage.getItem("autoSpread"),
    drag: localStorage.getItem("drag"),
    modeRandom: localStorage.getItem("modeRandom"),
    mode: localStorage.getItem("mode")
    })
}
function updateToggles() {
    console.log("Updating toggles.");
    console.log("Current page settings to toggle", {autoSpread: autoSpread, drag: drag, modeRandom: modeRandom, mode: mode});
    (autoSpread===true) ? autoSpreadToggle.setAttribute("checked", "") : autoSpreadToggle.checked = false;
    (drag===true) ? dragToggle.setAttribute("checked", "") : dragToggle.checked = false;
    (modeRandom===true) ? randomModeToggle.setAttribute("checked", "") : randomModeToggle.checked = false;
    
}
// test()
init()
