import { readData } from "../database/logic.js";
import { caesarCipher } from "./auth.js";

let currentUser = null;
let userChanged = true;

function loginAs(username) {
    userChanged = true;
    document.cookie = `logged-in-as=${username};SameSite=Lax`;
}

function logout() {
    userChanged = true;
    document.cookie = `logged-in-as=null;SameSite=Lax`;
}

function tryLogin(username, password) {
    let cipher = caesarCipher(password);
    readData(`/users/${username}/auth/cipher`, (dbCipher) => {
        if (dbCipher == cipher) loginAs(username);
        else logout();
    });
}

function setNewCurrentUser(username, handler) {
    if (username == "null") {
        currentUser = {};
        // TODO: Redirect to login-page
        return;
    }
    readData(`/users/${username}`, (data) => {
        currentUser = data;
        handler(currentUser);
    });
}

function userData(handler) {
    if (userChanged) {
        let match = /logged-in-as=([^;]+)/.exec(document.cookie);
        if (match && match[1]) setNewCurrentUser(match[1], handler);
        userChanged = false;
        return;
    }

    handler(currentUser);
}

window.logout = logout;
window.tryLogin = tryLogin;

export { userData, tryLogin, logout };
