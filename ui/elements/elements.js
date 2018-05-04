//import * as fs from "fs";
var fs = require('fs');
var elementlist;
//Main startup function
function setupCustomElements() {
    getElementList();
}
function getElementList() {
    fs.readFile(__dirname + '\\elements/elements-list.json', 'utf-8', (err, data) => {
        if (err) {
            return console.error(err);
            //TODO: throw some other error to the user
        }
        if (elementlist = JSON.parse(data)) {
            getCriticalElements();
        }
        else {
            elementlist = [];
        }
    });
}
function getCriticalElements() {
    elementlist.forEach(element => {
        if (element['critical']) {
            //Element is critical and thus must be preloaded
            fs.readFile(element['uri'], 'utf-8', (err, data) => {
                if (err) {
                    return console.error(err);
                    //TODO: throw some other error to the user
                }
                let actualHTML = data.substr(data.indexOf('\n'));
                registerElement(actualHTML, element['name']);
            });
        }
    });
}
function registerElement(htmlBody, elementName) {
    customElements.define(elementName, class extends HTMLElement {
        constructor() {
            super();
            let doc = document.implementation.createHTMLDocument(elementName);
            doc.body.innerHTML = htmlBody;
            let template = document.getElementById(elementName);
            let templateContent = template.content;
            const shadowRoot = this.attachShadow({ mode: "open" })
                .appendChild(templateContent.cloneNode(true));
        }
    });
    console.log(customElements);
}
