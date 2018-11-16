//// <reference path="../apiwrapper/ts/spotifyapirequest.ts" />

var queryrunning : NodeJS.Timer;

enum Category {
    ALBUMS,
    ARTISTS,
    TRACKS,
    PLAYLISTS
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
        header.innerHTML = "Results for query \"" + this.query + "\"";
        this.header = header;

        this.categoryholder = document.createElement("div");
        this.categoryholder.slot = "search_results_categories";
        this.categoryholder.className = "search_results_categories";

        let element = database.getElement('searchresults');
        let celement = new CustomElement(element.name, <Array<Element>>element.getContent());
        this.celement = celement;
    }

    finalise() {
        this.celement.populateSlots([this.header, this.categoryholder]);
        this.element = <HTMLDivElement>this.celement.getElement(null, false).children[0];

        this.categories.forEach(element => {
            element.finalise();
            this.element.children[1].appendChild(element.htmlelement);
        });
    }

    attach() {
        this.finalise();
        let content = document.getElementById("content");
        while (content.firstElementChild != content.lastElementChild) {
            content.removeChild(content.lastElementChild);
        }
        let a = content.appendChild(this.element);
        attachEventListeners(a);
    }

    addCategory(element : SearchResultsCategory) {
        this.categories.push(element);
    }
}

class SearchResultsCategory {
    categorytype : Category;
    seemorebutton : HTMLDivElement;
    seemorepayload : ActionPayload;
    header : HTMLSpanElement;
    nexturl : string;
    entries : Array<SearchResultsEntry> = [];
    element : CustomElement;
    htmlelement : HTMLElement;

    constructor(type : Category, element : CustomElement, header : HTMLSpanElement, nexturl : string) {
        this.categorytype = type;
        this.nexturl = nexturl;
        this.element = element;
        this.header = header;
    }

    addEntry(entry : SearchResultsEntry) {
        this.entries.push(entry);
    }
    
