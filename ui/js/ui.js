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
            let content = document.getElementById("content");
            while (content.firstElementChild != content.lastElementChild) {
                content.removeChild(content.lastElementChild);
            }
            this.domTargetMain = content.appendChild(ell);
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
        subsubtext.innerHTML = rearrangeDate(this.data.release) + this.SEPARATOR + this.data.tracks + " tracks" + this.SEPARATOR + this.data.duration;
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
    let req = new SpotiyApiAlbumRequest(id, []);
    req.execute(createAlbumView);
}
function hover(ev) {
    let t = ev.target;
    if (t) {
        t.children[1].classList.add("front");
        t.children[0].style.display = "inline-block";
    }
}
function unhover(ev) {
    let t = ev.target;
    if (t) {
        t.children[0].style.display = "none";
        t.children[1].classList.remove("front");
    }
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
//// <reference path="../apiwrapper/ts/spotifyapirequest.ts" />
var queryrunning;
var Category;
(function (Category) {
    Category[Category["ALBUMS"] = 0] = "ALBUMS";
    Category[Category["ARTISTS"] = 1] = "ARTISTS";
    Category[Category["TRACKS"] = 2] = "TRACKS";
    Category[Category["PLAYLISTS"] = 3] = "PLAYLISTS";
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
        header.innerHTML = "Results for query \"" + this.query + "\"";
        this.header = header;
        this.categoryholder = document.createElement("div");
        this.categoryholder.slot = "search_results_categories";
        this.categoryholder.className = "search_results_categories";
        let element = database.getElement('searchresults');
        let celement = new CustomElement(element.name, element.getContent());
        this.celement = celement;
    }
    finalise() {
        this.celement.populateSlots([this.header, this.categoryholder]);
        this.element = this.celement.getElement(null, false).children[0];
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
    addCategory(element) {
        this.categories.push(element);
    }
}
class SearchResultsCategory {
    constructor(type, element, header, nexturl) {
        this.entries = [];
        this.categorytype = type;
        this.nexturl = nexturl;
        this.element = element;
        this.header = header;
    }
    addEntry(entry) {
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
        this.htmlelement = this.element.getElement(null, false).children[0];
        this.seemorebutton = this.htmlelement.getElementsByClassName("search_results_category_more")[0];
        this.seemorepayload = {
            "type": ActionType.INTENT,
            "contexttype": "moreresults",
            "uri": this.nexturl
        };
        this.seemorebutton.addEventListener("click", function () { }.bind(this.seemorepayload));
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
}
var currentresults;
function buildArtistAlbumSearchResult(result) {
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
            let celement = new CustomElement(element.name, element.getContent());
            celement.populateSlots([image, descriptor, document.createElement("span")]);
            let imagepayload = {
                "type": ActionType.PLAY,
                "contexttype": "artist",
                "uri": artists[i].uri
            };
            let textpayload = {
                "type": ActionType.INTENT,
                "contexttype": "artist",
                "uri": artists[i].uri
            };
            let sentry = new SearchResultsEntry(Category.ARTISTS, celement, image, descriptor, imagepayload, textpayload);
            cat.addEntry(sentry);
            sentry = null;
            delete { celement }.celement;
        }
        let catt = new SearchResultsCategory(Category.ALBUMS, albumscategory.element, albumscategory.header, albums.next);
        for (var i = 0; i < albums.length; i++) {
            let imagepayload = {
                "type": ActionType.PLAY,
                "contexttype": "album",
                "uri": albums[i].uri
            };
            let textpayload = {
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
            image.addEventListener('click', function () { console.log("DDD"); }.bind(imagepayload));
            let descriptor = document.createElement("span");
            descriptor.slot = "search_results_entry_label";
            descriptor.className = "search_results_entry_label";
            descriptor.innerHTML = albums[i].name;
            descriptor.addEventListener("click", function () { console.log("HALLO"); }.bind(textpayload));
            let element = database.getElement("search-results-entry");
            let celement = new CustomElement(element.name, element.getContent());
            celement.populateSlots([image, descriptor, document.createElement("span")]);
            let sentry = new SearchResultsEntry(Category.ALBUMS, celement, image, descriptor, imagepayload, textpayload);
            catt.addEntry(sentry);
            sentry = null;
            delete { celement }.celement;
        }
        currentresults.addCategory(cat);
        currentresults.addCategory(catt);
    }
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
function buildTracksPlaylistsSearchResult(result) {
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
            let celement = new CustomElement(element.name, element.getContent());
            celement.populateSlots([image, descriptor, document.createElement("span")]);
            let imagepayload = {
                "type": ActionType.PLAY,
                "contexttype": "track",
                "uri": tracks[i].uri
            };
            let textpayload = {
                "type": ActionType.INTENT,
                "contexttype": "track",
                "uri": tracks[i].uri,
            };
            let sentry = new SearchResultsEntry(Category.TRACKS, celement, image, descriptor, imagepayload, textpayload);
            category1.addEntry(sentry);
            sentry = null;
            delete { celement }.celement;
        }
        currentresults.addCategory(category1);
        currentresults.attach();
    }
}
function attachEventListeners(a) {
    let children = a.children;
    let cats = children[1].children;
    for (var i = 0; i < currentresults.categories.length; i++) {
        let currentcategory = cats[i];
        let entries = currentcategory.getElementsByClassName("search_results_category_entries")[0].children;
        for (var j = 0; j < entries.length; j++) {
            let entrydata = currentresults.categories[i].entries[j];
            let entry = entries[j];
            entry.getElementsByClassName("search_results_entry_image")[0].addEventListener("click", function () {
                if (this.contexttype == "album" || this.contexttype == "artist") {
                    let req = new SpotifyApiPlayRequest(true, this.uri, 0, []);
                    req.execute((e) => { });
                }
                else {
                    let req = new SpotifyApiPlayRequest(false, null, null, [this.uri]);
                    req.execute((e) => { });
                }
            }.bind(entrydata.textactionpayload));
            entry.getElementsByClassName("search_results_entry_descriptor")[0].addEventListener("click", function () {
                if (this.contexttype == "album") {
                    displayAlbum(this.id);
                }
            }.bind(entrydata.textactionpayload));
        }
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
function testSearch() {
    let request = new SpotifyApiSearchRequest(true, true, true, true, 10);
    request.buildGeneralQuery(["fefe", "nicki"], false);
    request.execute((result) => {
        console.log(result);
    });
}
function span() {
    return document.createElement("span");
}
