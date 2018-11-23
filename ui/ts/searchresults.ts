//// <reference path="../apiwrapper/ts/spotifyapirequest.ts" />

var queryrunning : NodeJS.Timer;

enum Category {
    ALBUMS = "Albums",
    ARTISTS = "Artists",
    TRACKS = "Tracks",
    PLAYLISTS = "Playlists"
}

class SearchResults {
    artists : boolean;
    albums : boolean;
    tracks : boolean;
    playlists : boolean;
    query : string;
    categories : Array<SearchResultsCategory> = [];

    celement : CustomElement;
    element : HTMLDivElement;
    domtarget : HTMLDivElement;
    categoryholder : HTMLDivElement;
    header : HTMLSpanElement;

    constructor(artists : boolean, albums : boolean, tracks : boolean, playlists : boolean, query : string) {
        this.artists = artists;
        this.albums = albums;
        this.tracks = tracks;
        this.playlists = playlists;
        this.query = query;
    }

    create() {
        let header = document.createElement("span");
        header.slot = "search_results_header";
        header.className = "search_results_header";
        header.innerHTML = "Results for query: \"" + this.query + "\"";
        this.header = header;

        let element = database.getElement('searchresults');
        let celement = new CustomElement(element.name, <Array<Element>>element.getContent());
        this.celement = celement;
    }

    finalise() {
        this.celement.populateSlots([this.header]);
        this.element = <HTMLDivElement>this.celement.getElement(null, false).children[0];

        this.categories.forEach(element => {
            element.finalise();
            this.element.appendChild(element.htmlelement);
        });
    }

    attach() {
        this.finalise();
        let content = document.getElementById("content");
        while (content.firstElementChild != content.lastElementChild) {
            content.removeChild(content.lastElementChild);
        }
        let a = content.appendChild(this.element);
        attachEventListeners(this);
    }

    addCategory(element : SearchResultsCategory) {
        this.categories.push(element);
    }
}

class SearchResultsCategory {
    categorytype : Category;
    seemorebutton : HTMLDivElement;
    header : HTMLSpanElement;
    nexturl : ActionPayload;
    entries : Array<SearchResultsEntry> = [];
    element : CustomElement;
    htmlelement : HTMLElement;

    constructor(type : Category, element : CustomElement, header : HTMLSpanElement, next : ActionPayload) {
        this.categorytype = type;
        this.nexturl = next;
        this.element = element;
        this.header = header;
    }

    addEntry(entry : SearchResultsEntry) {
        this.entries.push(entry);
    }
    
    finalise() {
        this.element.populateSlots([this.header]);
        this.htmlelement = <HTMLElement>this.element.getElement(null, false).children[0];

        this.entries.forEach(element => {
            let a = this.htmlelement.appendChild(element.element);
            element.domtarget = (a);
            element.fetchDomTargets();
        });

        this.seemorebutton = <HTMLDivElement>this.htmlelement.getElementsByClassName("search_results_category_more")[0];
        this.seemorebutton.addEventListener("click", function() {}.bind(this.nexturl));
    }
}

class SearchResultsEntry {
    type : Category;
    imageelement : HTMLImageElement;
    labelelement : HTMLSpanElement;
    descriptor : HTMLDivElement;
    imageactionpayload : ActionPayload;
    textactionpayload : ActionPayload;

    customelement : CustomElement;
    element : HTMLElement;

    domtarget : Node;
    domtargets : {image : Node, maintext : Node, subtext : Node};

    constructor(type : Category, customelement : CustomElement, imageelement : HTMLImageElement, labelelement : HTMLSpanElement, imgpayload : ActionPayload, textpayload : ActionPayload) {
        this.type = type;
        this.imageelement = imageelement;
        this.labelelement = labelelement;
        this.imageactionpayload = imgpayload;
        this.textactionpayload = textpayload;
        this.customelement = customelement;
        this.element = <HTMLElement>customelement.getElement(null, false).children[0];
    }

    fetchDomTargets() {
        let image = this.domtarget.children[0];
        let text = this.domtarget.children[1];
        let maintext = text.children[0];
        let subtext = text.children[1];
        this.domtargets = {image : image, maintext : maintext, subtext : subtext};
    }
}

interface SearchresultsObject {
    type : Category,
    items : Array<SearchresultsEntryObject>
    morepayload : ActionPayload
};

interface SearchresultsEntryObject {
    image: string,
    maintext : string,
    subtext : string,
    imagepayload : ActionPayload,
    maintextpayload : ActionPayload,
    subtextpayload : ActionPayload
};

var currentresults : SearchResults;

function buildSearchResults(items : Array<SearchresultsObject>) {
    for (var item of items) {
        let cat = buildCategory(item.type);
        var category = new SearchResultsCategory(item.type, cat.element, cat.header, item.morepayload);
        for (var entry of item.items) {
            let image = document.createElement("img");
            image.slot = "search_results_entry_image";
            image.className = "search_results_entry_image";
            image.src = "assets/images/ic_album_white_48px.svg";
            if (entry.image) {
                image.src = entry.image;
            }

            let descriptor = document.createElement("span");
            descriptor.slot = "search_results_entry_label";
            descriptor.className = "search_results_entry_label";
            descriptor.innerHTML = entry.maintext;
            descriptor.title = entry.maintext;
            //@ts-ignore
            $clamp(descriptor, {clamp: 1, useNativeClamp: true});

            let element = database.getElement("search-results-entry");
            let celement = new CustomElement(element.name, <Array<Element>>element.getContent());
            celement.populateSlots([image, descriptor, document.createElement("span")]);

            let sentry = new SearchResultsEntry(Category.TRACKS, celement, image, descriptor, entry.imagepayload, entry.maintextpayload);
            category.addEntry(sentry);
            sentry = null;
            delete {celement}.celement;
        }
        currentresults.addCategory(category);
    }
    currentresults.attach();
}

