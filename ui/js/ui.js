var homepage;
class HomePage {
    constructor(header) {
        this.entries = [];
        this.header = header;
        let element = database.getElement("homepage");
        let celement = new CustomElement();
        element.populateSlots([header]);
        this.holder = element.getElement(null, false).children[0];
    }
    addEntry(headertext, entries) {
        let header = document.createElement("slot");
        header.slot = "homepage_entry_header";
        header.className = "homepage_entry_header";
        header.innerHTML = headertext;
        let entry = new HomePageEntry(header, entries);
        entry.create();
        this.entries.push(entry);
        this.entries[this.entries.length - 1].domTarget = this.holder.appendChild(entry.element);
    }
}
class HomePageEntry {
    constructor(header, entries) {
        this.content = [];
        this.header = header;
        this.content = entries;
    }
    create() {
        let element = database.getElement("homepage-entry");
        let containerdiv = document.createElement("div");
        containerdiv.className = "homepage_entry_content";
        containerdiv.slot = "homepage_entry_content";
        for (var el of this.content) {
            containerdiv.appendChild(el.element);
        }
        element.populateSlots([this.header, containerdiv]);
        this.element = element.getElement(null, false).children[0];
    }
    add(element) {
        this.content.push(element);
        this.domTarget.children[2].appendChild(element.element);
    }
}
class HomePageInteractiveEntry {
    constructor(imageuri, labeltxt, loader = false) {
        this.imageuri = imageuri;
        this.label = labeltxt;
        this.loader = loader;
        this.create();
    }
    create() {
        let image = document.createElement("img");
        image.src = this.imageuri;
        image.slot = "homepage_entry_image";
        if (this.loader) {
            image.classList.add("homepage_entry_image", "spinning");
        }
        else {
            image.className = "homepage_entry_image";
        }
        let header = document.createElement("span");
        header.className = "homepage_entry_label";
        header.slot = "homepage_entry_label";
        header.innerHTML = this.label;
        this.imgelement = image;
        this.labelelement = header;
        let singlentry = database.getElement("homepage-entry-single");
        singlentry.populateSlots([image, header]);
        this.element = singlentry.getElement(null, false).children[0];
    }
}
function initHome() {
    let homepageheader = document.createElement("span");
    homepageheader.slot = "homepage_header_text";
    homepageheader.className = "homepage_header_text";
    homepageheader.innerHTML = getHomepageHeaderText() + " What would you like to listen to?";
    let loader = new HomePageInteractiveEntry('assets/images/album_spin.svg', 'Loading...', true);
    homepage = new HomePage(homepageheader);
    homepage.addEntry('Your recent tracks:', [loader]);
    homepage.domTarget = document.getElementById("content").appendChild(homepage.holder);
    let recentlyplayed = new SpotifyApiRecentTracksRequest(5);
    recentlyplayed.execute(createRecentTracksList);
}
function createRecentTracksList(result) {
    var index = 0;
    console.log(result.result);
    for (var item of result.result.items) {
        let track = item.track;
        let imageuri = track.album.images[0].url;
        let element = new HomePageInteractiveEntry(imageuri, track.name, false);
        homepage.entries[0].add(element);
    }
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
    let celement = new CustomElement(element.name, element.content);
    celement.populateSlots(slots);
    let container = document.createElement("div");
    container.className = "sidebar_entry";
    container = celement.getElement(container);
    let contentbox = document.createElement("div");
    contentbox.className = "sidebar_entry_content";
    container.appendChild(contentbox);
    return container;
}
function createPlayBackControls(sidebarentry) {
    let element = database.getElement('playback-controls-basic');
    let celement = new CustomElement(element.name, element.content);
    let box = sidebarentry.getElementsByClassName('sidebar_entry_content')[0];
    return celement.getElement(box);
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
