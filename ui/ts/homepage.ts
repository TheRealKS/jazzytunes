/// <reference path="../elements/elements.d.ts" />
/// <reference path="../apiwrapper/js/script.d.ts" />
var homepage : HomePage;

class HomePage {
    header : HTMLSpanElement;
    entries : Array<HomePageEntry> = [];
    holder : HTMLDivElement;
    domTarget : HTMLDivElement;

    constructor(header : HTMLSpanElement) {
        this.header = header;
        let element = database.getElement("homepage");
        let celement = new CustomElement(element.name, <Array<Element>>element.getContent());
        celement.populateSlots([header]);
        this.holder = <HTMLDivElement>celement.getElement(null, false).children[0];
    }

    addEntry(headertext : string, entries : Array<HomePageInteractiveEntry>) {
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
    element : HTMLDivElement;
    header : HTMLSpanElement;
    content : Array<HomePageInteractiveEntry> = [];
    domTarget : HTMLElement;

    constructor(header : HTMLSpanElement, entries : Array<HomePageInteractiveEntry>) {
        this.header = header;
        this.content = entries;
    }

    create() {
        let element = database.getElement("homepage-entry");
        let celement = new CustomElement(element.name, <Array<Element>>element.getContent());
        
        let containerdiv = document.createElement("div");
        containerdiv.className = "homepage_entry_content";
        containerdiv.slot = "homepage_entry_content";
        
        for (var el of this.content) {
            containerdiv.appendChild(el.element);
        }

        celement.populateSlots([this.header, containerdiv]);
        this.element = <HTMLDivElement>celement.getElement(null, false).children[0];
    }

    add(element : HomePageInteractiveEntry) {
        this.content.push(element);
        this.domTarget.children[2].appendChild(element.element).addEventListener("click", element.action.bind(element.actionpayload));
    }

    clear() {
        this.domTarget.children[2].innerHTML = "";
    }
}

class HomePageInteractiveEntry {
    imageuri : string;
    label : string;
    imgelement : HTMLImageElement;
    labelelement : HTMLSpanElement;

    loader : boolean;
    element : Element;

    action : EventListener;
    actionpayload : ActionPayload;

    constructor(imageuri : string, labeltxt : string, action : EventListener, actionpayload : ActionPayload, loader : boolean = false) {
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
        } else {
            image.className = "homepage_entry_image";
        }

        let header = document.createElement("span");
        header.className = "homepage_entry_label";
        header.slot = "homepage_entry_label";
        header.innerHTML = this.label;

        this.imgelement = image;
        this.labelelement = header;

        let singlentry = database.getElement("homepage-entry-single");
        let celement = new CustomElement(singlentry.name, <Array<Element>>singlentry.getContent());

        celement.populateSlots([image, header]);
        this.element = celement.getElement(null, false).children[0];
    }
}

function initHome() {
    return;
    let homepageheader = document.createElement("span");
    homepageheader.slot = "homepage_header_text";
    homepageheader.className = "homepage_header_text";
    homepageheader.innerHTML = getHomepageHeaderText() + " What would you like to listen to?";

    let loader = new HomePageInteractiveEntry('assets/images/album_spin.svg', 'Loading...', () => {}, null, true);

    homepage = new HomePage(homepageheader);
    homepage.addEntry('Your recently played tracks:', [loader]);

    homepage.domTarget =document.getElementById("content").appendChild(homepage.holder);

    let recentlyplayed = new SpotifyApiRecentTracksRequest(5);
    recentlyplayed.execute(createRecentTracksList);
}

function createRecentTracksList(result : SpotifyApiRequestResult) {
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

function getHomepageHeaderText() : string {
    let date = new Date();
    let hourslocale = date.getUTCHours() - (date.getTimezoneOffset() / 60);
    if (hourslocale >= 7 && hourslocale < 12) {
        return "Good morning!";
    } else if (hourslocale >= 12 && hourslocale < 17) {
        return "Good afternoon!";
    } else if (hourslocale >= 17 && hourslocale < 23) {
        return "Good evening!";
    } else if (hourslocale >= 23 && hourslocale < 7) {
        return "Good night!";
    }
}

function playHomePageTrack() {
    let req = new SpotifyApiPlayRequest(false, null, null, [this.uri]);
    req.execute((e) => {});
}