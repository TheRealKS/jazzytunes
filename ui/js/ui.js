/// <reference path="../elements/elements.d.ts" />
/// <reference path="../apiwrapper/js/script.d.ts" />
var homepage;
class HomePage {
    constructor(header) {
        this.entries = [];
        this.header = header;
        let element = database.getElement("homepage");
        let celement = new CustomElement(element.name, element.getContent());
        celement.populateSlots([header]);
        this.holder = celement.getElement(null, false).children[0];
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
        let celement = new CustomElement(element.name, element.getContent());
        let containerdiv = document.createElement("div");
        containerdiv.className = "homepage_entry_content";
        containerdiv.slot = "homepage_entry_content";
        for (var el of this.content) {
            containerdiv.appendChild(el.element);
        }
        celement.populateSlots([this.header, containerdiv]);
        this.element = celement.getElement(null, false).children[0];
    }
    add(element) {
        this.content.push(element);
        this.domTarget.children[2].appendChild(element.element).addEventListener("click", element.action.bind(element.actionpayload));
    }
    clear() {
        this.domTarget.children[2].innerHTML = "";
    }
}
class HomePageInteractiveEntry {
    constructor(imageuri, labeltxt, action, actionpayload, loader = false) {
        this.imageuri = imageuri;
        this.label = labeltxt;
        this.loader = loader;
        this.action = action;
        this.actionpayload = actionpayload;
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
        let celement = new CustomElement(singlentry.name, singlentry.getContent());
        celement.populateSlots([image, header]);
        this.element = celement.getElement(null, false).children[0];
    }
}
function initHome() {
    let homepageheader = document.createElement("span");
    homepageheader.slot = "homepage_header_text";
    homepageheader.className = "homepage_header_text";
    homepageheader.innerHTML = getHomepageHeaderText() + " What would you like to listen to?";
    let loader = new HomePageInteractiveEntry('assets/images/album_spin.svg', 'Loading...', () => { }, null, true);
    homepage = new HomePage(homepageheader);
    homepage.addEntry('Your recently played tracks:', [loader]);
    homepage.domTarget = document.getElementById("content").appendChild(homepage.holder);
    let recentlyplayed = new SpotifyApiRecentTracksRequest(5);
    recentlyplayed.execute(createRecentTracksList);
}
function createRecentTracksList(result) {
    var index = 0;
    console.log(result.result);
    homepage.entries[0].clear();
    for (var item of result.result.items) {
        let track = item.track;
        let imageuri = track.album.images[0].url;
        let payload = {
            type: ActionType.PLAY,
            uri: track.uri
        };
        let element = new HomePageInteractiveEntry(imageuri, track.name, playHomePageTrack, payload, false);
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
function playHomePageTrack() {
    let req = new SpotifyApiPlayRequest(false, null, null, [this.uri]);
    req.execute((e) => { });
}
//// <reference path="../elements/elements.ts" /> 
//// <reference path="../apiwrapper/ts/spotifyapirequest.ts" />
//import {Spinner, SpinnerOptions} from '../../node_modules/spin.js/spin';
var ActionType;
(function (ActionType) {
    ActionType[ActionType["PLAY"] = 0] = "PLAY";
    ActionType[ActionType["INTENT"] = 1] = "INTENT";
})(ActionType || (ActionType = {}));
var volumecontrolopen = false;
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
    container.setAttribute('expanded', 'true');
    container = celement.getElement(container);
    container.children[0].children[0].addEventListener('click', (target) => {
        let t = target.target;
        //@ts-ignore
        toggleSidebarEntry(t.parentNode.parentNode, t);
    });
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
function toggleSidebarEntry(entry, icon) {
    if (entry.getAttribute('expanded') === 'true') {
        for (var i = 1; i < entry.children.length; i++) {
            entry.children[i].setAttribute('originaldisplay', entry.children[i].style.display);
            entry.children[i].style.display = "none";
        }
        icon.style.transform = "rotate(180deg)";
        entry.setAttribute('expanded', 'false');
    }
    else {
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
    }
    else {
        control.style.zIndex = "999";
        control.classList.add("volume_button_expanded");
    }
    volumecontrolopen = !volumecontrolopen;
}
function setVolume() {
    let bar = document.getElementById('volume_controller');
    let icon = document.getElementById('volume_icon');
    let newvol = bar.value;
    if (newvol > 0.5) {
        icon.innerHTML = "volume_up";
    }
    else if (newvol > 0 && newvol < 0.5) {
        icon.innerHTML = "volume_down";
    }
    else if (newvol == 0) {
        icon.innerHTML = "volume_mute";
    }
    player.setVolume(newvol);
}
function testSearch() {
    let request = new SpotifyApiSearchRequest(true, true, true, true, 10);
    request.buildGeneralQuery(["fefe", "nicki"], false);
    request.execute((result) => {
        console.log(result);
    });
}
