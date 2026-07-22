// Card builder functions
export { populateCard, addDrag, displayTaskForm }
import { drag } from "./index.js";
import { Element, Label, Input, Image, Project, Note, ChecklistNote, DateNote, debounce, throttle } from "./components.js";
import { format, formatDistance, formatISO, parseISO, getHours } from "date-fns";

function populateCard(task, card) {
    const titleObj = new Element({tag: "h4", classes: "card-header", text: task.title});
    const title = titleObj.create();
    const descriptionObj = new Element({tag: "p", classes: "card-text", text: task.description});
    const description = descriptionObj.create()
    
    const creation = format(task.created, "MM/dd/yyyy")
    const createdDateObj = new Element({tag: "p", classes: "card-created", text: creation});
    const createdDate = createdDateObj.create();
    card.position = "relative";
    
    if (task.type === "DateNote") {
        card.append(title, createdDate, createCardTimeDiv(task,card), description);
        return
    }
    else card.append(title, createdDate, description, createCardTimeDiv(task, card));
}
function createCardTimeDiv(task, card) {
    const timeSectionObj = new Element({tag: "div", classes: "card-time-section"})
    const timeSection = timeSectionObj.create();

    const deadlineHeadObj = new Element({tag: "p", classes: "card-deadline-head", text: "Deadline: "})
    const deadlineHead = deadlineHeadObj.create()
    if (task.dueDate) {
        if (task.type === "DateNote") {
            const dueDate = format(task.dueDate, "MM/dd/yyyy");
            const dueTime = format(task.dueDate, "hh:dd aaa");
            const dueDateEleObj = new Element({tag: "p", classes: "card-due", text: dueDate});
            const dueDateEle = dueDateEleObj.create();
            const dueTimeEleObj = new Element({tag:"p", classes: "card-due-time", text: dueTime});
            const dueTimeEle = dueTimeEleObj.create();
            timeSection.append(dueDateEle, dueTimeEle)
        }
        else {
            const dueDate = (format(task.dueDate, 'MM/dd/yyyy')) + ", " + (format(task.dueDate, "hh:dd aaa"));
            const dueDateEleObj = new Element({tag: "p", classes: "card-due", text: dueDate});
            const dueDateEle = dueDateEleObj.create();
            timeSection.append(deadlineHead, dueDateEle)
        }
    }
    if (task.priority) {
        const priorityObj = new Element({tag: "p", classes: "card-priority", text: "Priority: " + task.priority});const priority = priorityObj.create();
        timeSection.append(priority)
    }
    if (task.timer) {
        const timerEleObj = new Element({tag: "p", classes: "card-timer", text: "Time left: " + formatDistance(task.created, task.dueDate)});
        const timerEle = timerEleObj.create();
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

// Card Modal Window

const modalWindow = document.getElementById("modal-window");
let select;

function createButtons() {
    const buttonWrapper = new Element({tag: "div", id: "button-wrapper"}).create()
    const noteButton = new Element({tag: "button", id: "note-button", classes: "type-button selected", text: "Note"}).create();
    const checklistButton = new Element({tag: "button", id: "checklist-button", classes: "type-button", text: "Checklist"}).create();
    const dateButton = new Element({tag: "button", id: "date-button", classes: "type-button", text: "Date"}).create();

    buttonWrapper.addEventListener("click", (e) => {
        if (e.target.tagName !== "BUTTON") return
        switch (e.target.id) {
            case ("note-button"):
                select = "note"
                break;
            case ("checklist-button"):
                select = "checklist";
                break;
            case ("date-button"):
                select = "date";
                break;
        }
        console.log(select)
    })

    buttonWrapper.append(noteButton, checklistButton, dateButton)
    return buttonWrapper;
}
function displayTaskForm() {

    modalWindow.showModal()

    modalWindow.append(createButtons())

    const formObj = new Element({tag: "form", id: "task-form"});
    const form = formObj.create();
    form.method = "dialog";
    const inputWrapperObj = new Element({tag: "div", classes: "input-wrapper"})
    const inputWrapper = inputWrapperObj.create()
    
    const titleLabelObj = new Label(
        {forLink: "title-input", id: "title-label", name: "title-label", text: "Name of Task"});
    const titleLabel = titleLabelObj.create()
    const titleInputObj = new Input({type: "text", id: "title-input", classes: "task-form-el", required: true});
    console.log(titleInputObj)
    const titleInput = titleInputObj.create();

    const descriptionLabelObj = new Label(
        {forLink: "description-input", id: "description-label", name: "description-name", text: "Task Description"});
    const descriptionLabel = descriptionLabelObj.create();
    const descriptionInputObj = new Element({tag: "textarea", id: "description-input", name: "description-input", classes: "task-form-el"});
    const descriptionInput = descriptionInputObj.create();

    inputWrapper.replaceChildren(titleLabel, titleInput, descriptionLabel, descriptionInput, buildDue(), buildPrioritySlider())
    form.append(inputWrapper)
    modalWindow.append(form)
}
function buildDue() {
    const dueWrapper = new Element({tag: "div", id: "due-wrapper"}).create();

    const dueDateLabelObj = new Label(
    {forLink: "due-date-input", id: "due-date-label", name: "due-date-label", text: "Due"}
    )
    const dueDateLabel = dueDateLabelObj.create();
    const dueDateObj = new Input({type: "date", id: "due-date-input", name: "due-date-input", classes: "task-form-el"});
    const dueDate = dueDateObj.create();

    const dueTimeLabelObj = new Label(
        {forLink: "due-time-input", id: "due-time-label", name: "due-time-label", text: "Due"}
    )
    const dueTimeLabel = dueTimeLabelObj.create();
    const dueTimeObj = new Input({type: "time", id: "due-time-input", name: "due-time-input", classes: "task-form-el"});
    const dueTime = dueTimeObj.create();

    dueWrapper.append(dueDateLabel, dueDate, dueTime);
    return dueWrapper;
}

function buildPrioritySlider() {
    const priorityWrapper = new Element({tag: "div", id: "priority-wrapper"}).create()
    const priorityLabelObj = new Label({id: "priority-label", forLink: "priority-list", text: "Priority"})
    const priorityLabel = priorityLabelObj.create();
    const priorityObj = new Input({type: "range", id: "priority-list", text: "Priority"});
    const priority = priorityObj.create();
    priority.min = 0;
    priority.max = 2;
    priority.step = 1;
    priority.value = 1;
    priority.setAttribute("list", "priority-markers");
    const priorityMarkers = new Element({tag: "datalist", id: "priority-markers"}).create();
    const priorityMarkerLabels = new Element({tag: "div", id: "priority-marker-labels"}).create()
    priority.addEventListener("change", (e) => {
        console.log(e.target.value)
    })

    const priorities = ["Low", "Normal", "High"];
    priorities.forEach((item, index) => {
        const priorityOption = new Element({tag: "option", class: "priority-option"}).create();
        priorityOption.value = index;
        priorityOption.label = item;

        const priorityOptionLabel = new Element({tag: "span", class: "priority-option-label", text: item}).create()

        priorityMarkers.append(priorityOption)
        priorityMarkerLabels.append(priorityOptionLabel)
    })
    priorityWrapper.append(priorityLabel, priority, priorityMarkers, priorityMarkerLabels);
    return priorityWrapper;
}