function buildCategory(htxt : string) : Object {
    let header = document.createElement("span");
    header.className = "search_results_category_header";
    header.slot = "search_results_category_header";
    header.innerHTML = htxt;

    let element = database.getElement('search-results-category');
    let celement = new CustomElement(element.name, <Array<Element>>element.getContent());
    return {element : celement, header : header};
}

function attachEventListeners(a : SearchResults) {
    let cats = a.categories;
    for (var i = 0; i < cats.length; i++) {
        let currentcategory = cats[i];
        for (var j = 0; j < currentcategory.entries.length; j++) {
            let entry = currentcategory.entries[j];
            entry.domtargets.image.addEventListener("click", function() {
                if (this.contexttype == "album" || this.contexttype == "artist") {
                    let req = new SpotifyApiPlayRequest(true, this.uri, 0, []);
                    req.execute((e) => {});
                } else {
                    let req = new SpotifyApiPlayRequest(false, null, null, [this.uri]);
                    req.execute((e) => {});
                }
            }.bind(entry.textactionpayload));
            entry.domtargets.maintext.addEventListener("click", function() {
                if (this.contexttype == "album") {
                    displayAlbum(this.id);
                }
            }.bind(entry.textactionpayload));
        }
    }
}

function buildQueryResults(result : SpotifyApiRequestResult) {
    if (result.status === RequestStatus.RESOLVED) {
        var artists = result.result.artists.items;
        var albums = result.result.albums.items;
        var tracks = result.result.tracks.items;
        var playlists = result.result.playlists.items;
        var artistsarray : SearchresultsObject = {};
        artistsarray.items = [];
        artistsarray.type = Category.ARTISTS;
        for (var i = 0; i < artists.length; i++) {
            let current = artists[i];
            let o : SearchresultsEntryObject = {};
            if (current.images) {
                if (current.images.length > 0) {
                    o.image = current.images[0].url;
                }
            }
            o.maintext = current.name;
            o.imagepayload = null;
            o.maintextpayload = null;
            artistsarray.items.push(o);
        }
        var albumsarray : SearchresultsObject = {};
        albumsarray.items = [];
        albumsarray.type = Category.ALBUMS;
        for (var i = 0; i < albums.length; i++) {
            let current = albums[i];
            let o : SearchresultsEntryObject = {};
            if (current.images) {
                if (current.images.length > 0) {
                    o.image = current.images[0].url;
                }
            }
            o.maintext = current.name;
            o.subtext = current.artists[0].name;
            let imagepayload : ActionPayload = {
                "type": ActionType.PLAY,
                "contexttype": "album",
                "uri": current.uri
            };

            let textpayload : ActionPayload = {
                "type": ActionType.INTENT,
                "contexttype": "album",
                "uri": current.uri,
                id: current.id
            };

            o.imagepayload = imagepayload;
            o.maintextpayload = textpayload;
            o.subtextpayload = textpayload;
            
            albumsarray.items.push(o);
        }
        var tracksarray : SearchresultsObject = {};
        tracksarray.items = [];
        tracksarray.type = Category.TRACKS;
        for (var i = 0; i < tracks.length; i++) {
            let current = tracks[i];
            let o : SearchresultsEntryObject = {};
            if (current.album.images) {
                if (current.album.images.length > 0) {
                    o.image = current.album.images[0].url;
                }
            }
            o.maintext = current.name;
            o.subtext = current.album.name;

            let imagepayload : ActionPayload = {
                "type": ActionType.PLAY,
                "contexttype": "track",
                "uri": current.uri
            };

            let textpayload : ActionPayload = {
                "type": ActionType.INTENT,
                "contexttype": "track",
                "uri": current.uri,
                id: current.id
            };

            o.imagepayload = imagepayload;
            o.maintextpayload = textpayload;
            o.subtextpayload = null;

            tracksarray.items.push(o);
        }
        var playlistsarray : SearchresultsObject = {};
        playlistsarray.items = [];
        playlistsarray.type = Category.PLAYLISTS;
        for (var i = 0; i < playlists.length; i++) {
            let current = playlists[i];
            let o : SearchresultsEntryObject = {};
            if (current.images) {
                if (current.images.length > 0) {
                    o.image = current.images[0].url;
                }
            }
            o.maintext = current.name;
            o.subtext = current.owner.display_name;

            o.imagepayload = null
            o.maintextpayload = null;
            o.subtextpayload = null;

            playlistsarray.items.push(o);
        }
        buildSearchResults([artistsarray, albumsarray, tracksarray, playlistsarray]);
    }
}

function search(query : string) {
    if (query == "") {
        let content = document.getElementById("content");
        while (content.firstElementChild != content.lastElementChild) {
            content.removeChild(content.lastElementChild);
        }
        return;
    }
    let qsplit = query.split(" ");
    let request = new SpotifyApiSearchRequest(true, true, true, true, 6);
    request.buildGeneralQuery(qsplit);
    request.execute(buildQueryResults);
    currentresults = new SearchResults(true, true, true, true, query);
    currentresults.create();
}

addLoadEvent(() => {
    document.getElementById("searchbox").addEventListener("keyup", (ev) => {
        if (!queryrunning) {
            queryrunning = setTimeout(() => {
                search(ev.target.value);
            }, 200);
        } else {
            clearTimeout(queryrunning);
            queryrunning = setTimeout(() => {
                search(ev.target.value);
            }, 200);
        }
    });
});