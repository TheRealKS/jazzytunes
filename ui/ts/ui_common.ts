//// <reference path="../elements/elements.ts" /> 
//// <reference path="../apiwrapper/ts/spotifyapirequest.ts" />
//import {Spinner, SpinnerOptions} from '../../node_modules/spin.js/spin';

interface ContextParmaters {
    offset: number
}

interface ActionPayload {
    type : ActionType;
    contexttype: string;
    contextparams? : ContextParmaters,
    uri: string,
    id? : string
}

var volumecontrolopen = false;

var loader : HTMLElement;

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

function toggleVolumeControl() {
    let control = document.getElementById('volume_control');
    let uinfo = document.getElementById('user_info');
    let bar = document.getElementById('volume_controller');
    if (volumecontrolopen) {
        control.style.removeProperty('z-index');
        control.style.removeProperty("flex-grow");
        control.style.removeProperty('width');
        control.classList.remove("volume_button_expanded");
    } else {
        control.style.zIndex = "999";
        control.classList.add("volume_button_expanded");
    }
    volumecontrolopen = !volumecontrolopen;
}

function setVolume(amount? : number) {
    let bar = document.getElementById('volume_controller');
    let icon = document.getElementById('volume_icon');
    let newvol = bar.value;
    if (newvol > 0.5) {
        icon.innerHTML = "volume_up";
    } else if (newvol > 0 && newvol < 0.5) {
        icon.innerHTML = "volume_down";
    } else if (newvol == 0) {
        icon.innerHTML = "volume_mute";
    }
    player.setVolume(newvol);
}

/**
 * To get the correct plural suffix for a word
 * @param quantity quantity of objects.
 */
function correctSsuffix(quantity : number) : string{
    if (quantity === 1) {
        return "";
    }
    return "s";
}

function displayLoader() {
    contentdom.appendChild(loader);
}

function stringToDom(str) {
    var parser = new DOMParser()
    return parser.parseFromString(str, "text/html");
}

function span() {
    return document.createElement("span");
}

addLoadEvent(function() {
    loader = <HTMLElement>stringToDom("<div id='loader' class='loader_holder'><div class='lds-facebook'><div></div><div></div><div></div></div></div>").firstChild;
});