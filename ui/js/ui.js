/// /<reference path="../apiwrapper/ts/spotifyapirequest.ts" />
///// <reference path="../elements/elements.d.ts" />
var currentalbum;
class AlbumView {
    constructor(data) {
        this.SEPARATOR = "&nbsp; | &nbsp;";
        this.domTargetsTracks = [];
        this.data = data;
        this.create(1);
    }
    create(step) {
        if (step === 1) {
            let el = database.getElement("albumview");
            let cel = new CustomElement(el.name, el.getContent());
            let ell = cel.getElement(null, false).children[0];
            this.createHeader();
            ell.prepend(this.header);
            this.domTargetMain = replaceDomContent(ell, true);
            this.domTargetImages = this.domTargetMain.firstChild.firstChild;
        }
        else if (step === 2) {
            let holder = document.createElement("div");
            holder.className = "albumenumeration";
            let h = this.domTargetMain.appendChild(holder);
            for (var i = 0; i < this.trackel.length; i++) {
                let l = h.appendChild(this.trackel[i]);
                let o = {
                    type: ActionType.PLAY,
                    contexttype: "album",
                    contextparams: { offset: this.tracks[i].track_no },
                    uri: this.data.uri
                };
                let d = {
                    target: l,
                    payload: o
                };
                this.domTargetsTracks.push(d);
            }
            this.create(3);
        }
        else if (step === 3) {
            for (var i = 0; i < this.domTargetsTracks.length; i++) {
                let target = this.domTargetsTracks[i].target;
                let payload = this.domTargetsTracks[i].payload;
                let f = () => {
                    let r = new SpotifyApiPlayRequest(true, payload.uri, payload.contextparams.offset - 1);
                    r.execute(() => { });
                };
                this.attachListener("click", f, target);
                this.attachListener("mouseenter", hover, target);
                this.attachListener("mouseout", unhover, target);
            }
        }
    }
    attachListener(type, action, target) {
        target.addEventListener(type, action);
    }
    createHeader() {
        let el = database.getElement("albumheader");
        let cel = new CustomElement(el.name, el.getContent());
        let cover = document.createElement("img");
        cover.src = this.data.images[0];
        cover.className = "albumcover";
        cover.slot = "albumcover";
        let albumname = span();
        albumname.innerHTML = this.data.name;
        albumname.className = "maintext";
        albumname.slot = "maintext";
        //@ts-ignore
        $clamp(albumname, { clamp: 2, useNativeClamp: true });
        let type = span();
        type.innerHTML = capitalizeFirstLetter(this.data.type);
        type.className = "type";
        type.slot = "type";
        let subtext = span();
        subtext.innerHTML = this.data.artists.join(", ");
        subtext.className = "subtext_al";
        subtext.slot = "subtext";
        let subsubtext = span();
        subsubtext.innerHTML = rearrangeDate(this.data.release) + this.SEPARATOR + this.data.tracks + " track" + correctSsuffix(this.data.tracks) + this.SEPARATOR + this.data.duration;
        subsubtext.className = "subsubtext";
        subsubtext.slot = "subsubtext";
        let slots = [cover, type, albumname, subtext, subsubtext];
        cel.populateSlots(slots);
        this.header = cel.getElement(null, false);
        this.header.className = "albumheader";
    }
    setTracks(e) {
        this.tracks = e;
    }
    setTracksElements(e) {
        this.trackel = e;
    }
}
function createTracksDisplay(tracks) {
    let items = tracks.items;
    let tracklist = [];
    let trackelements = [];
    for (var i = 0; i < items.length; i++) {
        let item = items[i];
        let o = {
            name: item.name,
            duration: item.duration_ms,
            features: [],
            track_no: item.track_number
        };
        tracklist.push(o);
        let name = span();
        name.innerHTML = o.name;
        name.className = "trackdetail";
        let duration = span();
        duration.innerHTML = secondsToTimeString(Math.round(o.duration / 1000));
        duration.className = "trackdetail";
        let el = database.getElement("albumtrack");
        let cel = new CustomElement(el.name, el.getContent());
        cel.populateSlots([name, duration]);
        let fel = cel.getElement(null, false);
        fel.className = "albumtrack";
        trackelements.push(fel);
    }
    currentalbum.setTracks(tracklist);
    currentalbum.setTracksElements(trackelements);
    currentalbum.create(2);
}
function createAlbumView(res) {
    if (res.status == RequestStatus.RESOLVED) {
        let data = res.result;
        let artists = [];
        for (var i = 0; i < data.artists.length; i++) {
            artists.push(data.artists[i].name);
        }
        let images = [];
        for (var i = 0; i < data.images.length; i++) {
            images.push(data.images[i].url);
        }
        let o = {
            type: "album",
            name: data.name,
            artists: artists,
            images: images,
            release: data.release_date,
            tracks: data.tracks.items.length,
            duration: 0,
            uri: data.uri
        };
        currentalbum = new AlbumView(o);
        createTracksDisplay(data.tracks);
    }
}
function displayAlbum(id) {
    replaceDomContent(document.createElement("div"), false);
    displayLoader();
    let req = new SpotiyApiAlbumRequest(id, []);
    req.execute(createAlbumView);
}
function hover(ev) {
    return;
    let t = ev.target;
    t.children[1].classList.add("front");
    if (t.children[0].style) {
        t.children[0].style.display = "inline-block";
    }
}
function unhover(ev) {
    return;
    let t = ev.target;
    if (t.children[0].style) {
        t.children[0].style.display = "none";
    }
    t.children[1].classList.remove("front");
}
/**
 * To convert from a data in American (bad) format to good format
 * @param date Date in bad format
 */
