//import * as fs from "fs";
var fs = require('fs');
var elementlist : Array<Node>;

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
        } else {
            elementlist = [];
        }
    });
}

function getCriticalElements() {
    elementlist.forEach(element => {
        if (element['critical']) {
            //Element is critical and thus must be preloaded
            fs.readFile(element['uri'], 'utf-8', (err, data : string) => {
                if (err) {
                    return console.error(err);
                    //TODO: throw some other error to the user
                }
                let actualHTML = data.substr(data.indexOf('\n')+1);
                actualHTML.replace(/\n|\r/g, "");
                registerElement(actualHTML, element['name']);
            });
        }
    });
}

function registerElement(htmlBody : string, elementName : string) {
    customElements.define(elementName,
        class extends HTMLElement {
            constructor() {
                super();
                let doc = document.implementation.createHTMLDocument(elementName);
                doc.body.innerHTML = htmlBody;
                let template : HTMLElement = doc.getElementById(elementName);
                let templateContent : Node = template.content;
                const shadowRoot = this.attachShadow({mode : "open"})
                .appendChild(templateContent.cloneNode(true));
            }
        }
    );
    let el = document.createElement('sidebar-element-header');
    let span = document.createElement("span");
    span.slot = "header_text";
    span.innerHTML = "Playback Controls";
    span.className = "header_text";
    el.appendChild(span);
    document.getElementById("sidebar").appendChild(el);
}