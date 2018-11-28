/// <reference path="../elements/elements.d.ts" />
/// <reference path="../apiwrapper/js/script.d.ts" />
var homepage : HomePage;

enum ActionType {
    PLAY,
    INTENT
}

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
    let homepageheader = document.createElement("span");
    homepageheader.slot = "homepage_header_text";
    homepageheader.className = "homepage_header_text";
    homepageheader.innerHTML = getHomepageHeaderText() + " What would you like to listen to?";

    let loader = new HomePageInteractiveEntry('assets/images/album_spin.svg', 'Loading...', () => {}, null, true);

    homepage = new HomePage(homepageheader);
    homepage.addEntry('Your recently played tracks:', [loader]);

    displayLoader();

    let recentlyplayed = new SpotifyApiRecentTracksRequest(15);
    recentlyplayed.execute(createRecentTracksList);
}

function createRecentTracksList(result : SpotifyApiRequestResult) {
    var index = 0;
    homepage.domTarget = clearDomContent().appendChild(homepage.holder);
    console.log(result.result);
    homepage.entries[0].clear();
    let res = buildEntries(result.result.items);
    for (var item of res) {
        let element = new HomePageInteractiveEntry(item.image, item.name, playHomePageTrack, item.payload, false);
        homepage.entries[0].add(element);
    }
    let entry = new NavigationEntry();
    entry.id = generateID();
    entry.htmlContent = homepage.domTarget;
    navhistory.addState(NavigationPosition.BACK, entry);
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
    if (this.contexttype === "album") {
        let req = new SpotifyApiPlayRequest(true, this.uri, this.contextparams.offset-1, null);
        req.execute((e) => {});
    }
}

interface HomepageEntryObject {
    name : string,
    uri : string,
    image : string,
    type : string,
    payload : ActionPayload
}

function buildEntries(raw : Array<Object>) : Array<HomepageEntryObject> {
    let arr : Array<HomepageEntryObject> = [];
    for (var i = 0; i < raw.length; i++) {
        let c = raw[i];
        let fail = false;
        for (var j = 0; j < arr.length; j++) {
            if (c.context) {
                if (arr[j].uri === c.context.uri) {
                    fail = true;
                    break;
                }
            } else {
                fail = true;
            }
        }
        if (!fail) {
            if (c.context) {
                let payload : ActionPayload = {
                    type: ActionType.PLAY,
                    uri: c.context.uri,
                    contexttype: c.context.type
                };
                if (c.context.type == "album") {
                    payload.contextparams = {
                        offset: c.track.track_number
                    };
                }
                let o : HomepageEntryObject = {
                    name : c.track.name,
                    uri : c.context.uri,
                    image : c.track.album.images[0].url,
                    type : c.context.type,
                    payload: payload
                };
                arr.push(o);
            }
        }
    }
    return arr;
}