import { formatISO } from "date-fns";
export { Element, Image, Project, Note, ChecklistNote, DateNote }

//  Elements
class Element {
    constructor(tag, {id = undefined, classes = "", text = "", event, callback}) {
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
    constructor({title, description, dueDate, created, priority, size, position, type}) {
        this.title = title;
        this.description = description;
        this.priority = priority
        this.dueDate = dueDate;
        this.created = this.newDate()
        this.size = size;
        this.position = position;
        this.type = type;
    }
    update({title, description, dueDate, priority, size, position}) {
        if (title) this.title = title;
        if (description) this.description = description;
        if (priority) this.priority = priority
        if (dueDate) this.dueDate = dueDate;
        if (size) this.size = size;
        if (position) this.position = position;
    }
    newDate() {
        if (!this.created) {
            return formatISO(new Date())
        }
    }
}
class ChecklistNote extends Note {
    constructor({title, description, dueDate, created, priority, size, position, type}){
        super({title, description, dueDate, priority, size, position})
        this.type = type
    }
}
class DateNote extends Note {
    constructor({title, description, dueDate, created, priority, size, position, timer, type}){
        super({title, description, dueDate, priority, size, position})
        this.timer = timer
        this.type = "DateNote"
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
        let newTask;
        switch (task.type) {
            case "Note":
                newTask = new Note(task);
                break;
                case "Checklist":
                newTask = new ChecklistNote(task);
                break;
                case "DateNote":
                newTask = new DateNote(task);
                break;
        }
        this.taskList.push(newTask);
    }
}


/*
projectsList structure
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