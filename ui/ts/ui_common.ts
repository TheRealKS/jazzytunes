//// <reference path="../elements/elements.ts" /> 
//// <reference path="../apiwrapper/ts/spotifyapirequest.ts" />
//import {Spinner, SpinnerOptions} from '../../node_modules/spin.js/spin';

enum ActionType {
    PLAY,
    INTENT
}

interface ActionPayload {
    type: ActionType;
    uri: string;
}

function createSidebarEntry(name: string) {
    let header = document.createElement("sidebar_element_header");
    let entryName = document.createElement("span");
    entryName.slot = "header_text";
    entryName.innerHTML = name;
    header.appendChild(entryName);
    /* header.shadowRoot.childNodes[0].addEventListener("click", (event : Event) => {
        let target : HTMLElement = <HTMLElement> event.target;
        let entry = target.parentElement;
        let childNodes = Array.from(entry.childNodes);
        if (target.getAttribute("open")) {
            childNodes.forEach((element : HTMLElement, index) => {
                if (index > 0) {
                    element.style.display = "none";
                }
            });
            target.style.transform = "rotate(180deg)";
        } else {
            childNodes.forEach((element : HTMLElement, index) => {
                if (index > 0) {
                    element.style.display = "block";
                }
            });
            target.style.transform = "rotate(0deg)";
        }
    }); */
    let span = document.createElement("span");
    span.slot = "header_text";
    span.innerHTML = name;
    span.className = "header_text";

    let slots = [span];

    let element = database.getElement("sidebar-element-header");
    let celement = new CustomElement(element.name, element.content);
    celement.populateSlots(slots);

    let container = document.createElement("div");
    container.className = "sidebar_entry";
    container.setAttribute('expanded', 'true');

    container = celement.getElement(container);

    container.children[0].children[0].addEventListener('click', (target) => {
        let t = target.target;
        //@ts-ignore
        toggleSidebarEntry(<HTMLElement>t.parentNode.parentNode, <HTMLElement>t);
    });

    let contentbox = document.createElement("div");
    contentbox.className = "sidebar_entry_content";
    container.appendChild(contentbox);

    return container;
}

function createPlayBackControls(sidebarentry: HTMLDivElement) {
    let element = database.getElement('playback-controls-basic');
    let celement = new CustomElement(element.name, element.content);
    let box = sidebarentry.getElementsByClassName('sidebar_entry_content')[0];

    return celement.getElement(box);
}

function toggleSidebarEntry(entry: HTMLElement, icon: HTMLElement) {
    if (entry.getAttribute('expanded') === 'true') {
        for (var i = 1; i < entry.children.length; i++) {
            entry.children[i].setAttribute('originaldisplay', entry.children[i].style.display);
            entry.children[i].style.display = "none";
        }
        icon.style.transform = "rotate(180deg)";
        entry.setAttribute('expanded', 'false');
    } else {
        for (var i = 1; i < entry.children.length; i++) {
            entry.children[i].style.display = entry.children[i].getAttribute('originaldisplay');
        }
        icon.style.transform = "rotate(0deg)";
        entry.setAttribute('expanded', 'true');
    }
}

function testSearch() {
    let request = new SpotifyApiSearchRequest(true, true, true, true, 10);
    request.buildGeneralQuery(["fefe", "nicki"], false);
    request.execute((result) => {
        console.log(result);
    });
}