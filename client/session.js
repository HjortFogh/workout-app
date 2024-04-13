import { readData, writeData, exists } from "../database/logic.js";
import { caesarCipher } from "./auth.js";
import { createUser } from "../users.js";

let currentUser = null;
let userChanged = true;

function loginAs(username) {
    userChanged = true;
    document.cookie = `logged-in-as=${username};SameSite=Lax`;
    document.location = "/index.html";
}

function logout() {
    userChanged = true;
    document.cookie = `logged-in-as=null;SameSite=Lax`;
    document.location = "/login.html";
}

function tryLogin(username, password, onFailure = () => {}) {
    let cipher = caesarCipher(password);
    readData(
        `/users/${username}/auth/cipher`,
        (dbCipher) => {
            if (dbCipher == cipher) loginAs(username);
            else onFailure();
        },
        onFailure
    );
}

function setNewCurrentUser(username, handler) {
    if (username == "null") {
        currentUser = {};
        if (!String(document.location).endsWith("/login.html")) document.location = "/login.html";
        return;
    }
    readData(`/users/${username}`, (data) => {
        currentUser = data;
        handler(currentUser);
    });
}

function userData(handler) {
    if (userChanged || !currentUser) {
        let match = /logged-in-as=([^;]+)/.exec(document.cookie);
        if (match && match[1]) setNewCurrentUser(match[1], handler);
        userChanged = false;
        return;
    }

    handler(currentUser);
}

function tryCreateUser(username, password, onFailure = () => {}) {
    exists(`/users/${username}`, (doesExist) => {
        if (doesExist) {
            onFailure();
            return;
        }
        writeData(
            `/users/${username}`,
            createUser(username, username, password),
            () => loginAs(username),
            (e) => onFailure()
        );
    });
}

function changeUserRealName(username, newRealname) {
    writeData(`/users/${username}/personal/realname`, newRealname);
    userChanged = true;
}

function addProgram(username, programID) {
    writeData(`/users/${username}/programs/${programID}`, true);
    userChanged = true;
}

function removeProgram(username, programID) {
    writeData(`/users/${username}/programs/${programID}`, false);
    userChanged = true;
}

function getProgramExercises(programID, handler) {
    readData(`/programs/${programID}`, (exerciseIndices) => {
        readData(`/exercises`, (exercises) => {
            let correct = [];
            for (let [key, value] of Object.entries(exercises)) {
                if (key in exerciseIndices) correct.push(value);
            }
            handler(correct);
        });
    });
}

function getProgramExerciseByIndex(programID, index, handler, elseHandler) {
    readData(
        `/programs/${programID}/${index}`,
        (exercise) => {
            readData(`/exercises/${exercise}`, handler, elseHandler);
        },
        elseHandler
    );
}

function getActivePrograms(username, handler) {
    readData(`/users/${username}/programs`, (allPrograms) => {
        let active = Object.keys(allPrograms).filter((programID) => allPrograms[programID]);
        handler(active);
    });
}

function rewardCurrentUser(tbAmount) {
    userData((user) => {
        let tb = user.personal.tb_balance;
        console.log("Setting balance to:", tb + tbAmount);
        writeData(`/users/${user.personal.username}/personal/tb_balance`, tb + tbAmount);
    });
}

window.logout = logout;
window.tryLogin = tryLogin;
window.userData = userData;
window.tryCreateUser = tryCreateUser;
window.changeUserRealName = changeUserRealName;
window.addProgram = addProgram;
window.removeProgram = removeProgram;
window.getProgramExercises = getProgramExercises;
window.getActivePrograms = getActivePrograms;
window.getProgramExerciseByIndex = getProgramExerciseByIndex;
window.rewardCurrentUser = rewardCurrentUser;

// window.onload = userData;

document.onreadystatechange = () => userData(() => {});

export { userData, tryLogin, logout };
