import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyC3xhw0scsJEjILVanwQ7NpSwuCmHw-wps",
    authDomain: "workout-app-3d86e.firebaseapp.com",
    databaseURL: "https://workout-app-3d86e-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "workout-app-3d86e",
    storageBucket: "workout-app-3d86e.appspot.com",
    messagingSenderId: "8586098998",
    appId: "1:8586098998:web:1d34a301c7b88510715b97",
};

initializeApp(firebaseConfig);
const database = getDatabase();

function errorHandler(msg) {
    console.warn(msg);
}

function readData(path, handler) {
    get(ref(database, path)).then((snapshot) => {
        if (snapshot.exists()) handler(snapshot.toJSON());
        else errorHandler(`Failed to read resource: '${path}'`);
    });
}

function writeData(path, data, handler = () => {}) {
    set(ref(database, path), data)
        .then(handler)
        .catch((error) => errorHandler(error));
}

function deleteData(path, handler = () => {}) {
    remove(ref(database, path))
        .then(handler)
        .catch((error) => errorHandler(error));
}

export { readData, writeData, deleteData };
