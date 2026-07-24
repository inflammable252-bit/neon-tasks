import { format, formatISO } from "date-fns";
export { Element, Image, Input, Label, Project, Note, ChecklistNote, DateNote, debounce, throttle }

//  Elements
class Element {
    constructor({tag, id, classes, text} = {}) {
        this.tag = tag;
        this.id = id;
        this.classes = classes;
        this.text = text;
    }
    create() {
        const element = document.createElement(this.tag);
        this.element = element;
        this.update(this)
        return this.element;
    }
    update({id, classes, text}) {
        if (id) this.element.id = id;
        if (classes) this.element.className = classes;
        if (text) this.element.textContent = text;
    }
    delete() {
        this.element.remove()
    }
}

class Input extends Element {
    constructor({id, classes, text, type, name, required, placeholder, minlength}) {
        super({id, classes, text})
        this.tag = "input";
        this.type = type;
        this.name = name;
        this.required = required;
        this.placeholder = placeholder;
        this.minlength = minlength;
    }
    update({id, classes, text, type, name, required, placeholder, minlength}) {
        super.update({id, classes, text})
        if (type) this.element.type = type;
        if (name) this.element.name = name;
        if (required===true) this.element.setAttribute("required", "");
        if (placeholder) this.element.placeholder = placeholder;
        if (minlength) this.element.minlength;
    }
}
class Label extends Element {
    constructor({id, classes, text, forLink, form}) {
        super({id, classes, text});
        this.tag = "label";
        this.forLink = forLink;
        this.form = form;
    }
    update({id, classes, text, forLink, form}) {
        super.update({id, classes, text})
        if (forLink) this.element.htmlFor = forLink;
        if (form) this.element.form = form;
    }
}

class Image  {
    constructor({id, classes, src, alt, srcsets, sizes}) {
        this.id = id;
        this.classes = classes;
        this.src = src;
        this.alt = alt;
        this.srcset = srcsets; // ["400w", "800w"]
        this.sizes = sizes; // (width <= 800px) 400px, 800px"
        this.img;
    }
    create() {
        const img = document.createElement("img");
        this.img = img;
        this.update(this);
        return this.img
    }
    update({id, classes, src, alt, srcsets, sizes}) {
        if (id) this.img.id = id;
        if (classes) this.img.classes = classes;
        if (src) this.img.src = src;
        if (alt) this.img.alt = alt;
        if (srcsets) this.img.srcset = srcsets;
        if (sizes) this.img.sizes = sizes;
    }
}

// Notes
class Note {
    constructor({title, description, dueDate, dueTime, created, priority, size, position, type}) {
        this.title = title;
        this.description = description;
        this.priority = priority
        this.dueDate = dueDate;
        this.dueTime = dueTime;
        this.created = this.newDate()
        this.size = size;
        this.position = position;
        this.type = type;
    }
    update({title, description, dueDate, dueTime, priority, size, position}) {
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
    constructor({title, description, dueDate, dueTime, created, priority, size, position, type}){
        super({title, description, dueDate, dueTime, priority, size, position})
        this.type = type
    }
}
class DateNote extends Note {
    constructor({title, description, dueDate, dueTime, created, priority, size, position, timer, type}){
        super({title, description, dueDate, dueTime, priority, size, position})
        this.timer = timer
        this.type = "DateNote"
    }
    update({title, description, dueDate, dueTime, priority, size, position, timer}) {
        super.update({title, description, dueDate, dueTime, priority, size, position})
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
    getTasks() {
        return this.taskList
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

const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}

function throttle(fn, delay) {
    let isThr = false;
    return function (...args) {
        if (!isThr) {
            fn.apply(this, args);
            isThr = true;
            setTimeout(() => {
                isThr = false;
            }, delay);
        }
    };
}