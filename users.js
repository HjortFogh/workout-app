import { caesarCipher } from "./client/auth.js";

function createUser(username, realname, password) {
    let cipher = caesarCipher(password);
    return { auth: { cipher }, personal: { username, realname, tb_balance: 100 }, social: { friends: [] } };
}

export { createUser };
