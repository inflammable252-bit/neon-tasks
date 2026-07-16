// Card builder functions
export { populateCard, addDrag }
import { drag } from "./index.js";
import { Element, Image, Project, Note, ChecklistNote, DateNote, debounce, throttle } from "./components.js";
import { format, formatDistance, formatISO, parseISO, getHours } from "date-fns";

function populateCard(task, card) {
    const title = new Element("h4", {classes: "card-header", text: task.title}).create()
    const description = new Element("p", {classes: "card-text", text: task.description}).create()
    
    const creation = format(task.created, "MM/dd/yyyy")
    const createdDate = new Element("p", {classes: "card-created", text: creation}).create()
    card.position = "relative";
    
    if (task.type === "DateNote") {
        card.append(title, createdDate, createCardTimeDiv(task,card), description);
        return
    }
    else card.append(title, createdDate, description, createCardTimeDiv(task, card));
}
function createCardTimeDiv(task, card) {
    const timeSection = new Element("div", {classes: "card-time-section"}).create();

    const deadlineHead = new Element("p", {classes: "card-deadline-head", text: "Deadline: "}).create()
    if (task.dueDate) {
        if (task.type === "DateNote") {
            const dueDate = format(task.dueDate, "MM/dd/yyyy");
            const dueTime = format(task.dueDate, "hh:dd aaa");
            const dueDateEle = new Element("p", {classes: "card-due", text: dueDate}).create()
            const dueTimeEle = new Element("p", {classes: "card-due-time", text: dueTime}).create()
            timeSection.append(dueDateEle, dueTimeEle)
        }
        else {
            const dueDate = (format(task.dueDate, 'MM/dd/yyyy')) + ", " + (format(task.dueDate, "hh:dd aaa"));
            const dueDateEle = new Element("p", {classes: "card-due", text: dueDate}).create();
            timeSection.append(deadlineHead, dueDateEle)
        }
    }
    if (task.priority) {
        const priority = new Element("p", {classes: "card-priority", text: "Priority: " + task.priority}).create();
        timeSection.append(priority)
    }
    if (task.timer) {
        const timerEle = new Element("p", {classes: "card-timer", text: "Time left: " + formatDistance(task.created, task.dueDate)}).create()
        timeSection.append(timerEle)
    }
    return timeSection;
}

// Card drag adapted from:
// https://srivastavayushmaan1347.medium.com/blog-title-creating-a-draggable-div-element-with-javascript-88f3be51bbf9

function addDrag(container, autoSpread) {
const cards = document.querySelectorAll(".card");
const sidebar = document.getElementById("sidebar")
const nav =  document.querySelector("nav");
const header = document.querySelector("header");
cards.forEach((card) => {
    let offsetX, offsetY;
    card.addEventListener("pointerdown", (e) => {
            console.log(drag)
            if (!drag) return;
            let sidebarOffsetX = (sidebar.getBoundingClientRect().right) || 0;
            let navOffsetY = nav.getBoundingClientRect().top;
            let headerOffsetY = nav.getBoundingClientRect().bottom;
            offsetX = e.clientX - card.getBoundingClientRect().left + sidebarOffsetX;
            offsetY = e.clientY - card.getBoundingClientRect().top;
            card.position = [offsetX, offsetY]
            container.addEventListener("pointermove", pointerMoveHandler);
            container.addEventListener("pointerup", pointerupHandler)
            card.style.transition = "";
            console.log(offsetY)
        });

        function pointerMoveHandler(e) {
            card.style.left = e.clientX - offsetX + "px";
            card.style.top = e.clientY - offsetY + "px";
            card.style.position = "absolute"
        }
        function pointerupHandler() {
            container.removeEventListener("pointermove", pointerMoveHandler);
            container.removeEventListener("pointerup", pointerupHandler)
            getCardPositions()
            if (autoSpread) window.addEventListener("resize", debounce(adjustCardPositions, 2000))
            card.style.transition = "all 0.4s ease-in-out";
        }
    })
    function getCardPositions() {
        cards.forEach((card) => {
            card.dataset.x = parseInt(card.style.left) / container.getBoundingClientRect().width;
            card.dataset.y = parseInt(card.style.top) / container.getBoundingClientRect().height;
        })
    }

    const adjustCardPositions = () => {
        console.log("Running: ", Date().now)
        cards.forEach((card) => {
            let oldXRatio = card.dataset.x
            let oldYRatio = card.dataset.y
            let newX = (oldXRatio * container.getBoundingClientRect().width);
            let newY = (oldYRatio * container.getBoundingClientRect().height);
            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if ((newX + card.clientWidth) >= container.getBoundingClientRect().width) newX -= card.clientWidth / 2;
            if ((newY + card.clientHeight) >= container.getBoundingClientRect().height) newY -= card.clientHeight / 2;
            card.style.left = newX + "px";
            card.style.top =  newY + "px";
        })
    }
}