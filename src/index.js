import "./style.css"
import "./reset.css"

export { projectsList, addProject, updateProjectList, deleteTask, updateTaskList, currentProjectIndex, drag, addTask, addCard, addCardsToDesk, deleteActiveTask, deleteActiveProject, projectOrTask, activeIndexToDelete, removeEmptyItems }
import { populateCard, addDrag, timers, getDue } from "./cards.js";
import { modalOn, displayDelete, displayProjectForm, displayTaskForm, zeroProjectError, createButtons } from "./modal-window.js"
import { Element, Image, Input, Label, Project, Note, ChecklistNote, DateNote } from "./components.js";
import closeIcon from "./images/close-svgrepo-com.svg";

let autoSpread = true;
let drag = true;
let mode = "dawn"
let projectsList = []
let currentProjectIndex = 0;

const modeSelect = document.getElementById("mode-select");
const modes = ["night", "dusk", "dawn"];
mode = modes[Math.floor((Math.random() * 3))];
changeTheme(mode);

const body = document.querySelector("body");
const cardWrapper = document.getElementById("card-wrapper");
const isMobile = window.matchMedia("(pointer: coarse)").matches;

modeSelect.addEventListener("change", (e) => {
    changeTheme(e.target.value)
    mode = e.target.value;
})
const dragToggle = document.getElementById("drag");
dragToggle.addEventListener("change", (e) => {
    e.target.checked === true ? drag = true : drag = false;
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
        li.append(addDeleteButton("project"), project)
        list.append(li);
    })
    const buttonObj = new Element({tag: "button", id: "create-project", text: "Create Project"})
    const button = buttonObj.create();
    button.addEventListener("click", (e) => displayModal(e))
    list.append(button)
}
function updateTaskList() {
    console.log("Creating ", "index ", currentProjectIndex, projectsList)
    const list = document.querySelector("#tasks-list ul");
    list.replaceChildren("")
    const activeProject = projectsList[currentProjectIndex];
    const activeTasks = activeProject.getTasks();
    activeTasks.forEach((item, index) => {
        const liObj = new Element({tag: "li", classes: `task-item task-${index}`});
        const li = liObj.create();
        li.tabIndex = 0;
        const task = new Element({tag: "p", classes: "task-item-text", text: item.title}).create();
        li.append(addDeleteButton("task"), task);
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
        let ulParent = e.target.parentElement.parentElement.parentElement;
        ulParent.id === "tasks-list" ? projectOrTask = "task" : projectOrTask = "project";
        let liItems = (e.target.parentElement).parentElement.children;
        let liItemsArr = Array.from(liItems);
        activeIndexToDelete = liItemsArr.indexOf(e.target.parentElement)
        console.log("projectOrTask swapped to ", projectOrTask)
        displayModal(e)
    })
    return deleteButton
}
function displayModal(e) {
    modalOn("on");
    const closeButton = document.getElementById("close-modal");
    closeButton.addEventListener("click", (e) =>
    modalOn("off"))
    if (e.target.id==="create-task" || e.target.id ==="add-icon") {
        createButtons()
        displayTaskForm()
    }
    if (e.target.id==="create-project") displayProjectForm();
    if (e.target.classList.contains("delete-icon")) displayDelete();
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
function addProject(projectName) {
    const newProject = new Project(projectName);
    projectsList.push(newProject)
}
function deleteProject(projectIndex) {
    removeEmptyItems();
    console.log(`Deleted project: ${projectsList[projectIndex].name}!`);
    delete projectsList[projectIndex];
    if (projectIndex === 0) currentProjectIndex = 0;
    else currentProjectIndex--
    console.log("new: ", currentProjectIndex)
}
function deleteActiveProject() {
    deleteProject(activeIndexToDelete)
    removeEmptyItems()
    updateTaskList()
    addCardsToDesk(currentProjectIndex)
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
    console.log(activeIndexToDelete)
    updateTaskList()
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
            console.log("No task found")
        }
        task.assignedIndex = counter;
        counter++
    }
    if (drag) addDrag(cardWrapper, autoSpread)    
}
function addCard() {
    const taskList = projectsList[currentProjectIndex].taskList
    const task = taskList[taskList.length-1];
    console.log(taskList)
    cardWrapper.append(task.createCard());
    updateTimers()
    if (drag) addDrag(cardWrapper, autoSpread);
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

function changeTheme(theme) {
    const root = document.documentElement;
    let newBg = `--bg-${theme}`;
    let newBgColor = `--bg-${theme}-color`;
    let newDark = `--theme-${theme}-dark`;
    let newColor =  `--theme-${theme}-color`;
    let newOp = `--theme-${theme}-op`;
    let newAccent = `--theme-${theme}-accent`;
    let newFont = `--theme-${theme}-font`
    let newFontL = `--theme-${theme}-font-l`
    root.style.setProperty("--bg-current", `var(${newBg})`);
    root.style.setProperty("--bg-current-color", `var(${newBgColor})`);
    root.style.setProperty("--theme-current-dark", `var(${newDark})`);
    root.style.setProperty("--theme-current-color", `var(${newColor}`);
    root.style.setProperty("--theme-current-op", `var(${newOp})`);
    root.style.setProperty("--theme-current-accent", `var(${newAccent})`);
    root.style.setProperty("--theme-current-font", `var(${newFont})`);
    root.style.setProperty("--theme-current-font-l", `var(${newFontL})`);

    modeSelect.value = theme
}

addProject("Your First Project")
addProject("Your Second Project")
addTask(0, {title: "Your first note!", description: "Note description goes here.", priority: "Low", type: "note"})
addTask(0, {title: "Checklist", description: ["Laundry", "Vaccuum", "Clean bathroom"], dueDate: "2026-07-24", dueTime: "17:00", type: "checklist"})
addTask(0, {title: "Date Note", description: "A date will be emphasized above with a description and an optional timer.", priority: "High", type: "date", dueDate: "2026-07-28", dueTime: "16:00", timer: true})
addTask(1, {title: "Your new task", type: "note", text: "what"})
// updateTask(0, 0, {title: "1st task new name"})

addCardsToDesk(currentProjectIndex)

// deleteTask(0, 0)

updateProjectList()
updateTaskList()

console.log(JSON.stringify(projectsList))