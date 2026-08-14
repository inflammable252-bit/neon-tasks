export { createButtons, modalOn, displayTaskForm, displayProjectForm, displayDelete, zeroProjectError, displayBackup }
import { projectsList, addProject, updateProjectList, deleteTask, updateTaskList, currentProjectIndex, addTask, addCardsToDesk, addCard, deleteActiveTask, deleteActiveProject, projectOrTask, activeIndexToDelete, removeEmptyItems } from "./index.js"
import { Element, Image, Input, Label, Project, Note, ChecklistNote, updateLocalStorage } from "./components.js"
import { addDrag, populateCard } from "./cards.js"

const modalWindow = document.getElementById("modal-window");
const buttonWrapper = document.getElementById("button-wrapper");
let buttons = [];
let buttonSource;
buttonWrapper.addEventListener("click", buttonSwap) 
const form = document.querySelector("form.modal-form");
let select = "note";
function modalOn(state) {
    state==="on" ? modalWindow.showModal() : modalWindow.close()
}
function createButtons(action) {
    buttonSource = action;
    const typeOfNote = projectsList[currentProjectIndex].taskList[activeIndexToDelete]?.type;
    select = typeOfNote ?? "note";
    console.log("Creating buttons", {
        action: action,
        select: select,
    })
    let noteButton = new Element({tag: "button", id: "note-button", classes: "type-button", text: "Note"}).create();
    let checklistButton = new Element({tag: "button", id: "checklist-button", classes: "type-button", text: "Checklist"}).create();
    let dateButton = new Element({tag: "button", id: "date-button", classes: "type-button", text: "Date"}).create();
    buttonWrapper.replaceChildren(noteButton, checklistButton, dateButton);
    if (action === "edit") {
        selectForm(select)
        displayTaskForm()
    }
    else noteButton.className = "type-button selected"
}
function buttonSwap(e) {
        if (buttonSource === "edit") {
            console.log("edit, returning")
            return
        }
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
        selectForm(select)
        displayTaskForm()
}
function selectForm(select) {
    let noteButton = document.getElementById("note-button");
    let checklistButton = document.getElementById("checklist-button");
    let dateButton = document.getElementById("date-button");
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
}
function taskSet(index) {
    let currentList = projectsList[currentProjectIndex].taskList;
    let currentTask = currentList[index];
    let currentIndex = Array.from(currentList).indexOf(currentTask)
    let currentCards = document.querySelectorAll("article.card");
    let currentCard = currentCards[currentIndex];

    return { currentList, currentTask, currentIndex, currentCards, currentCard }
}
function createTaskSubmitButton(action, index) {
    let taskDescription;
    let task = taskSet(index);
    console.log("Editing ", task.currentTask)

    const buttonObj = new Element({tag: "button", id: "submit", text: "Create"});
    const button = buttonObj.create();
    if (action==="edit") {
        button.textContent = "Update"
    }
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
        if (action === "create" && !errorCheck(checkFields, action)) return;
        
        if (action === "create" && (select==="checklist") && checklistItems.length === 0) {
            form.description.style.border = "2px solid rgba(255, 0, 0, 0.61)";
            return
        }
        if (select==="checklist") {
            if (action==="edit") {
                let itemInputs = document.querySelectorAll(".checklist-items input");
                taskDescription = [];
                itemInputs.forEach((item) => {
                    if (item) taskDescription.push(item.value)
                })
            }
            else {
                let checklistItems = document.querySelectorAll("dialog p.card-checklist-item");
                taskDescription = [];
                checklistItems.forEach((item) => {
                    taskDescription.push(item.textContent)
                })
            }
        }
        else {
            taskDescription = form.description.value
        }
        let timerCheck;
        if (select==="date") {
            form["timer"].checked ? timerCheck = "on" : timerCheck="off";
        }
        if (action==="edit") {
            task.currentTask.update({
                title: form.title.value, 
                description: taskDescription, 
                dueDate: form["due-date-input"]?.value,
                dueTime: form["due-time-input"]?.value,
                priority: currentPriority,
                timer: timerCheck,
                type: select,
            })
            task.currentCard.replaceChildren("")
            populateCard(task.currentTask, task.currentCard)
            console.log("Task updated: ", task.currentTask)
        } 
        else {
            addTask(currentProjectIndex, {
                title: form.title.value, 
                description: taskDescription, 
                dueDate: form["due-date-input"]?.value,
                dueTime: form["due-time-input"]?.value,
                priority: currentPriority,
                timer: timerCheck,
                type: select,
            })
            addCard()
            form.reset()
        }
        updateTaskList()
        updateProjectList()
        modalWindow.close()
    })
    return button;
}
function errorCheck([...items], action) {
    const color = "2px solid rgba(255, 0, 0, 0.61)";
    const result = [];
    if (action === "edit") {
        result.push(true);
        return
    }
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
function displayProjectForm(action) {
    buttonWrapper.replaceChildren("");
    form.id = "project-form";
    form.method = "dialog";
    form.replaceChildren("")

    const projNameLabel = new Label({forLink: "proj-title-input", id: "proj-title-label", name: "proj-title-label", text: "Name of Project"}).create()
    const projNameObj = new Input({type: "text", id: "proj-title-input", classes: "proj-form-el", name: "proj-title"})
    const projName = projNameObj.create()
    projName.setAttribute("autocomplete", "off")
    if (action==="edit") {
        projName.value = projectsList[currentProjectIndex].name
    }
    form.append(projNameLabel, projName, createProjectSubmitButton(action))
}

function createProjectSubmitButton(action) {
    const buttonObj = new Element({tag: "button", id: "submit", text: "Create"});
    const button = buttonObj.create();
    if (action==="create") {
        button.addEventListener("click", (e) => {
            let name = form["proj-title"].value;
            e.preventDefault()
            if (!name) return;
            addProject(name)
            updateProjectList()
            modalWindow.close()
        })
    }
    if (action==="edit") {
        button.textContent = "Change"
        button.addEventListener("click", (e) => {
            e.preventDefault()
            let name = form["proj-title"].value;
            if (!name) return;
            projectsList[currentProjectIndex].name = form["proj-title"].value;
            updateLocalStorage()
            updateProjectList()
            modalWindow.close()
            // console.log(form["proj-title"].value)
        })
    }
    return button
}

function getProperty(index, property) {
    const taskProperty = projectsList[currentProjectIndex].taskList[index][property]
    return taskProperty
}
function displayTaskForm(action, index) {
    if (action==="create") select="note"
    form.replaceChildren("");
    form.method = "dialog";
    form.id = `${select}-form`;
    const inputWrapperObj = new Element({tag: "div", classes: "input-wrapper"})
    const inputWrapper = inputWrapperObj.create()

    const titleLabelObj = new Label({forLink: "title-input", id: "title-label", name: "title-label", text: "Name of Task*"});
    const titleLabel = titleLabelObj.create()
    const titleInputObj = new Input({type: "text", name: "title", id: "title-input", classes: "task-form-el", required: true});
    const titleInput = titleInputObj.create();

    if (action==="edit") {
        titleInput.value = getProperty(index, "title");
    }

    inputWrapper.replaceChildren(titleLabel, titleInput, buildDescription(action, index), buildDue(action, index), buildPrioritySlider(action, index), createTaskSubmitButton(action, index))
    form.append(inputWrapper)
}
function buildDescription(action, index) {
    const descriptionDiv = new Element({tag: "div", classes: "description-div"}).create();
    if (form.id==="checklist-form") {
        const descriptionLabel = new Label(
        {forLink: "description-input", id: "description-label", name: "description-label", text: "Checklist Items"}).create();
        const checklistItems = new Element({tag: "div", classes: "checklist-items"}).create();
        checklistItems.name = "checklist-items-wrapper";
        const descriptionInput = new Input({id: "description-input", classes: "task-form-el", type: "text", name: "list-item-input"}).create();
        const addItem = new Element({tag: "button", classes: "checklist-add-item", text: "Add item"}).create();
        descriptionInput.name= "description";
        const addEditItem = new Element({tag: "button", classes: "checklist-add-item", text: "Add item"}).create();
        descriptionInput.name= "description";
            
        addItem.addEventListener("click", (e) => {
            e.preventDefault();
            if (!descriptionInput.value) return;
            const item = new Element({tag: "p", classes: "card-checklist-item", text: descriptionInput.value}).create();
            checklistItems.append(item);
            descriptionInput.value = "";
        })
    
        if (action==="edit") {
            descriptionDiv.append(descriptionLabel)
            getProperty(index, "description").forEach((listItem) => {
                const descriptionInputEdit = new Input({classes: "task-form-el", type: "text", name: "list-item-input"}).create();
                descriptionInputEdit.value = listItem;
                checklistItems.append(descriptionInputEdit)
            })
            addEditItem.addEventListener("click", (e) => {
                e.preventDefault();

                const descriptionInputEdit = new Input({classes: "task-form-el", type: "text", name: "list-item-input"}).create();
                const descriptionInputEdits = document.querySelectorAll(".description-div input");
                const listItemLast = descriptionInputEdits[descriptionInputEdits.length-1];
                
                if (!listItemLast.value) return;
                const newItem = new Input({classes: "task-form-el", type: "text", name: "list-item-input"}).create();
                newItem.value = listItemLast.value;
                checklistItems.append(newItem);
                listItemLast.value = "";
            })
            descriptionDiv.append(checklistItems, descriptionInput, addEditItem)
        }
        else descriptionDiv.append(descriptionLabel, checklistItems, descriptionInput, addItem)
    }
    else {
        const descriptionLabelObj = new Label(
        {forLink: "description-input", id: "description-label", name: "description-label", text: "Task Description*"});
        const descriptionLabel = descriptionLabelObj.create();
        const descriptionInputObj = new Element({tag: "textarea", id: "description-input", classes: "task-form-el"});
        const descriptionInput = descriptionInputObj.create();
        descriptionInput.name="description";
        if (action === "edit") {
            descriptionInput.value = getProperty(index, "description")
        }
        descriptionDiv.append(descriptionLabel, descriptionInput)
    }

    return descriptionDiv;
}
function buildDue(action, index) {
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
    if (action === "edit") {
        dueDate.value = getProperty(index, "dueDate")
        dueTime.value = getProperty(index, "dueTime")
    }
    dueWrapper.append(dueDateLabel, dueDate, dueTime);
    return dueWrapper;
}
let currentPriority = undefined;
function buildPrioritySlider(action, index) {
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
                currentPriority = "None";
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
        console.log("Priority changed to ", currentPriority)
    })

    const priorities = ["None", "Low", "Medium", "High"];
    priorities.forEach((item, itemIndex) => {
        const priorityOption = new Element({tag: "option", class: "priority-option"}).create();
        priorityOption.value = itemIndex;
        priorityOption.label = item;

        const priorityOptionLabel = new Element({tag: "span", class: "priority-option-label", text: item}).create()
        
        priorityMarkers.append(priorityOption)
        priorityMarkerLabels.append(priorityOptionLabel)
    })

    const timerCheckLabelObj = new Label({id: "timer-label", forLink: "timer-check", text: "Timer"});
    const timerCheckLabel = timerCheckLabelObj.create();
    const timerCheckObj = new Input({type: "checkbox", name: "timer", id: "timer-check", value: "on"});
    const timerCheck = timerCheckObj.create();

    if (action === "edit") {
        let sliderValue;
        switch (getProperty(index, "priority")) {
            case ("None"):
                sliderValue = "0";
                break;
            case ("Low"):
                sliderValue = "1";
                break;
            case ("Medium"):
                sliderValue = "2";
                break;
            case ("High"):
                sliderValue = "3";
                break;
        }
        console.log("priority ", getProperty(index, "priority"))
        priority.value = sliderValue;
        if (getProperty(index, "timer") === "on") {
            timerCheck.setAttribute("checked", "")
        }
    }
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
function displayBackup() {
    buttonWrapper.replaceChildren("");
    form.id = "backup-form";
    form.replaceChildren("");

    const p = new Element({tag: "p", text: "Your projects, tasks, and settings are saved on your browser. Back these up by copying and pasting the text into a separate file!"}).create()
    const p2 = new Element({tag: "p", text: "Or, paste your existing backup and hold the 'Apply' button for three seconds."}).create()
    const copyButton = new Element({tag: "button", text: "Copy to clipboard", classes: "backup-button", id: "copy-button"}).create()
    let localStorageText = JSON.stringify(localStorage);
    console.log(localStorage)
    console.log(localStorageText)
    const textBox = new Element({tag: "textarea", id: "backup-text", text: localStorageText}).create();
    textBox.name = "json-text"
    
    const applyButton = new Element({tag: "button", text: "Apply", classes: "backup-button", id: "apply-button"}).create();

    function applyNewJson() {
        const toJson = JSON.parse(form["json-text"].value);
        for (const [key, value] of Object.entries(toJson)) {
            localStorage.setItem(key, value)
        }
    }
    function copy() {
        navigator.clipboard.writeText(form["json-text"].value)
    }
    copyButton.addEventListener("click", (e) => {
        e.preventDefault()
        textBox.select()
        copyButton.textContent = "Copied!"
        copy()
    })

    let timer;
    function hold() {
        applyButton.textContent = "Applying..."
        timer = setTimeout(() => {
            applyNewJson()
            modalWindow.close()
            window.location.reload()
        }, 3000);
    }
    function cancel() {
        applyButton.textContent = "Apply"
        clearTimeout(timer)
    }
    applyButton.addEventListener("click", (e) => e.preventDefault())
    applyButton.addEventListener("mousedown", (e) => hold())
    applyButton.addEventListener("mouseup", (e) => {
        cancel()
        e.preventDefault()
    })
    applyButton.addEventListener("mouseleave", (e) => cancel())
    applyButton.addEventListener("touchstart", (e) => hold())
    applyButton.addEventListener("touchend", (e) => {
        e.preventDefault()
        cancel()
    })

    form.append(p, p2, textBox, copyButton, applyButton)
    textBox.select()
}