// Hent Firebases API
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

// Firebase Realtime config
const firebaseConfig = {
    apiKey: "AIzaSyC3xhw0scsJEjILVanwQ7NpSwuCmHw-wps",
    authDomain: "workout-app-3d86e.firebaseapp.com",
    databaseURL: "https://workout-app-3d86e-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "workout-app-3d86e",
    storageBucket: "workout-app-3d86e.appspot.com",
    messagingSenderId: "8586098998",
    appId: "1:8586098998:web:1d34a301c7b88510715b97",
};

// Initialiser Firebase-applikationen og lav en ny database
initializeApp(firebaseConfig);
const database = getDatabase();

// Funktion til generel fejl-håndtering, som printer fejlen til consolen
function errorHandler(msg) {
    console.warn(msg);
}

// En funktion til at læse data fra databasen
function readData(path, handler, _errorHandler = errorHandler) {
    get(ref(database, path)).then((snapshot) => {
        if (snapshot.exists()) handler(snapshot.toJSON());
        else _errorHandler(`Failed to read resource: '${path}'`);
    });
}

// En funktion til at skrive data til databasen
function writeData(path, data, handler = () => {}, _errorHandler = errorHandler) {
    set(ref(database, path), data)
        .then(handler)
        .catch((error) => _errorHandler(error));
}

// En funktion til at fjerne data fra databasen
function deleteData(path, handler = () => {}) {
    remove(ref(database, path))
        .then(handler)
        .catch((error) => errorHandler(error));
}

// En funktion til at tjekke om en værdi eksistere i databasen
function exists(path, handler) {
    get(ref(database, path)).then((snapshot) => handler(snapshot.exists()));
}

// Eksporter funktionerne til ekstern brug
export { readData, writeData, deleteData, exists };
