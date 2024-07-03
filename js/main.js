import { getData } from "./network.js";
import { Tag, TagLine, Note, FormTagLine, NoteForm, TagMenu } from "./classes.js";

let tags;
let notes;
let tagLine;
let formTagLine;
let noteForm;
let tagsMenu;

let notesRoot = document.querySelector('.notes');
let tagsRoot = document.querySelector('.taglist');
let formTagsRoot = document.querySelector('.note_form .form_tags');
let noteFormRoot = document.querySelector('.note_form');
let tagsMenuRoot = document.querySelector('.tag_options');

let addButton = document.querySelector('.add');
let tagMenuButton = document.querySelector('.labels');
let logoutButton = document.querySelector('.logout');

addButton.addEventListener('click', (e) => {
    noteForm.setNote(null);
});

tagMenuButton.addEventListener('click', (e) => {
    tagsMenu.open();
});

logoutButton.addEventListener('click', (e) => {
    localStorage.removeItem('id');
    window.location.replace(window.location.origin + '/login');
});

function updateTags(open = false) {
    getData('tags', localStorage.getItem('id')).then((tagsResolved) => {
        tags = tagsResolved.map((tagData) => new Tag(tagData.id, tagData.color, tagData.name));
        tagsMenu = new TagMenu(tags, tagsMenuRoot, updateTags);

        document.querySelector('.add_tag img').addEventListener('click', () => {
            tagsMenu.add(document.querySelector('.add_tag div').textContent);
        });

        if (open) {
            document.querySelector('.add_tag div').textContent = "";
            tagsMenu.draw();
        }

        updateNotes();
    });

};

function updateNotes() {
    getData('notes', localStorage.getItem('id')).then((notesResolved) => {
        formTagLine = new FormTagLine(tags, formTagsRoot);
        noteForm = new NoteForm(noteFormRoot, formTagLine, updateTags);
        notes = notesResolved.map((noteData) => new Note(noteData.id, noteData.title, noteData.content, noteData.tagsIds.map(tagId => tags.filter(tag => tag.id == tagId)[0]), noteForm));
        updateDOM();

        fullNotes = Array.from(notes);
        adjustSearch.call(searchInput);
    });
};

function updateDOM() {
    tagLine = new TagLine(tags, tagsRoot, tagLine ? tagLine.getActiveIds() : [], notesRoot, notes);
    tagLine.drawNotes();
}

updateTags();

let searchInput = document.querySelector('.search input');
let fullNotes;
let up = false;

searchInput.addEventListener('input', adjustSearch);

function adjustSearch(e) {
    console.log(this.value.length, up)
    if (this.value.length == 1 && !up) {
        console.log(1);
        fullNotes = Array.of(...notes);
        up = true;
    }

    if (this.value.length == 0 && up) {
        notes = Array.from(fullNotes);
        up = false;
    } else {
        notes = fullNotes.filter((note) => note.title.toLowerCase().includes(this.value.toLowerCase()) || note.content.toLowerCase().includes(this.value.toLowerCase()));
    }

    updateDOM();
}
