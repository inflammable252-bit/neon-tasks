export { Element, Image, Project, Note, ChecklistNote, DateNote }

//  Elements
class Element {
    constructor(tag, {id = undefined, classes = "", text = "", event, callback} = {}) {
        this.tag = tag;
        this.id = id;
        this.classes = classes;
        this.text = text;
        this.event = event;
        this.callback = callback;
        this.element;
    }
    create() {
        const element = document.createElement(this.tag);
        this.element = element;
        this.update(this)
        return this.element;
    }
    update({id, classes, text, event, callback}) {
        if (id) this.element.id = id;
        if (classes) this.element.className = classes;
        if (text) this.element.textContent = text;
        if (event) {
            this.element.addEventListener(this.event, () => this.callback())
        }
    }
    delete() {
        this.element.remove()
    }
}
class Image {
    constructor({src, alt, srcsets = ["400w", "800w"], sizes = "(width <= 800px) 400px, 800px"}) {
        if (src) this.src = src;
        if (alt) this.alt = alt;
        if (srcsets) this.srcset = srcsets;
        if (sizes) this.sizes = sizes;
    }
    create() {
        const img = document.createElement("img");
        this.update()
        return img;
    }
    update({src, alt, srcsets, sizes}) {
        if (src) this.src = src;
        if (alt) this.alt = alt;
        if (srcsets) this.srcset = srcsets;
        if (sizes) this.sizes = sizes;
    }
}

// Notes
class Note {
    constructor({title, description, dueDate, priority, size, position}) {
        this.title = title;
        this.description = description;
        this.priority = priority
        this.dueDate = dueDate;
        this.size = size;
        this.position = position;
    }
    update({title, description, dueDate, priority, size, position}) {
        if (title) this.title = title;
        if (description) this.description = description;
        if (priority) this.priority = priority
        if (dueDate) this.dueDate = dueDate;
        if (size) this.size = size;
        if (position) this.position = position;
    }

}
class ChecklistNote extends Note {
    constructor({title, description, dueDate, priority, size, position}){
        super({title, description, dueDate, priority, size, position})

    }
}
class DateNote extends Note {
    constructor({title, description, dueDate, priority, size, position, timer}){
        super({title, description, dueDate, priority, size, position})
        this.timer = timer
    }
    update({title, description, dueDate, priority, size, position, timer}) {
        super.update({title, description, dueDate, priority, size, position})
        if (timer) this.timer = timer;
    }
    
}

class Project {
    constructor(name, color = "default") {
        this.name = name
        this.color = "default"
        this.taskList = [];
    }
    addTaskToList(task) {
        const newTask = new Note(task);
        this.taskList.push(newTask);
    }
}
function addProject(projectName) {
    const newProject = new Project(projectName);
    projectsList.push(newProject)
}
function addTask(projectIndex, task) {
    projectsList[projectIndex].addTaskToList(task)
}
function updateTask(projectIndex, taskIndex, update) {
   projectsList[projectIndex].taskList[taskIndex].update(update)
}

const projectsList = []
addProject("Your First Project")
addProject("Your Second Project")
addTask(0, {title: "1st task", description: "description"})
addTask(0, {title: "Another task", description: "description 2"})
updateTask(0, 0, {title: "1st task new name"})
console.log(projectsList)

/*
projectsList
[
  Project {
    name: 'Your First Project',
    color: 'default',
    taskList: [ [Note], [Note] ]
  },
  Project {
    name: 'Your Second Project',
    color: 'default',
    taskList: []
  }
]
*/