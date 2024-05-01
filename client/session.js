// Importer funktioner eksternt
import { readData, writeData, exists } from "../database/logic.js";
import { caesarCipher } from "./auth.js";
import { createUser } from "../users.js";

// Den nuværende bruger og en boolsk værdi som fortæller hvorvidt brugeren skiftede
let currentUser = null;
let userChanged = true;

// Login som en bruger
function loginAs(username) {
    userChanged = true;
    document.cookie = `logged-in-as=${username};SameSite=Lax`;
    document.location = "/index.html";
}

// Log ud
function logout() {
    userChanged = true;
    document.cookie = `logged-in-as=null;SameSite=Lax`;
    document.location = "/login.html";
}

// Prøv at logge in med et brugernavn og kodeord
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

// Check om en bruger er loget ind lige nu
function isLoggedIn() {
    return document.cookie.includes("logged-in-as=") && !document.cookie.includes("logged-in-as=null");
}

// Set den nuværende bruger
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

// Returner brugerdata givet den nuværende bruger
function userData(handler) {
    if (userChanged || !currentUser) {
        let match = /logged-in-as=([^;]+)/.exec(document.cookie);
        if (match && match[1]) setNewCurrentUser(match[1], handler);
        userChanged = false;
        return;
    }

    handler(currentUser);
}

// Prøv at lav en bruger og returer en fejl hvis en brugere allerede eksistere
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

// Skift en brugers rigtige navn
function changeUserRealName(username, newRealname) {
    writeData(`/users/${username}/personal/realname`, newRealname);
    userChanged = true;
}

// Tilføj et program til en bruger
function addProgram(username, programID) {
    writeData(`/users/${username}/programs/${programID}`, true);
    userChanged = true;
}

// Fjern et program fra en bruger
function removeProgram(username, programID) {
    writeData(`/users/${username}/programs/${programID}`, false);
    userChanged = true;
}

// Få alle øvelser i et program
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

// Få en specifik øvelse givet primær-id'et
function getProgramExerciseByIndex(programID, index, handler, elseHandler) {
    readData(
        `/programs/${programID}/${index}`,
        (exercise) => {
            readData(`/exercises/${exercise}`, handler, elseHandler);
        },
        elseHandler
    );
}

// Få en liste af aktive programmer
function getActivePrograms(username, handler) {
    readData(`/users/${username}/programs`, (allPrograms) => {
        let active = Object.keys(allPrograms).filter((programID) => allPrograms[programID]);
        handler(active);
    });
}

// Giv en belønning til den nuværende bruger
function rewardCurrentUser(tbAmount) {
    userData((user) => {
        let tb = user.personal.tb_balance;
        console.log("Setting balance to:", tb + tbAmount);
        writeData(`/users/${user.personal.username}/personal/tb_balance`, tb + tbAmount);
    });
}

// Gør funktionerne globalt tilgængelige
window.logout = logout;
window.tryLogin = tryLogin;
window.isLoggedIn = isLoggedIn;
window.userData = userData;
window.tryCreateUser = tryCreateUser;
window.changeUserRealName = changeUserRealName;
window.addProgram = addProgram;
window.removeProgram = removeProgram;
window.getProgramExercises = getProgramExercises;
window.getActivePrograms = getActivePrograms;
window.getProgramExerciseByIndex = getProgramExerciseByIndex;
window.rewardCurrentUser = rewardCurrentUser;

document.onreadystatechange = () => userData(() => {});

export { userData, tryLogin, logout };
