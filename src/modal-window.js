export { createButtons, modalOn, displayTaskForm, displayProjectForm, displayDelete, zeroProjectError }
import { projectsList, addProject, updateProjectList, deleteTask, updateTaskList, currentProjectIndex, addTask, addCardsToDesk, addCard, deleteActiveTask, deleteActiveProject, projectOrTask, activeIndexToDelete, removeEmptyItems } from "./index.js"
import { Element, Image, Input, Label, Project, Note, ChecklistNote } from "./components.js"

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
        displayTaskForm()
    })
    buttonWrapper.replaceChildren(noteButton, checklistButton, dateButton)
    return buttonWrapper;
}
function createTaskSubmitButton() {
    const buttonObj = new Element({tag: "button", id: "submit", text: "Create"});
    const button = buttonObj.create();
    button.addEventListener("click", (e) => {
        e.preventDefault();
        const noteFields = [form.title, form.description];
        const dateFields = [...noteFields, form["due-date-input"], form["due-time-input"]];
        const checklistFields = [form.title];
        let checkFields;
        switch (select) {
            case ("date"):
                checkFields = dateFields;
                break;
            case ("note"):
                checkFields = noteFields;
                break;
            case ("checklist"):
                checkFields = checklistFields;
                break;
        }
        if (!errorCheck(checkFields)) return;
        const checklistItems = document.querySelectorAll("dialog p.card-checklist-item");
        console.log("check ", checklistItems)
        if ((select==="checklist") && checklistItems.length === 0) {
            form.description.style.border = "2px solid rgba(255, 0, 0, 0.61)";
            return
        }
        let taskDescription;
        if (select==="checklist") {
            taskDescription = [];
            checklistItems.forEach((item) => {
                taskDescription.push(item.textContent)
            })
        }
        else {
            taskDescription = form.description.value
        }
        let timerCheck;
        if (select==="date") {
            ((form["timer"].checked) && (timerCheck = "on"));
        }
        addTask(currentProjectIndex, {
            title: form.title.value, 
            description: taskDescription, 
            dueDate: form["due-date-input"]?.value,
            dueTime: form["due-time-input"]?.value,
            priority: currentPriority,
            timer: timerCheck || undefined,
            type: select,
        })
        addCard()
        updateProjectList()
        updateTaskList()
        form.reset()
        modalWindow.close()
    })
    return button;
}
function errorCheck([...items]) {
    const color = "2px solid rgba(255, 0, 0, 0.61)";
    const result = [];
    items.forEach((item) => {
        if (!item.value) {
            item.style.border = color;
            result.push(false)
        }
        else {
        item.style.border = "none"
            result.push(true)
        }
    })
    return result.every((item) => item === true)
}
function displayProjectForm() {
    buttonWrapper.replaceChildren("");
    form.id = "project-form";
    form.method = "dialog";
    form.replaceChildren("")

    const projNameLabel = new Label({forLink: "proj-title-input", id: "proj-title-label", name: "proj-title-label", text: "Name of Project"}).create()
    const projNameObj = new Input({type: "text", id: "project-title-input", classes: "proj-form-el", name: "proj-title"})
    const projName = projNameObj.create()
    projName.setAttribute("autocomplete", "off")
    form.append(projNameLabel, projName, createProjectSubmitButton())
}

function createProjectSubmitButton() {
    const buttonObj = new Element({tag: "button", id: "submit", text: "Create"});
    const button = buttonObj.create();
    button.addEventListener("click", (e) => {
        e.preventDefault()
        let name = form["proj-title"].value;
        if (!name) return;
        addProject(name)
        updateProjectList()
        modalWindow.close()
    })
    return button
}

