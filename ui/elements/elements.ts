///<reference path="../apiwrapper/ts/onload.ts" /> 

//import * as fs from "fs";
var fs = require('fs');

class CustomElement {
    name : string;
    content : Array<Element> = [];

    constructor(name : string, elements : Array<Element>) {
        this.name = name;
        this.content = elements;
    }

    populateSlots(slots : Array<Element>) {
        var j = 0;
        for (var i = 0; i < this.content.length; i++) {
            var nodes = this.content[i].getElementsByTagName("*");
            for (var k = 0; k < nodes.length; k++) {
                if (nodes[k].nodeName === "slot") {
                    nodes[k].parentElement.replaceChild(slots[j++], nodes[k]);
                }
            }
        }
    }

    getElement(container : Element) {
        return this.appendChildren(container, this.content);
    }

    appendChildren(container : Element, childnodes : Array<Element>) {
        for (var node of childnodes) {
            container.innerHTML += node.outerHTML;
        }
        return container;
    }
}

interface ElementsArray {
    [key: string]: CustomElement;
}

class CustomElementsDatabase {

    styles : HTMLStyleElement;

    elements : ElementsArray = {};

    constructor() {
        this.styles = document.createElement("style");
        if (document.body) 
            document.body.appendChild(this.styles);
    }

    registerElement(templatedata : HTMLTemplateElement, elementname : string) {
        var content : Array<Element> = [];
        var childnodes = templatedata.children;
        var stylesheet : Element;
        var flag = false;
        for (var node of childnodes) {
            if (node.nodeName === "style") {
                stylesheet = node;
            }
            if (node.id == "begincontent") {
                flag = true;
                continue;
            }
            if (flag) {
                content.push(node);
            }
        }

        this.styles.appendChild(stylesheet.childNodes[0]);

        let element = new CustomElement(elementname, content);

        this.elements[elementname] = element;
    }

    getElement(name : string) {
        return this.elements[name];
    }
}

var database : CustomElementsDatabase;
var elementlist : any;

//Main startup function
addLoadEvent(() => {
    database = new CustomElementsDatabase();
    getElementList();
});

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
            fs.readFile(__dirname + element['uri'], 'utf-8', (err, data : string) => {
                if (err) {
                    return console.error(err);
                    //TODO: throw some other error to the user
                }
                let actualHTML = data.substr(data.indexOf('\n')+1);
                actualHTML.replace(/\n|\r/g, "");
                actualHTML.trim();
                registerElement(actualHTML, element['name']);
            });
        }
    });
}

function registerElement(htmlBody : string, elementName : string) {
   /*  customElements.define(elementName,
        class extends HTMLElement {
            constructor() {
                super();
                let doc = document.implementation.createHTMLDocument(elementName);
                doc.body.innerHTML = htmlBody;
                let template : HTMLTemplateElement = doc.getElementById(elementName);
                let templateContent : Node = template.content;
                const shadowRoot = this.attachShadow({mode : "open"});
                shadowRoot.appendChild(templateContent.cloneNode(true));
            }   
        }
    ); */
    var parser = new DOMParser()
    , doc = parser.parseFromString(htmlBody, "text/xml");
    var template = doc.getElementById(elementName);

    database.registerElement(<HTMLTemplateElement>template, elementName);

/*     let span = document.createElement("span");
    span.slot = "header_text";
    span.innerHTML = "Playback Controls";
    span.className = "header_text";

    let slots = [span];

    let element = database.getElement(elementName);
    element.populateSlots(slots);

    let container = document.createElement("div");
    container.className = "sidebar_entry";

    let c = document.getElementById("sidebar").appendChild(element.getElement(container)); */
}