import { postData } from '../js/network.js'

let loginInput = document.querySelector('form input:first-child');
let passwordInputs = document.querySelectorAll('form input[type="password"]');

let button = document.querySelector('button');

button.addEventListener('click', (e) => {
    e.preventDefault();
    if (passwordInputs[0].value == passwordInputs[1].value) {
        postData('register', '', { 'login': loginInput.value, 'password': passwordInputs[0].value }, true).then((id) => {
            if (isNaN(id)) {
                console.log(id);
            } else {
                localStorage.setItem('id', id);
            }

            window.location.replace(window.location.origin);
        });
    } else {
        loginInput.value = "";
        passwordInputs[0].value = "";
        passwordInputs[1].value = "";
    }
});