function displayTaskForm() {
    form.replaceChildren("");
    form.method = "dialog";
    form.id = `${select}-form`;
    const inputWrapperObj = new Element({tag: "div", classes: "input-wrapper"})
    const inputWrapper = inputWrapperObj.create()

    const titleLabelObj = new Label({forLink: "title-input", id: "title-label", name: "title-label", text: "Name of Task*"});
    const titleLabel = titleLabelObj.create()
    const titleInputObj = new Input({type: "text", name: "title", id: "title-input", classes: "task-form-el", required: true});
    const titleInput = titleInputObj.create();
    inputWrapper.replaceChildren(titleLabel, titleInput, buildDescription(), buildDue(), buildPrioritySlider(), createTaskSubmitButton())
    form.append(inputWrapper)
}
function buildDescription() {
    const descriptionDiv = new Element({tag: "div", classes: "description-div"}).create();
    const checklistItems = new Element({tag: "div", classes: "checklist-items"}).create();
    checklistItems.name = "checklist-items-wrapper";
    if (form.id==="checklist-form") {
        const descriptionLabel = new Label(
        {forLink: "description-input", id: "description-label", name: "description-label", text: "Checklist Items"}).create();
        const descriptionInput = new Input({id: "description-input", classes: "task-form-el", type: "text", name: "list-item-input"}).create();
        const addItem = new Element({tag: "button", classes: "checklist-add-item", text: "Add item"}).create();
        descriptionInput.name= "description";
        
        addItem.addEventListener("click", (e) => {
            e.preventDefault();
            if (!descriptionInput.value) return;
            const item = new Element({tag: "p", classes: "card-checklist-item", text: descriptionInput.value}).create();
            checklistItems.append(item);
            descriptionInput.value = "";
        })
        
        const descriptionInputDiv = new Element({tag: "div", classes: "checklist-input-div"}).create()
        descriptionDiv.append(descriptionLabel, checklistItems, descriptionInput, addItem)
    }
    else {
        const descriptionLabelObj = new Label(
        {forLink: "description-input", id: "description-label", name: "description-label", text: "Task Description"});
        const descriptionLabel = descriptionLabelObj.create();
        const descriptionInputObj = new Element({tag: "textarea", id: "description-input", classes: "task-form-el"});
        const descriptionInput = descriptionInputObj.create();
        descriptionInput.name= "description";
        descriptionDiv.append(descriptionLabel, descriptionInput)
    }

    return descriptionDiv;
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
    console.log("timerCheck ", timerCheck)

    priorityAndTimerWrapper.append(priorityLabel, priority, priorityMarkers, priorityMarkerLabels, timerCheckLabel, timerCheck);
    return priorityAndTimerWrapper;
}

function displayDelete() {
    if (projectOrTask === "project" && projectsList.length === 1) {
        zeroProjectError()
        return;
    }
    buttonWrapper.replaceChildren("");
    form.replaceChildren("");
    form.id = "confirm-delete-form";
    const confirmText = new Element({tag: "p", classes: "confirm-text", text: "Delete?"}).create();
    const deleteButton = new Element({tag: "button", text: "Delete", id: "delete-button"}).create();
    const cancelButton = new Element({tag: "button", text: "Cancel", id: "cancel-button"}).create();
    const buttons = new Element({tag: "div", id: "delete-buttons-wrapper"}).create();
    deleteButton.addEventListener("click", (e) => {
        e.preventDefault();
        (projectOrTask === "task" && deleteActiveTask());
        (projectOrTask === "project" && deleteActiveProject());
        removeEmptyItems();
        updateProjectList()
        modalWindow.close()
    })
    cancelButton.addEventListener("click", (e) => {
        e.preventDefault()
        modalWindow.close()
    })

    buttons.append(deleteButton, cancelButton);
    form.append(confirmText, buttons)
}
function zeroProjectError() {
    buttonWrapper.replaceChildren("");
    form.replaceChildren("");
    form.id = "error-no-form";
    const errorText = new Element({tag: "p", classes: "confirm-text", text: "Create a new project before deleting the current project."}).create();
    const closeButton = new Element({tag: "button", text: "Close", id: "cancel-button"}).create();
    closeButton.addEventListener("click", (e) => {
        e.preventDefault()
        modalWindow.close()
    })

    form.append(errorText, closeButton)
}