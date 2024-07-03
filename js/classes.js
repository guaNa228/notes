import { postData, deleteData, patchData } from "./network.js";

export class Tag {
    constructor(id, color, name) {
        this.id = id;
        this.name = name;
        this.color = color;
    }

    delete() {
        deleteData('tags', this.id).then((statusCode) => {
            if (statusCode == 202) {
                return true;
            } else {
                return false;
            }
        });
    }

    Draw(active = false) {
        let element = document.createElement('div');
        element.textContent = this.name;
        element.classList.add('tag');
        element.style.borderColor = `#${this.color}`;
        if (active) {
            element.style.background = `#${this.color}`;
            element.style.color = `white`;
        } else {
            element.style.color = `#${this.color}`;
        }

        return element;
    }
}

export class TagLine {
    constructor(tags, root, activeIds = [], notesRoot, notes) {
        this.notes = notes;
        this.tags = [];
        this.active = [];
        tags.forEach(tag => {
            this.tags.push(tag);
            if (activeIds.includes(tag.id)) {
                this.active.push(tag);
            }
        });
        this.root = root;
        this.notesRoot = notesRoot;
        this.draw();
    }

    getActiveIds() {
        return this.active.reduce((accum, current) => {
            accum.push(current.id);
            return accum;
        }, []);
    }

    draw() {
        this.elements = [];
        this.root.innerHTML = "";
        this.tags.forEach(tag => {
            let element = tag.Draw(this.active.includes(tag));
            element.addEventListener('click', (e) => {
                if (this.active.includes(tag)) {
                    this.active = this.active.filter(currentTag => currentTag != tag);
                    element.style.color = `#${tag.color}`;
                    element.style.background = 'transparent';
                } else {
                    this.active.push(tag);
                    element.style.background = `#${tag.color}`;
                    element.style.color = 'white';
                }

                this.drawNotes();
            });
            this.root.append(element);
        });
    }

    drawNotes() {
        this.notesRoot.innerHTML = "";
        this.notes.forEach((note) => {
            let count = 0;
            this.active.forEach((tag) => {
                count += note.tags.includes(tag);
            });
            if (count == this.active.length) {
                note.draw(this.notesRoot);
            }
        });
    }
}

export class Note {
    constructor(id, title, content, tags, noteForm) {
        console.log(title, tags.length);
        this.id = id;
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.form = noteForm;
    }

    draw(root) {
        this.element = document.createElement("div");
        this.element.classList.add('note')
        this.element.innerHTML = `<h3>${this.title}</h3>
        <p>${this.content}</p>
        <div class="tags">
            ${this.tags.map(tag => `<div title="${tag.name}" style="background: #${tag.color};"></div>`).join('')}
        </div>`;

        let deleteButton = document.createElement("img");
        deleteButton.src = "icons/delete.svg";
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteData('notes', this.id, {});
            this.element.outerHTML = "";
        });

        this.element.append(deleteButton);

        this.element.addEventListener('click', (e) => {
            this.form.setNote(this);
        });

        root.append(this.element);
    }

    addTag(tag) {
        this.tags.push(tag);
        postData('mark', '', { 'noteId': this.id, 'tagId': tag.id });
        this.element.querySelector('.tags').innerHTML = `${this.tags.map(tag => `<div title="${tag.name}" style="background: #${tag.color};"></div>`).join('')}`;
    }

    removeTag(tag) {
        this.tags = this.tags.filter((currentTag) => tag != currentTag);
        deleteData('mark', '', { 'noteId': this.id, 'tagId': tag.id });
        this.element.querySelector('.tags').innerHTML = `${this.tags.map(tag => `<div title="${tag.name}" style="background: #${tag.color};"></div>`).join('')}`;
    }

    edit(title, content) {
        patchData('notes', this.id, { 'title': title, 'content': content });
        this.title = title;
        this.content = content;
        this.element.querySelector('h3').textContent = this.title;
        this.element.querySelector('p').textContent = this.content;
    }
}

export class FormTagLine {
    constructor(tags, root) {
        this.tags = tags;
        this.root = root;
    }

    setNote(note = null) {
        if (note === null) {
            this.note = null;
            this.active = [];
        } else {
            this.note = note;
            this.active = Array.of(...note.tags);
        }
        this.draw(this.root);
    }