function rearrangeDate(date) {
    let parts = date.split("-");
    parts.reverse();
    let s = "";
    for (var i = 0; i < parts.length; i++) {
        if (i != parts.length - 1) {
            s += parts[i] + "-";
        }
        else {
            s += parts[i];
        }
    }
    return s;
}
/**
 * To captialize the first letter of a string
 * @param s String to capitalize the first letter of
 */
function capitalizeFirstLetter(s) {
    let f = s.charAt(0).toUpperCase();
    return f + s.substr(1);
}
/// <reference path="../elements/elements.d.ts" />
/// <reference path="../apiwrapper/js/script.d.ts" />
var homepage;
var ActionType;
(function (ActionType) {
    ActionType[ActionType["PLAY"] = 0] = "PLAY";
    ActionType[ActionType["INTENT"] = 1] = "INTENT";
})(ActionType || (ActionType = {}));
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
    displayLoader();
    let recentlyplayed = new SpotifyApiRecentTracksRequest(15);
    recentlyplayed.execute(createRecentTracksList);
}
function createRecentTracksList(result) {
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
    if (this.contexttype === "album") {
        let req = new SpotifyApiPlayRequest(true, this.uri, this.contextparams.offset - 1, null);
        req.execute((e) => { });
    }
}
function buildEntries(raw) {
    let arr = [];
    for (var i = 0; i < raw.length; i++) {
        let c = raw[i];
        let fail = false;
        for (var j = 0; j < arr.length; j++) {
            if (c.context) {
                if (arr[j].uri === c.context.uri) {
                    fail = true;
                    break;
                }
            }
            else {
                fail = true;
            }
        }
        if (!fail) {
            if (c.context) {
                let payload = {
                    type: ActionType.PLAY,
                    uri: c.context.uri,
                    contexttype: c.context.type
                };
                if (c.context.type == "album") {
                    payload.contextparams = {
                        offset: c.track.track_number
                    };
                }
                let o = {
                    name: c.track.name,
                    uri: c.context.uri,
                    image: c.track.album.images[0].url,
                    type: c.context.type,
                    payload: payload
                };
                arr.push(o);
            }
        }
    }
    return arr;
}
var navhistory;
var backbutton;
var forwardbutton;
var contentdom;
var currentposition = -1;
var NavigationPosition;
(function (NavigationPosition) {
    NavigationPosition[NavigationPosition["BACK"] = 0] = "BACK";
    NavigationPosition[NavigationPosition["FRONT"] = 1] = "FRONT";
})(NavigationPosition || (NavigationPosition = {}));
class NavigationHistory {
    constructor() {
        this.entries = [];
        this.ids = [];
    }
    /**
     * Adds a state to the navigation history and increments the current position
     * @param position Whether to add the entry at the front or at the back of the history
     * @param entry The entry to add
     */
    addState(position, entry) {
        this.ids.push(entry.id);
        if (position === NavigationPosition.BACK) {
            this.entries.push(entry);
        }
        else {
            this.entries.unshift(entry);
        }
        currentposition++;
        this.collectGarbage();
    }
    collectGarbage() {
        if (this.ids.length > 10) {
            this.ids.splice(0, 10);
            this.entries.splice(0, 10);
        }
    }
    /**
     * Returns true if navigation history has previous states for the current position
     */
    hasPrevious() {
        return currentposition > 0;
    }
    /**
     * Returns true if navigation hisotry has more states beyond the current position
     */
    hasNext() {
        return currentposition + 1 < this.entries.length;
    }
    /**
     * Gets the previous state (relative to the value of current position)
     */
    getPreviousState() {
        return this.entries[currentposition - 1];
    }
    /**
     * Gets the next state (relative to the value of current position)
     */
    getNextState() {
        return this.entries[currentposition + 1];
    }
    /**
     * Gets the state at the index of the value of current position
     */
    getCurrentState() {
        return this.entries[currentposition];
    }
}
class NavigationEntry {
    /**
     * Gets the html content for this state
     */
    getHTML() {
        return this.htmlContent;
    }
}
function initializeNavigation() {
    navhistory = new NavigationHistory();
    backbutton = document.getElementById("back");
    forwardbutton = document.getElementById("forward");
    backbutton.addEventListener("click", handleBack);
    forwardbutton.addEventListener("click", handleForward);
    contentdom = document.getElementById("content");
}
function handleBack() {
    if (navhistory.hasPrevious()) {
        currentposition--;
        replaceDomContent(navhistory.getCurrentState().htmlContent, false);
    }
}
function handleForward() {
    if (navhistory.hasNext()) {
        currentposition++;
        replaceDomContent(navhistory.getCurrentState().htmlContent, false);
    }
}
/**
 * Replaces the current content of the content area of the ui.
 * @param newhtml The content to insert instead of the old content
 * @param addEntry Determines whether or not to add a navigation history entry for this content
 * @returns The appended element
 */
