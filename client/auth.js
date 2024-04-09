function caesarCipher(password, shift = 42) {
    let chars = "abcdefghijklmnopqrstuvwxyzæøåABCDEFGHIJKLMNOPQRSTUVXYZÆØÅ0123456789,;.:-_!#¤%&/()=?";
    return password.replace(/./gs, (char) => chars.charAt((chars.indexOf(char) + shift) % chars.length));
}

export { caesarCipher };
