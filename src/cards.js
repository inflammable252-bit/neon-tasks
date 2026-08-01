// Card builder functions
export { populateCard, addDrag, timers, getDue }
import { Element, Label, Input, Image, Project, Note, ChecklistNote, DateNote, debounce, throttle } from "./components.js";
import { format, formatDistance, formatISO, parseISO, compareAsc } from "date-fns";

const timers = [];

function populateCard(task, card) {
    const titleObj = new Element({tag: "h4", classes: "card-header", text: task.title});
    const title = titleObj.create();
    
    const creation = format(task.created, "MM/dd/yyyy")
    const createdDateObj = new Element({tag: "p", classes: "card-created", text: creation});
    const createdDate = createdDateObj.create();
    card.position = "relative";
    
    if (task.type === "DateNote") {
        card.append(title, createdDate, createCardTimeDiv(task,card), createDescription(task));
        return
    }
    else card.append(title, createdDate, createDescription(task), createCardTimeDiv(task, card));
}
function createDescription(task) {
    if (task.type === "checklist") {
        return createChecklist(task)
    }
    else {
        const descriptionObj = new Element({tag: "p", classes: "card-text", text: task.description});
        const description = descriptionObj.create()
        return description
    }
}
function createChecklist(task) {
    const items = task.description;
        const ul = new Element({tag: "ul", classes: "card-checklist"}).create();
        items.forEach((item) => {
            const li = new Element({tag: "li", classes: "card-checklist-item", text: item}).create();
            li.addEventListener("click", () => {
                li.classList.toggle("checked");
            })
            ul.append(li)
        })
        return ul;
}
function createCardTimeDiv(task, card) {
    const timeSectionObj = new Element({tag: "div", classes: "card-time-section"})
    const timeSection = timeSectionObj.create();

    const deadlineHeadObj = new Element({tag: "p", classes: "card-deadline-head", text: "Deadline: "})
    const deadlineHead = deadlineHeadObj.create()
    if (task.dueDate) {
        if (task.type === "DateNote") {
            const dueDate = format(parseISO(task.dueDate), "MM/dd/yyyy");
            const dueTime = task.dueTime;
            const due = task.due;
            const dueDateEleObj = new Element({tag: "p", classes: "card-due", text: dueDate});
            const dueDateEle = dueDateEleObj.create();
            const dueTimeEleObj = new Element({tag:"p", classes: "card-due-time", text: dueTime});
            const dueTimeEle = dueTimeEleObj.create();
            timeSection.append(dueDateEle, dueTimeEle)
        }
        else {
            const due = task.due;
            const dueDateEleObj = new Element({tag: "p", classes: "card-due", text: due});
            const dueDateEle = dueDateEleObj.create();
            timeSection.append(deadlineHead, dueDateEle)
        }
    }
    if (task.priority) {
        const priorityObj = new Element({tag: "p", classes: "card-priority", text: "Priority: " + task.priority});const priority = priorityObj.create();
        timeSection.append(priority)
    }
    if (task.timer) {
        let dueInfo = getDue(task);
        const timerEleObj = new Element({tag: "p", classes: "card-timer", text: dueInfo.getMsg()});
        const timerEle = timerEleObj.create();
        timers.push([task, timerEle])
        timerEle.style.color = dueInfo.getColor();
        timeSection.append(timerEle)
    }
    return timeSection;
}

function getDue(task) {
    let msg;
    let color;
    calcDiffAndColor()
    function calcDiffAndColor() {
        let now = new Date()
        const dueMsg = "Time left: " + formatDistance(formatISO(task.due), now);
        const pastDueMsg = "Past due: " + formatDistance(now, formatISO(task.due));
        // note: 1 if the first date is after the second, -1 if the first date is before the second or 0 if dates are equal.
        switch (compareAsc(now, task.due)) {
            case (1):
                msg = pastDueMsg;
                color = "rgba(255,125,125,0.8)";
                break;
            case (-1):
                msg = dueMsg;
                break;
            case (0):
                msg = "Due today"
                color = "rgba(255, 189, 103, 0.78)";
                break;
        }
    }
    function getMsg() {
        return msg
    }
    function getColor() {
        return color;
    }
        return { calcDiffAndColor, getMsg, getColor }
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
            if (!drag) return;
            if (e.target.tagName === "LI") return;
            let sidebarOffsetX = (sidebar.getBoundingClientRect().right) || 0;
            let navOffsetY = nav.getBoundingClientRect().top;
            let headerOffsetY = nav.getBoundingClientRect().bottom;
            offsetX = e.clientX - card.getBoundingClientRect().left + sidebarOffsetX;
            offsetY = e.clientY - card.getBoundingClientRect().top;
            card.position = [offsetX, offsetY]
            container.addEventListener("pointermove", pointerMoveHandler);
            container.addEventListener("pointerup", pointerupHandler)
            card.style.transition = "";
            // console.log(offsetY)
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