    finalise() {
        let holder = document.createElement("div");
        holder.slot = "search_results_category_entries";
        holder.className = "search_results_category_entries";

        this.entries.forEach(element => {
            let a = holder.appendChild(element.element);
        });

        this.element.populateSlots([this.header, holder]);
        this.htmlelement = <HTMLElement>this.element.getElement(null, false).children[0];

        this.seemorebutton = <HTMLDivElement>this.htmlelement.getElementsByClassName("search_results_category_more")[0];
        this.seemorepayload = {
            "type": ActionType.INTENT,
            "contexttype": "moreresults",
            "uri": this.nexturl
        };
        this.seemorebutton.addEventListener("click", function() {}.bind(this.seemorepayload));
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

    constructor(type : Category, customelement : CustomElement, imageelement : HTMLImageElement, labelelement : HTMLSpanElement, imgpayload : ActionPayload, textpayload : ActionPayload) {
        this.type = type;
        this.imageelement = imageelement;
        this.labelelement = labelelement;
        this.imageactionpayload = imgpayload;
        this.textactionpayload = textpayload;
        this.customelement = customelement;
        this.element = <HTMLElement>customelement.getElement(null, false).children[0];
    }
}

var currentresults : SearchResults;

function buildArtistAlbumSearchResult(result : SpotifyApiRequestResult) {
    if (result.status == RequestStatus.RESOLVED) {
        let artists = result.result.artists.items;
        let albums = result.result.albums.items;
        let artistcategory = buildCategory("Artists");
        let albumscategory = buildCategory("Albums");
        let cat = new SearchResultsCategory(Category.ARTISTS, artistcategory.element, artistcategory.header, artists.next);
        for (var i = 0; i < artists.length; i++) {
            let image = document.createElement("img");
            image.slot = "search_results_entry_image";
            image.className = "search_results_entry_image";
            image.src = "assets/images/ic_album_white_48px.svg";
            if (artists[i].images.length > 0) {
                image.src = artists[i].images[0].url;
            }

            let descriptor = document.createElement("span");
            descriptor.slot = "search_results_entry_label";
            descriptor.className = "search_results_entry_label";
            descriptor.innerHTML = artists[i].name;

            let element = database.getElement("search-results-entry");
            let celement = new CustomElement(element.name, <Array<Element>>element.getContent());
            celement.populateSlots([image, descriptor, document.createElement("span")]);
            
            let imagepayload : ActionPayload = {
                "type": ActionType.PLAY,
                "contexttype": "artist",
                "uri": artists[i].uri
            };

            let textpayload : ActionPayload = {
                "type": ActionType.INTENT,
                "contexttype": "artist",
                "uri": artists[i].uri
            };

            let sentry = new SearchResultsEntry(Category.ARTISTS, celement, image, descriptor, imagepayload, textpayload);
            cat.addEntry(sentry);
            sentry = null;
            delete {celement}.celement;
        }
        let catt = new SearchResultsCategory(Category.ALBUMS, albumscategory.element, albumscategory.header, albums.next);
        for (var i = 0; i < albums.length; i++) {
            let imagepayload : ActionPayload = {
                "type": ActionType.PLAY,
                "contexttype": "album",
                "uri": albums[i].uri
            };

            let textpayload : ActionPayload = {
                "type": ActionType.INTENT,
                "contexttype": "album",
                "uri": albums[i].uri,
                id: albums[i].id
            };

            let image = document.createElement("img");
            image.slot = "search_results_entry_image";
            image.className = "search_results_entry_image";
            image.src = "assets/images/ic_album_white_48px.svg";
            if (artists[i].images.length > 0) {
                image.src = albums[i].images[0].url;
            }
            image.addEventListener('click', function() {console.log("DDD");}.bind(imagepayload));

            let descriptor = document.createElement("span");
            descriptor.slot = "search_results_entry_label";
            descriptor.className = "search_results_entry_label";
            descriptor.innerHTML = albums[i].name;
            descriptor.addEventListener("click", function() {console.log("HALLO")}.bind(textpayload));

            let element = database.getElement("search-results-entry");
            let celement = new CustomElement(element.name, <Array<Element>>element.getContent());
            celement.populateSlots([image, descriptor, document.createElement("span")]);

            let sentry = new SearchResultsEntry(Category.ALBUMS, celement, image, descriptor, imagepayload, textpayload);
            catt.addEntry(sentry);
            sentry = null;
            delete {celement}.celement;
        }
        currentresults.addCategory(cat);
        currentresults.addCategory(catt);
    }
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

function buildTracksPlaylistsSearchResult(result : SpotifyApiRequestResult) {
    if (result.status = RequestStatus.RESOLVED) {
        let tracks = result.result.tracks.items;
        let playlists = result.result.playlists.items;
        let trackscategory = buildCategory("Tracks");
        let playlistscategory = buildCategory("Playlists");
        var category1 = new SearchResultsCategory(Category.TRACKS, trackscategory.element, trackscategory.header, tracks.next);
        for (var i = 0; i < tracks.length; i++) {
            let image = document.createElement("img");
            image.slot = "search_results_entry_image";
            image.className = "search_results_entry_image";
            image.src = "assets/images/ic_album_white_48px.svg";
            if (tracks[i].album.images.length > 0) {
                image.src = tracks[i].album.images[0].url;
            }

            let descriptor = document.createElement("span");
            descriptor.slot = "search_results_entry_label";
            descriptor.className = "search_results_entry_label";
            descriptor.innerHTML = tracks[i].name;

            let element = database.getElement("search-results-entry");
            let celement = new CustomElement(element.name, <Array<Element>>element.getContent());
            celement.populateSlots([image, descriptor, document.createElement("span")]);
            
            let imagepayload : ActionPayload = {
                "type": ActionType.PLAY,
                "contexttype": "track",
                "uri": tracks[i].uri
            };

            let textpayload : ActionPayload = {
                "type": ActionType.INTENT,
                "contexttype": "track",
                "uri": tracks[i].uri,
            };

            let sentry = new SearchResultsEntry(Category.TRACKS, celement, image, descriptor, imagepayload, textpayload);
            category1.addEntry(sentry);
            sentry = null;
            delete {celement}.celement;
        }
        currentresults.addCategory(category1);
        currentresults.attach();
    }
}

function attachEventListeners(a : HTMLDivElement) {
    let children = a.children;
    let cats = children[1].children;
    for (var i = 0; i < currentresults.categories.length; i++) {
        let currentcategory = cats[i];
        let entries = currentcategory.getElementsByClassName("search_results_category_entries")[0].children;
        for (var j = 0; j < entries.length; j++) {
            let entrydata = currentresults.categories[i].entries[j];
            let entry = entries[j];
            entry.getElementsByClassName("search_results_entry_image")[0].addEventListener("click", function() {
                if (this.contexttype == "album" || this.contexttype == "artist") {
                    let req = new SpotifyApiPlayRequest(true, this.uri, 0, []);
                    req.execute((e) => {});
                } else {
                    let req = new SpotifyApiPlayRequest(false, null, null, [this.uri]);
                    req.execute((e) => {});
                }
            }.bind(entrydata.textactionpayload));
            entry.getElementsByClassName("search_results_entry_descriptor")[0].addEventListener("click", function() {
                if (this.contexttype == "album") {
                    displayAlbum(this.id);
                }
            }.bind(entrydata.textactionpayload));
        }
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
    let request = new SpotifyApiSearchRequest(true, true, false, false, 4);
    request.buildGeneralQuery(qsplit);
    request.execute(buildArtistAlbumSearchResult);
    let request2 = new SpotifyApiSearchRequest(false, false, true, true, 10);
    request2.buildGeneralQuery(qsplit);
    request2.execute(buildTracksPlaylistsSearchResult);
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