//// <reference path="../apiwrapper/ts/spotifyapirequest.ts" />
//// <reference path="../elements/elements.ts" /> 
function initHome() {
    let homepageheader = document.createElement("span");
    homepageheader.slot = "homepage_header_text";
    homepageheader.className = "homepage_header_text";
    homepageheader.innerHTML = getHomepageHeaderText() + " What would you like to listen to?";
    let slots = [homepageheader];
    let element = database.getElement("homepage");
    element.populateSlots(slots);
    let container = element.getElement(null, false).children[0];
    homepageheader.slot = "homepage_entry_header";
    homepageheader.className = "homepage_entry_header";
    homepageheader.innerHTML = "Your recent tracks:";
    slots = [homepageheader];
    let contentholder = database.getElement("homepage-entry");
    contentholder.populateSlots(slots);
    let content = contentholder.getElement(null, false).children[0];
    content.innerHTML = createSpinner().el;
    document.getElementById("content").appendChild(container);
    let recentlyplayed = new SpotifyApiRecentTracksRequest(5);
}
function getHomepageHeaderText() {
    let date = new Date();
    let hourslocale = date.getUTCHours() - (date.getTimezoneOffset() / 60);
    if (hourslocale >= 7 && hourslocale < 12) {
        return "Good morning!";
    }
    else if (hourslocale >= 12 && hourslocale < 17) {
        return "Good afternoon!";
    }
    else if (hourslocale >= 17 && hourslocale < 23) {
        return "Good evening!";
    }
    else if (hourslocale >= 23 && hourslocale < 7) {
        return "Good night!";
    }
}
//// <reference path="../elements/elements.ts" /> 
//import {Spinner, SpinnerOptions} from '../../node_modules/spin.js/spin';
function createSidebarEntry(name) {
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
    element.populateSlots(slots);
    let container = document.createElement("div");
    container.className = "sidebar_entry";
    container = element.getElement(container);
    let contentbox = document.createElement("div");
    contentbox.className = "sidebar_entry_content";
    container.appendChild(contentbox);
    return container;
}
function createPlayBackControls(sidebarentry) {
    let element = database.getElement('playback-controls-basic');
    let box = sidebarentry.getElementsByClassName('sidebar_entry_content')[0];
    return element.getElement(box);
}
function createSpinner() {
    let standardoptions = {
        lines: 8,
        length: 60,
        speed: 1.5
    };
    //@ts-ignore
    return new Spinner(standardoptions).spin();
}
