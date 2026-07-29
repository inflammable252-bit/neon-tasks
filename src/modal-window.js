export { createButtons, modalOn, displayTaskForm, displayProjectForm }
import { projectsList, addProject, updateProjectList, updateTaskList, currentProjectIndex, drag, addTask, addCardsToDesk } from "./index.js"
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
    })
    buttonWrapper.replaceChildren(noteButton, checklistButton, dateButton)
    return buttonWrapper;
}
function createTaskSubmitButton() {
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
    projName.setAttribute("autocomplete", "off")
    form.append(projNameLabel, projName, createProjectSubmitButton())
}

function createProjectSubmitButton() {
    const buttonObj = new Element({tag: "button", id: "submit", text: "Create"});
    const button = buttonObj.create();
    button.addEventListener("click", (e) => {
        let name = form["proj-title"].value;
        console.log(name)
        addProject(name)
        updateProjectList()
    })

    return button
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

    inputWrapper.replaceChildren(titleLabel, titleInput, descriptionLabel, descriptionInput, buildDue(), buildPrioritySlider(), createTaskSubmitButton())
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