    draw() {
        this.root.innerHTML = "";
        this.tags.forEach(tag => {
            let element = tag.Draw(this.active.includes(tag));
            element.addEventListener('click', (e) => {
                if (this.active.includes(tag)) {
                    this.active = this.active.filter(currentTag => currentTag != tag);
                    element.style.color = `#${tag.color}`;
                    element.style.background = 'transparent';
                    if (this.note) {
                        this.note.removeTag(tag);
                    }
                } else {
                    this.active.push(tag);
                    element.style.background = `#${tag.color}`;
                    element.style.color = 'white';
                    if (this.note) {
                        this.note.addTag(tag);
                    }
                }
            });
            this.root.append(element);
        });
    }
}

export class NoteForm {
    constructor(root, tagLine, reload) {
        this.root = root;
        this.root.parentElement.addEventListener('click', (e) => {
            if (e.target !== this.root.parentElement) return;
            this.leave();
        });
        this.tagLine = tagLine;
        this.reload = reload;
    }

    leave() {
        if (this.adding) {
            if (this.root.querySelector('div.title').textContent && this.root.querySelector('div.content').textContent) {
                postData('notes', '', {
                    'title': this.root.querySelector('div.title').textContent,
                    'content': this.root.querySelector('div.content').textContent,
                    'owner': localStorage.getItem('id'),
                    'tagsIds': this.tagLine.active.map((tag) => tag.id)
                });
                this.reload();
            }
        } else {
            if (this.root.querySelector('div.title').textContent != this.note.title ||
                this.root.querySelector('div.content').textContent != this.note.content) {
                this.note.edit(this.root.querySelector('div.title').textContent, this.root.querySelector('div.content').textContent);
            }
        }
        this.root.parentElement.classList.remove('active');
    }

    setNote(note = null) {
        this.root.parentElement.classList.add('active');
        this.adding = note === null;
        if (this.adding) {
            this.tagLine.setNote(null)
        } else {
            this.note = note;
            this.tagLine.setNote(note);
        }
        this.draw();
    }

    draw() {
        if (this.adding) {
            this.root.querySelector('div.title').textContent = '';
            this.root.querySelector('div.content').textContent = '';
        } else {
            console.log(this.note);
            this.root.querySelector('div.title').textContent = this.note.title;
            this.root.querySelector('div.content').textContent = this.note.content;
        }
    }
}

export class TagMenu {
    constructor(tags, root, reload) {
        this.tags = tags;
        this.root = root;
        this.reload = reload;

        this.root.parentElement.parentElement.addEventListener('click', (e) => {
            if (e.target !== this.root.parentElement.parentElement) return;
            this.leave();
        });

        this.elements = [];
    }

    open() {
        this.draw();
        this.root.parentElement.parentElement.classList.add('active');
    }

    add(name) {
        postData('tags', '', { 'name': name, 'owner': localStorage.getItem('id') }).then((code) => {
            if (code == 201) {
                this.reload(true);
            }
        });
    }

    draw() {
        this.root.innerHTML = "";

        this.tags.forEach((tag) => {
            let element = document.createElement('div');
            element.classList.add('tag_option');

            let button = document.createElement('img');
            button.src = 'icons/delete.svg';
            button.addEventListener('click', (e) => {
                //this.tags = this.tags.filter((currentTag) => currentTag != tag);
                deleteData('tags', tag.id, {}).then((code) => {
                    this.reload(true);
                });

            });

            let input = document.createElement('div');
            input.textContent = tag.name;
            input.dataset.placeholder = "Новое название...";
            input.contentEditable = true;
            input.style.color = `#${tag.color}`;

            element.append(button);
            element.append(input);

            this.elements.push(input);

            this.root.append(element);
        });
    }

    leave() {
        let changesCount = 0;
        this.elements.forEach((input, index) => {
            if (input.textContent != this.tags[index].name) {
                patchData('tags', this.tags[index].id, { 'name': input.textContent }).then((code) => {
                    if (code == 200) {
                        changesCount++;
                    }
                });
            }

            if (changesCount > 0) {
                this.reload();
            }
        });

        this.root.parentElement.parentElement.classList.remove('active');
        this.reload();
    }
}
