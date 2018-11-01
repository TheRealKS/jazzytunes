///<reference path="../apiwrapper/ts/onload.ts" /> 
//import * as fs from "fs";
var fs = require('fs');
/**
 * Represents one instance of a custom element
 */
class CustomElement {
    constructor(name, elements) {
        this.content = [];
        this.name = name;
        this.content = elements;
    }
    /**
     * Populates the available slots in this custom element
     * @param slots Array of slot elements, in order of appeareance
     */
    populateSlots(slots) {
        var j = 0;
        for (var i = 0; i < this.content.length; i++) {
            var nodes = this.content[i].getElementsByTagName("*");
            for (var k = 0; k < nodes.length; k++) {
                if (nodes[k].nodeName === "slot") {
                    console.log(typeof slots[j]);
                    nodes[k].parentElement.replaceChild(slots[j++], nodes[k]);
                }
            }
        }
    }
    /**
     * Will append this element in its current state to the provided container, or return a div containing the element. Thus, you should get the content of the div for the actual element
     * @param container The container to append the element to
     * @returns The container with the element appended to it
     */
    getElement(container, append = true) {
        if (append) {
            return this.appendChildren(container, this.content);
        }
        else {
            let containerdiv = document.createElement("div");
            return this.appendChildren(containerdiv, this.content);
        }
    }
    appendChildren(container, childnodes) {
        for (var node of childnodes) {
            container.innerHTML += node.outerHTML;
        }
        return container;
    }
}
class CustomElementsDatabase {
    constructor() {
        this.elements = {};
        this.styles = document.createElement("style");
        if (document.body)
            document.body.appendChild(this.styles);
    }
    registerElement(templatedata, elementname) {
        var content = [];
        var childnodes = templatedata.children;
        var stylesheet;
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
    /**
     * @returns An instance of CustomElement representing an element.
     * @param name Name of the element
     */
    getElement(name) {
        return this.elements[name];
    }
}
var database;
var elementlist;
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
            fs.readFile(__dirname + element['uri'], 'utf-8', (err, data) => {
                if (err) {
                    return console.error(err);
                    //TODO: throw some other error to the user
                }
                let actualHTML = data.substr(data.indexOf('\n') + 1);
                actualHTML.replace(/\n|\r/g, "");
                actualHTML.trim();
                registerElement(actualHTML, element['name']);
            });
        }
    });
}
function registerElement(htmlBody, elementName) {
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
    var parser = new DOMParser(), doc = parser.parseFromString(htmlBody, "text/xml");
    var template = doc.getElementById(elementName);
    database.registerElement(template, elementName);
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
