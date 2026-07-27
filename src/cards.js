// Card builder functions
export { modalOn, populateCard, addDrag, displayTaskForm, displayProjectForm }
import { projectsList, updateProjectList, updateTaskList, currentProjectIndex, addTask, addCardsToDesk, drag } from "./index.js";
import { Element, Label, Input, Image, Project, Note, ChecklistNote, DateNote, debounce, throttle } from "./components.js";
import { format, formatDistance, formatISO, parseISO, getHours, compareAsc } from "date-fns";

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
        const dueMsg = "Time left: " + formatDistance(task.created, formatISO(task.due));
        const pastDueMsg = "Past due: " + formatDistance(task.created, formatISO(task.due));
        let msg;
        let color;
        // note: 1 if the first date is after the second, -1 if the first date is before the second or 0 if dates are equal.
        console.log(task.created, task.due)
        switch (compareAsc(task.created, task.due)) {
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
        const timerEleObj = new Element({tag: "p", classes: "card-timer", text: msg});
        const timerEle = timerEleObj.create();
        timerEle.style.color = color;
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
const buttonWrapper = document.getElementById("button-wrapper");
const form = document.querySelector("form.modal-form");
let select = "note";
function modalOn(state) {
    state==="on" ? modalWindow.showModal() : modalWindow.close()
}
function createButtons() {
    select = "note";
    const noteButton = new Element({tag: "button", id: "note-button", classes: "type-button selected", text: "Note"}).create();
    const checklistButton = new Element({tag: "button", id: "checklist-button", classes: "type-button", text: "Checklist"}).create();
    const dateButton = new Element({tag: "button", id: "date-button", classes: "type-button", text: "Date"}).create();

    buttonWrapper.addEventListener("click", (e) => {
        if (e.target.tagName !== "BUTTON") return
        for (const button of buttonWrapper.children) {
            button.classList.remove("selected")
        }
        switch (e.target.id) {
            case ("note-button"):
                select = "note";
                break;
            case ("checklist-button"):
                select = "checklist";
                break;
            case ("date-button"):
                select = "date";
                break;
            }
        switch (select) {
            case ("note"):
                noteButton.className = "type-button selected";
                form.id = "note-form"
                break;
            case ("checklist"):
                checklistButton.className = "type-button selected";
                form.id = "checklist-form";
                break;
            case ("date"):
                dateButton.className = "type-button selected";
                form.id = "date-form";
                break;
        }
    })
    buttonWrapper.replaceChildren(noteButton, checklistButton, dateButton)
    return buttonWrapper;
}
function createSubmitButton() {
    const buttonObj = new Element({tag: "button", id: "submit", text: "Create"});
    const button = buttonObj.create();
    button.addEventListener("click", (e) => {
        e.preventDefault();
        if (form.title.value && form.description.value) {
            addTask(currentProjectIndex, {
                title: form.title.value, 
                description: form.description.value, 
                dueDate: form["due-date-input"]?.value,
                dueTime: form["due-time-input"]?.value,
                priority: currentPriority,
                timer: form.timer?.value,
                type: select,
             })
        }
        if (!errorCheck(form.title, form.description)) return
        form.reset()
        addCardsToDesk(currentProjectIndex)
        updateProjectList()
        updateTaskList()
        modalWindow.close()
    })
    return button;
}
function errorCheck(item1, item2) {
    const color = "2px solid rgba(255, 0, 0, 0.61)";
    let result;
    if (!item1.value) {
            item1.style.border = color;
            result = false;
        }
    if (!item2.value) {
        item2.style.border = color;
        result = false;
    }
    else {
        resetErrors(item1, item2)
        result = true;
    }
    return result
}
function resetErrors(item1, item2) {
    item1.style.border = "none"
    item2.style.border = "none"
}
function displayProjectForm() {
    buttonWrapper.replaceChildren("");
    form.id = "project-form";
    form.method = "dialog";
    form.replaceChildren("")

    const projNameLabel = new Label({forLink: "proj-title-input", id: "proj-title-label", name: "proj-title-label", text: "Name of Project"}).create()
    const projNameObj = new Input({type: "text", id: "project-title-input", classes: "proj-form-el", name: "proj-title"})
    const projName = projNameObj.create()

    
    const buttonObj = new Element({tag: "button", id: "proj-submit", text: "Create"});
    const button = buttonObj.create();
    button.addEventListener("click", (e) => {})
    form.append(projNameLabel, projName, button)
}

function displayTaskForm() {
    createButtons()
    
    if (form.id === `${select}-form`) return;
    form.replaceChildren("");
    form.method = "dialog";
    form.id = `${select}-form`;
    const inputWrapperObj = new Element({tag: "div", classes: "input-wrapper"})
    const inputWrapper = inputWrapperObj.create()
    
    const titleLabelObj = new Label({forLink: "title-input", id: "title-label", name: "title-label", text: "Name of Task"});
    const titleLabel = titleLabelObj.create()
    const titleInputObj = new Input({type: "text", name: "title", id: "title-input", classes: "task-form-el", required: true});
    console.log(titleInputObj)
    const titleInput = titleInputObj.create();

    const descriptionLabelObj = new Label(
        {forLink: "description-input", id: "description-label", name: "description-label", text: "Task Description"});
    const descriptionLabel = descriptionLabelObj.create();
    const descriptionInputObj = new Element({tag: "textarea", id: "description-input", classes: "task-form-el"});
    const descriptionInput = descriptionInputObj.create();
    descriptionInput.name= "description";

    inputWrapper.replaceChildren(titleLabel, titleInput, descriptionLabel, descriptionInput, buildDue(), buildPrioritySlider(), createSubmitButton())
    form.append(inputWrapper)
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
let currentPriority;
function buildPrioritySlider() {
    const priorityAndTimerWrapper = new Element({tag: "div", id: "priority-wrapper"}).create()
    const priorityLabelObj = new Label({id: "priority-label", forLink: "priority-list", text: "Priority"})
    const priorityLabel = priorityLabelObj.create();
    const priorityObj = new Input({type: "range", id: "priority-list", text: "Priority"});
    const priority = priorityObj.create();
    priority.min = 0;
    priority.max = 3;
    priority.step = 1;
    priority.setAttribute("list", "priority-markers");
    priority.setAttribute("value", "0");
    const priorityMarkers = new Element({tag: "datalist", id: "priority-markers"}).create();
    const priorityMarkerLabels = new Element({tag: "div", id: "priority-marker-labels"}).create()
    priority.addEventListener("change", (e) => {
        switch (e.target.value) {
            case ("0"):
                currentPriority = "";
                break;
            case ("1"):
                currentPriority = "Low";
                break;
            case ("2"):
                currentPriority = "Medium";
                break;
            case ("3"):
                currentPriority = "High";
                break;
        }
    })

    const priorities = ["None", "Low", "Medium", "High"];
    priorities.forEach((item, index) => {
        const priorityOption = new Element({tag: "option", class: "priority-option"}).create();
        priorityOption.value = index;
        priorityOption.label = item;

        const priorityOptionLabel = new Element({tag: "span", class: "priority-option-label", text: item}).create()

        priorityMarkers.append(priorityOption)
        priorityMarkerLabels.append(priorityOptionLabel)
    })

    const timerCheckLabelObj = new Label({id: "timer-label", forLink: "timer-check", text: "Timer"});
    const timerCheckLabel = timerCheckLabelObj.create();
    const timerCheckObj = new Input({type: "checkbox", name: "timer", id: "timer-check", value: "on"});
    const timerCheck = timerCheckObj.create();

    priorityAndTimerWrapper.append(priorityLabel, priority, priorityMarkers, priorityMarkerLabels, timerCheckLabel, timerCheck);
    return priorityAndTimerWrapper;
}