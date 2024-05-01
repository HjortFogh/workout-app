import { caesarCipher } from "./client/auth.js";

// Lav en ny bruger-dictionary som kan tilføjes til databasen eksternt
function createUser(username, realname, password) {
    let cipher = caesarCipher(password);
    return { auth: { cipher }, personal: { username, realname, tb_balance: 100 }, social: { friends: [] } };
}

export { createUser };
