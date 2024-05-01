import { userData } from "./session.js";

// Udskift alle templates på siden med det tilsvarene information i brugen, f.eks. {{personal.username}} bliver til "BrugeNavn123"
function replaceTemplate(element, userdata) {
    let result = element.innerText.replace(/\{\{(.*?)\}\}/g, (substr) => {
        let key = substr.slice(2, -2);
        return key.split(".").reduce((o, k) => (o || {})[k], userdata);
    });
    element.innerText = result;
}

// Udskift alle templates når vinduet indlæses
window.onload = function () {
    userData((userdata) => {
        let allTemplates = document.getElementsByClassName("template");
        for (let template of allTemplates) replaceTemplate(template, userdata);
    });
};
