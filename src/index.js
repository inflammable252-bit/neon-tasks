import "./style.css"
import "./reset.css"

import { Element, Image, Project, Note, ChecklistNote, DateNote } from "./components.js"
import { format, formatDistance, formatISO, parseISO, getHours } from "date-fns"

let autoSpread = true;
const projectsList = []

const body = document.querySelector("body");
const cardWrapper = document.getElementById("card-wrapper");

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
        const card = new Element("article", {classes: "card"}).create();
        populateCard(task, card);
        cardWrapper.append(card);
        task.size = [card.clientWidth, card.clientHeight];
        console.log(task)
    }
}
function populateCard(task, card) {
    const title = new Element("h4", {classes: "card-header", text: task.title}).create()
    const description = new Element("p", {classes: "card-text", text: task.description}).create()
    const priority = new Element("p", {classes: "card-priority", text: task.priority}).create()

    const creation = formatISO(task.created, {representation: "date"}) + ", " + (formatISO(task.created, {representation: "time"})).slice(0,5)
    const createdDate = new Element("p", {classes: "card-created", text: creation}).create()
    const dueDate = new Element("p", {classes: "card-due", text: task.dueDate}).create()
    card.append(title, createdDate, description, priority)
    card.position = "relative"
    if (task.timer) {
        const timerEle = new Element("p", {classes: "card-timer", text: "Time left: " + formatDistance(task.created, task.dueDate)}).create()
        card.append(timerEle)
    }
}

addProject("Your First Project")
addProject("Your Second Project")
addTask(0, {title: "Your first note!", description: "Note description goes here.", priority: "Low", type: "Note"})
addTask(0, {title: "Checklist", description: "Checklist items go here.", dueDate: "2026-08-10T22:21:30-07:00", type: "Checklist"})
addTask(0, {title: "Date Note", description: "A date will be emphasized here with a description and an optional timer.", type: "DateNote", dueDate: "2026-07-15T22:21:30-07:00", timer: true})
updateTask(0, 0, {title: "1st task new name"})

addCardsToDesk(0)

// Card drag adapted from:
// https://srivastavayushmaan1347.medium.com/blog-title-creating-a-draggable-div-element-with-javascript-88f3be51bbf9

const cards = document.querySelectorAll(".card");
const isMobile = window.matchMedia("(pointer: coarse)").matches;

cards.forEach((card) => {
    let offsetX, offsetY;
    card.addEventListener("pointerdown", (e) => {
        offsetX = e.clientX - card.getBoundingClientRect().left;
        offsetY = e.clientY - card.getBoundingClientRect().top;
    
        card.position = [offsetX, offsetY]
        console.log(card.getBoundingClientRect().left)

        cardWrapper.addEventListener("pointermove", pointerMoveHandler);
        cardWrapper.addEventListener("pointerup", pointerupHandler)
        card.style.transition = "";
    });

    function pointerMoveHandler(e) {
        card.style.left = e.clientX - offsetX + "px";
        card.style.top = e.clientY - offsetY + "px";
        card.style.position = "absolute"
    }
    function pointerupHandler() {
        cardWrapper.removeEventListener("pointermove", pointerMoveHandler);
        cardWrapper.removeEventListener("pointerup", pointerupHandler)
        getCardPositions()
        if (autoSpread) window.addEventListener("resize", throttle(adjustCardPositions), 1000)
        card.style.transition = "all 0.4s ease-in-out";
    }
})
function getCardPositions() {
    cards.forEach((card) => {
        card.dataset.x = parseInt(card.style.left) / cardWrapper.getBoundingClientRect().width;
        card.dataset.y = parseInt(card.style.top) / cardWrapper.getBoundingClientRect().height;
    })
}
const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}
function throttle(fn, delay) {
    let isThr = false;
    return function (...args) {
        if (!isThr) {
            fn.apply(this, args);
            isThr = true;
            setTimeout(() => {
                isThr = false;
            }, delay);
        }
    };
}
const adjustCardPositions = debounce((e) => {
    cards.forEach((card) => {
        let oldXRatio = card.dataset.x
        let oldYRatio = card.dataset.y
        let newX = (oldXRatio * cardWrapper.getBoundingClientRect().width);
        let newY = (oldYRatio * cardWrapper.getBoundingClientRect().height);
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if ((newX + card.clientWidth) >= cardWrapper.getBoundingClientRect().width) newX -= card.clientWidth / 2;
        if ((newY + card.clientHeight) >= cardWrapper.getBoundingClientRect().height) newY -= card.clientHeight / 2;
        card.style.left = newX + "px";
        card.style.top =  newY + "px";
        console.log("previous x ", oldXRatio)
        console.log("new x ", newX)
        console.log("card x ", card.style.left)
    })
}, 1000)

function changeTheme(theme) {
    const root = document.documentElement;
    let newBg = `--bg-${theme}`;
    let newBgColor = `--bg-${theme}-color`;
    let newDark = `--theme-${theme}-dark`;
    let newColor =  `--theme-${theme}-color`;
    let newOp = `--theme-${theme}-op`;
    let newFont = `--theme-${theme}-font`
    root.style.setProperty("--bg-current", `var(${newBg})`);
    root.style.setProperty("--bg-current-color", `var(${newBgColor})`);
    root.style.setProperty("--theme-current-dark", `var(${newDark})`);
    root.style.setProperty("--theme-current-color", `var(${newColor}`);
    root.style.setProperty("--theme-current-op", `var(${newOp})`);
    root.style.setProperty("--theme-current-font", `var(${newFont})`);
}
const modeSelect = document.getElementById("mode-select")
modeSelect.addEventListener("change", (e) => {
    changeTheme(e.target.value)
})