function replaceDomContent(newhtml, addEntry) {
    if (addEntry) {
        let newid = generateID();
        let entry = new NavigationEntry();
        entry.htmlContent = newhtml;
        entry.id = newid;
        navhistory.addState(NavigationPosition.BACK, entry);
    }
    while (contentdom.firstElementChild != contentdom.lastElementChild) {
        contentdom.removeChild(contentdom.lastElementChild);
    }
    return contentdom.appendChild(newhtml);
}
function clearDomContent() {
    while (contentdom.firstElementChild != contentdom.lastElementChild) {
        contentdom.removeChild(contentdom.lastElementChild);
    }
    return contentdom;
}
/**
 * Generates a unique id for navigation entries
 */
function generateID() {
    let id = "";
    do {
        for (var i = 0; i < 4; i++) {
            id += Math.floor((Math.random() * 9));
        }
    } while (navhistory.ids.indexOf(parseInt(id)) >= 0);
    return parseInt(id);
}
addLoadEvent(initializeNavigation);
//// <reference path="../apiwrapper/ts/spotifyapirequest.ts" />
var queryrunning;
var Category;
(function (Category) {
    Category["ALBUMS"] = "Albums";
    Category["ARTISTS"] = "Artists";
    Category["TRACKS"] = "Tracks";
    Category["PLAYLISTS"] = "Playlists";
})(Category || (Category = {}));
class SearchResults {
    constructor(artists, albums, tracks, playlists, query) {
        this.categories = [];
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
        let celement = new CustomElement(element.name, element.getContent());
        this.celement = celement;
    }
    finalise() {
        this.celement.populateSlots([this.header]);
        this.element = this.celement.getElement(null, false).children[0];
        this.categories.forEach(element => {
            element.finalise();
            this.element.appendChild(element.htmlelement);
        });
    }
    attach() {
        this.finalise();
        replaceDomContent(this.element, true);
        attachEventListeners(this);
    }
    addCategory(element) {
        this.categories.push(element);
    }
}
class SearchResultsCategory {
    constructor(type, element, header, next) {
        this.entries = [];
        this.categorytype = type;
        this.nexturl = next;
        this.element = element;
        this.header = header;
    }
    addEntry(entry) {
        this.entries.push(entry);
    }
    finalise() {
        this.element.populateSlots([this.header]);
        this.htmlelement = this.element.getElement(null, false).children[0];
        this.entries.forEach(element => {
            let a = this.htmlelement.appendChild(element.element);
            element.domtarget = (a);
            element.fetchDomTargets();
        });
        this.seemorebutton = this.htmlelement.getElementsByClassName("search_results_category_more")[0];
        this.seemorebutton.addEventListener("click", function () { }.bind(this.nexturl));
    }
}
class SearchResultsEntry {
    constructor(type, customelement, imageelement, labelelement, imgpayload, textpayload) {
        this.type = type;
        this.imageelement = imageelement;
        this.labelelement = labelelement;
        this.imageactionpayload = imgpayload;
        this.textactionpayload = textpayload;
        this.customelement = customelement;
        this.element = customelement.getElement(null, false).children[0];
    }
    fetchDomTargets() {
        let image = this.domtarget.children[0];
        let text = this.domtarget.children[1];
        let maintext = text.children[0];
        let subtext = text.children[1];
        this.domtargets = { image: image, maintext: maintext, subtext: subtext };
    }
}
;
;
var currentresults;
function buildSearchResults(items) {
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
            let descriptor = document.createElement("div");
            descriptor.slot = "search_results_entry_label";
            descriptor.className = "search_results_entry_label";
            descriptor.innerHTML = entry.maintext;
            descriptor.title = entry.maintext;
            //@ts-ignore
            $clamp(descriptor, { clamp: 1, useNativeClamp: true });
            let subtext = document.createElement("div");
            subtext.slot = "search_results_entry_label_sub";
            subtext.className = "search_results_entry_label";
            subtext.classList.add("sub");
            if (entry.subtext) {
                subtext.innerHTML = entry.subtext;
                subtext.title = entry.subtext;
            }
            //@ts-ignore
            $clamp(subtext, { clamp: 1, useNativeClamp: true });
            let element = database.getElement("search-results-entry");
            let celement = new CustomElement(element.name, element.getContent());
            celement.populateSlots([image, descriptor, subtext]);
            let sentry = new SearchResultsEntry(item.type, celement, image, descriptor, entry.imagepayload, entry.maintextpayload);
            category.addEntry(sentry);
            sentry = null;
            delete { celement }.celement;
        }
        currentresults.addCategory(category);
    }
    currentresults.attach();
}
function buildCategory(htxt) {
    let header = document.createElement("span");
    header.className = "search_results_category_header";
    header.slot = "search_results_category_header";
    header.innerHTML = htxt;
    let element = database.getElement('search-results-category');
    let celement = new CustomElement(element.name, element.getContent());
    return { element: celement, header: header };
}
function attachEventListeners(a) {
    let cats = a.categories;
    for (var i = 0; i < cats.length; i++) {
        let currentcategory = cats[i];
        for (var j = 0; j < currentcategory.entries.length; j++) {
            let entry = currentcategory.entries[j];
            entry.domtargets.image.addEventListener("click", function () {
                if (this.contexttype == "album" || this.contexttype == "artist") {
                    let req = new SpotifyApiPlayRequest(true, this.uri, 0, []);
                    req.execute((e) => { });
                }
                else {
                    let req = new SpotifyApiPlayRequest(false, null, null, [this.uri]);
                    req.execute((e) => { });
                }
            }.bind(entry.textactionpayload));
            entry.domtargets.maintext.addEventListener("click", function () {
                if (this.contexttype == "album") {
                    displayAlbum(this.id);
                }
                else if (this.contexttype == "track") {
                    //Open album
                }
            }.bind(entry.textactionpayload));
        }
    }
}
function buildQueryResults(result) {
    if (result.status === RequestStatus.RESOLVED) {
        var artists = result.result.artists.items;
        var albums = result.result.albums.items;
        var tracks = result.result.tracks.items;
        var playlists = result.result.playlists.items;
        var artistsarray = {};
        artistsarray.items = [];
        artistsarray.type = Category.ARTISTS;
        for (var i = 0; i < artists.length; i++) {
            let current = artists[i];
            let o = {};
            if (current.images) {
                if (current.images.length > 0) {
                    o.image = current.images[0].url;
                }
            }
            let followers = current.followers.total;
            o.maintext = current.name;
            o.subtext = formatNumberString(followers.toString()) + " follower" + correctSsuffix(followers);
            o.imagepayload = null;
            o.maintextpayload = null;
            artistsarray.items.push(o);
        }
        var albumsarray = {};
        albumsarray.items = [];
        albumsarray.type = Category.ALBUMS;
        for (var i = 0; i < albums.length; i++) {
            let current = albums[i];
            let o = {};
            if (current.images) {
                if (current.images.length > 0) {
                    o.image = current.images[0].url;
                }
            }
            o.maintext = current.name;
            o.subtext = current.artists[0].name;
            let imagepayload = {
                "type": ActionType.PLAY,
                "contexttype": "album",
                "uri": current.uri
            };
            let textpayload = {
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
        var tracksarray = {};
        tracksarray.items = [];
        tracksarray.type = Category.TRACKS;
        for (var i = 0; i < tracks.length; i++) {
            let current = tracks[i];
            let o = {};
            if (current.album.images) {
                if (current.album.images.length > 0) {
                    o.image = current.album.images[0].url;
                }
            }
            o.maintext = current.name;
            o.subtext = current.album.artists[0].name + " - " + current.album.name;
            let imagepayload = {
                "type": ActionType.PLAY,
                "contexttype": "track",
                "uri": current.uri
            };
            let textpayload = {
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
        var playlistsarray = {};
        playlistsarray.items = [];
        playlistsarray.type = Category.PLAYLISTS;
        for (var i = 0; i < playlists.length; i++) {
            let current = playlists[i];
            let o = {};
            if (current.images) {
                if (current.images.length > 0) {
                    o.image = current.images[0].url;
                }
            }
            o.maintext = current.name;
            o.subtext = "By: " + current.owner.display_name;
            o.imagepayload = null;
            o.maintextpayload = null;
            o.subtextpayload = null;
            playlistsarray.items.push(o);
        }
        buildSearchResults([artistsarray, albumsarray, tracksarray, playlistsarray]);
    }
}
function search(query) {
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
function formatNumberString(str) {
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
addLoadEvent(() => {
    document.getElementById("searchbox").addEventListener("keyup", (ev) => {
        if (!queryrunning) {
            queryrunning = setTimeout(() => {
                search(ev.target.value);
            }, 200);
        }
        else {
            clearTimeout(queryrunning);
            queryrunning = setTimeout(() => {
                search(ev.target.value);
            }, 200);
        }
    });
});
//// <reference path="../elements/elements.ts" /> 
//// <reference path="../apiwrapper/ts/spotifyapirequest.ts" />
//import {Spinner, SpinnerOptions} from '../../node_modules/spin.js/spin';
var volumecontrolopen = false;
var loader;
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
function setVolume(amount) {
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
/**
 * To get the correct plural suffix for a word
 * @param quantity quantity of objects.
 */
function correctSsuffix(quantity) {
    if (quantity === 1) {
        return "";
    }
    return "s";
}
function displayLoader() {
    contentdom.appendChild(loader);
}
function stringToDom(str) {
    var parser = new DOMParser();
    return parser.parseFromString(str, "text/html");
}
function span() {
    return document.createElement("span");
}
addLoadEvent(function () {
    loader = stringToDom("<div id='loader' class='loader_holder'><div class='lds-facebook'><div></div><div></div><div></div></div></div>").firstChild;
});
