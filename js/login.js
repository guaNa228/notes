import { postData } from '../js/network.js'

let loginInput = document.querySelector('form input:first-child');
let passwordInput = document.querySelector('form input[type="password"]');

let button = document.querySelector('button');

button.addEventListener('click', (e) => {
    e.preventDefault();
    postData('login', '', { 'login': loginInput.value, 'password': passwordInput.value }, true).then((id) => {
        if (isNaN(id)) {
            console.log(id);
        } else {
            localStorage.setItem('id', id);
            window.location.replace(window.location.origin);
        }
    });
});