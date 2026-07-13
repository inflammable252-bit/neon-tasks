import "./style.css"
import "./reset.css"

import { Element, Image, Project, Note, ChecklistNote, DateNote } from "./components.js"
import { format, formatDistance, formatISO, parseISO, getHours } from "date-fns"

const projectsList = []

const body = document.querySelector("body");

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
    const cardWrapper = document.getElementById("card-wrapper");
    for (const task of projectsList[projectIndex].taskList) {
        const card = new Element("article", {classes: "card"}).create()
        populateCard(task, card);
        cardWrapper.append(card)
        task.size = [card.clientWidth, card.clientHeight]
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