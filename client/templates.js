import { userData } from "./session.js";

function replaceTemplate(element, userdata) {
    let result = element.innerText.replace(/\{\{(.*?)\}\}/g, (substr) => {
        let key = substr.slice(2, -2);
        return key.split(".").reduce((o, k) => (o || {})[k], userdata);
    });
    element.innerText = result;
}

window.onload = function () {
    userData((userdata) => {
        let allTemplates = document.getElementsByClassName("template");
        for (let template of allTemplates) replaceTemplate(template, userdata);
    });
};
