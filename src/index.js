import "./style.css"
import "./reset.css"

export { drag }
import { populateCard, addDrag } from "./cards.js";
import { Element, Image, Input, Label, Project, Note, ChecklistNote, DateNote } from "./components.js";

let autoSpread = true;
let drag = true;
let mode = "dawn"
const projectsList = []
const currentProjectIndex = 0;

const body = document.querySelector("body");
const cardWrapper = document.getElementById("card-wrapper");
const isMobile = window.matchMedia("(pointer: coarse)").matches;
const modeSelect = document.getElementById("mode-select")
const modalWindow = document.getElementById("modal-window");

modeSelect.addEventListener("change", (e) => {
    changeTheme(e.target.value)
    mode = e.target.value;
    console.log(mode)
})
const dragToggle = document.getElementById("drag");
dragToggle.addEventListener("change", (e) => {
    e.target.checked === true ? drag = true : drag = false;
})

function updateProjectList() {
    const list = document.querySelector("#projects-list ul");
    projectsList.forEach((item) => {
        // console.log("item: ", item)
        const projectObj = new Element({tag: "li", classes: "project-item", text: item.name})
        const project = projectObj.create();
        list.append(project)
    })
    const buttonObj = new Element({tag: "button", id: "create-project", text: "Create Project"})
    const button = buttonObj.create();
    list.append(button)
}

function updateTaskList() {
    const list = document.querySelector("#tasks-list ul");
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
    const closeButton = document.getElementById("close-modal");
    closeButton.addEventListener("click", () => modalWindow.close())
    modalWindow.showModal()
    if (e.target.id === "create-task") displayTaskForm()
}
function displayTaskForm() {
    const formObj = new Element({tag: "form", id: "task-form"});
    const form = formObj.create();
    form.method = "dialog";
    const inputWrapperObj = new Element({tag: "div", classes: "input-wrapper"})
    const inputWrapper = inputWrapperObj.create()
    
    const titleInputObj = new Input({type: "text", id: "title-input", classes: "task-form-el", required: true});
    console.log(titleInputObj)
    const titleInput = titleInputObj.create();
    const titleLabelObj = new Label({forLink: "title-input", id: "title-label", name: "title-label", text: "Name of Task"});
    const titleLabel = titleLabelObj.create()
    const descriptionInputObj = new Input({type: "text", id: "description-input", name: "description-input", classes: "task-form-el"});
    const descriptionInput = descriptionInputObj.create();
    const dueDateObj = new Input({type: "date", id: "due-date-input", name: "due-date-input", classes: "task-form-el"});
    const dueDate = dueDateObj.create();


    inputWrapper.append(titleLabel, titleInput, descriptionInput, dueDate)
    form.append(inputWrapper)
    modalWindow.append(form)
}

// displayTaskCreation()

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
    projectsList[projectIndex].taskList.splice(taskIndex, 1)
}
function addCardsToDesk(projectIndex) {
    for (const task of projectsList[projectIndex].taskList) {
        const card = new Element("article", {classes: `card ${task.type.toLowerCase()}`}).create();
        populateCard(task, card);
        cardWrapper.append(card);
        task.size = [card.clientWidth, card.clientHeight];
    }
    if (drag) addDrag(cardWrapper, autoSpread)
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
}

addProject("Your First Project")
addProject("Your Second Project")
addTask(0, {title: "Your first note!", description: "Note description goes here.", priority: "Low", type: "Note"})
addTask(0, {title: "Checklist", description: "Checklist items go here.", dueDate: "2026-08-10T22:21:30-07:00", type: "Checklist"})
addTask(0, {title: "Date Note", description: "A date will be emphasized above with a description and an optional timer.", priority: "High", type: "DateNote", dueDate: "2026-07-15T22:21:30-07:00", timer: true})
updateTask(0, 0, {title: "1st task new name"})

addCardsToDesk(currentProjectIndex)
updateProjectList()
updateTaskList()