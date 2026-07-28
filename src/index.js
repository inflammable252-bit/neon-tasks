import "./style.css"
import "./reset.css"

export { projectsList, updateProjectList, updateTaskList, currentProjectIndex, drag, addTask, addCardsToDesk }
import { populateCard, addDrag, timers, getDue } from "./cards.js";
import { modalOn, displayProjectForm, displayTaskForm } from "./modal-window.js"
import { Element, Image, Input, Label, Project, Note, ChecklistNote, DateNote } from "./components.js";

let autoSpread = true;
let drag = true;
let mode = "dawn"
const projectsList = []
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
        const projectObj = new Element({tag: "li", classes: "project-item", text: item.name})
        const project = projectObj.create();
        if (index === currentProjectIndex) project.classList.add("selected-project");
        project.addEventListener("click", (e) => {
            let projectIndex = Array.from(project.parentElement.children).indexOf(project);
            currentProjectIndex = projectIndex;
            updateProjectList();
            updateTaskList()
            console.log(projectsList[currentProjectIndex])
            addCardsToDesk(currentProjectIndex)
        })
        list.append(project);
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
    activeTasks.forEach((item) => {
        const taskObj = new Element({tag: "li", classes: "task-item", text: item.title});
        const task = taskObj.create()
        list.append(task)
    })
    const buttonObj = new Element({tag: "button", id: "create-task", text: "Create Task"});
    const button = buttonObj.create();
    button.addEventListener("click", (e) => displayModal(e))
    list.append(button)
}
function displayModal(e) {
    modalOn("on");
    const closeButton = document.getElementById("close-modal");
    closeButton.addEventListener("click", () =>
    modalOn("off"))
    if (e.target.id==="create-task") displayTaskForm();
    if (e.target.id==="create-project") displayProjectForm();
}
const addIcon = document.getElementById("add-icon");
addIcon.addEventListener("click", () => {
    displayModal()
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
    projectsList.splice(projectIndex, 1)
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
    const currentTasks = projectsList[projectIndex].taskList;
    const currentCards = document.querySelectorAll("article.card");
    console.log(`Deleted ${currentTasks[taskIndex].type}: ${currentTasks[taskIndex].title}!`);
    delete currentTasks[taskIndex];
    currentCards[taskIndex].remove()
    // console.log(currentTasks)
}
function addCardsToDeskOLD(projectIndex) {
    let cards = document.getElementsByClassName("card");
    const currentProj = projectsList[currentProjectIndex].taskList;
    if (cards.length === currentProj) return;
    if (cards.length === 0) {
        for (const task of currentProj) {
            addCard(task)
        }
    }
    if (currentProj.length > cards.length) {
        let newIndex = cards.length;
        addCard(currentProj[newIndex])
    }
    console.log(cards)
    if (drag) addDrag(cardWrapper, autoSpread)
}
function removeEmptyTasks(projectIndex) {
    projectsList[projectIndex].taskList = (projectsList[projectIndex].taskList).filter((task) => task !== undefined);
}
let currentTimer;
function addCardsToDesk(projectIndex) {
    removeEmptyTasks(projectIndex);
    timers.length = 0;
    updateTimers();
    const currentProjectTasks = projectsList[projectIndex].taskList;
    cardWrapper.replaceChildren("")
    let counter = 0;
    for (const task of currentProjectTasks) {
        task.createCard()
        task.assignedIndex = counter;
        counter++
    }
    if (drag) addDrag(cardWrapper, autoSpread)    
}
function addCard(task) {
    const cardObj = new Element({tag: "article", classes: `card type-${task.type}`});
    const card = cardObj.create();
    populateCard(task, card);
    cardWrapper.append(card);
    task.size = [card.clientWidth, card.clientHeight];
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
    }, 10000);
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
addTask(0, {title: "Checklist", description: "Checklist items go here.", dueDate: "2026-07-24", dueTime: "17:00", type: "checklist"})
addTask(0, {title: "Date Note", description: "A date will be emphasized above with a description and an optional timer.", priority: "High", type: "date", dueDate: "2026-07-28", dueTime: "16:00", timer: true})
addTask(1, {title: "Your new task", type: "note", text: "what"})
// updateTask(0, 0, {title: "1st task new name"})



addCardsToDesk(currentProjectIndex)

// deleteTask(0, 0)

updateProjectList()
updateTaskList()