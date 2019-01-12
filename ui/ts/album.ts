/// /<reference path="../apiwrapper/ts/spotifyapirequest.ts" />
///// <reference path="../elements/elements.d.ts" />

var currentalbum : AlbumView;

interface AlbumData {
    type: string,
    name: string,
    artists : Array<string>,
    images : Array<string>,
    release: string,
    tracks: number,
    duration : number,
    uri: string
}

interface TrackData {
    name: string,
    duration: number,
    features : Array<string>,
    track_no : number,
    disc_no : number
}

interface TrackObjectDomtarget {
    target: Node,
    payload: ActionPayload;
}

class AlbumView {
    SEPARATOR = "&nbsp; | &nbsp;";

    data : AlbumData
    domTargetMain : Node;
    domTargetImages : Node;
    domTargetsTracks : Array<TrackObjectDomtarget> = [];
    header : HTMLDivElement;

    tracks : Array<TrackData>;
    trackel : Array<HTMLDivElement>;

    currentcreationoffset : number = 0;

    constructor(data : AlbumData) {
        this.data = data;
        this.create(1);
    }

    create(step : number) {
        if (step === 1) {
            let el = database.getElement("albumview");
            let cel = new CustomElement(el.name, <Array<Element>>el.getContent());
            let ell = cel.getElement(null, false).children[0];
            this.createHeader();
            ell.prepend(this.header);
            this.domTargetMain = replaceDomContent(ell, true);
            this.domTargetImages = this.domTargetMain.firstChild.firstChild;
        } else if (step === 2) {
            let holder = document.createElement("div");
            holder.className = "albumenumeration";
            let h = this.domTargetMain.appendChild(holder);
            for (var i = 0; i < this.trackel.length; i++) {
                let l : Node = <Node>h.appendChild(this.trackel[i]);
                let offset = this.tracks[i].track_no;
                if (this.tracks[i].disc_no > 1) {
                    offset = ++this.currentcreationoffset;
                } else {
                    this.currentcreationoffset++;
                }
                let o : ActionPayload = {
                    type: ActionType.PLAY,
                    contexttype: "album",
                    contextparams: {offset: offset},
                    uri: this.data.uri
                };
                let d : TrackObjectDomtarget = {
                    target: l,
                    payload: o
                }
                this.domTargetsTracks.push(d);
            }
            this.create(3);
        } else if (step === 3) {
            for (var i = 0; i < this.domTargetsTracks.length; i++) {
                let target = this.domTargetsTracks[i].target;
                let payload = this.domTargetsTracks[i].payload;
                let f = () => {
                    let r = new SpotifyApiPlayRequest(true, payload.uri, payload.contextparams.offset-1);
                    r.execute(()=>{});
                };
                this.attachListener("click", f, target);
                this.attachListener("mouseenter", hover, target);
                this.attachListener("mouseout", unhover, target);
            }
        }
    }

    attachListener(type : string, action : Function, target : Node) {
        target.addEventListener(type, <EventListener>action);
    }

    createHeader() {
        let el = database.getElement("albumheader");
        let cel = new CustomElement(el.name, <Array<Element>>el.getContent());
        
        let cover = document.createElement("img");
        cover.src = this.data.images[0];
        cover.className = "albumcover";
        cover.slot = "albumcover";

        let albumname = span();
        albumname.innerHTML = this.data.name;
        albumname.className = "maintext";
        albumname.slot = "maintext";
        //@ts-ignore
        $clamp(albumname, {clamp: 2, useNativeClamp: true});

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

        this.header = <HTMLDivElement>cel.getElement(null, false);
        this.header.className = "albumheader";
    }

    setTracks(e : Array<TrackData>) {
        this.tracks = e;
    }

    setTracksElements(e : Array<HTMLDivElement>) {
        this.trackel = e;
    }
}

function createTracksDisplay(tracks : any) {
    let items = tracks.items;

    let tracklist : Array<TrackData> = [];
    let trackelements : Array<HTMLDivElement> = [];
    for (var i = 0; i < items.length; i++) {
        let item = items[i];

        let o : TrackData = {
            name: item.name,
            duration: item.duration_ms,
            features: [],
            track_no: item.track_number,
            disc_no: item.disc_number
        };

        tracklist.push(o);

        let name = span();
        name.innerHTML = o.name;
        name.className = "trackdetail";
        
        let duration = span();
        duration.innerHTML = secondsToTimeString(Math.round(o.duration / 1000));
        duration.className = "trackdetail";
        
        let el = database.getElement("albumtrack");
        let cel = new CustomElement(el.name, <Array<HTMLElement>>el.getContent());
        cel.populateSlots([name, duration]);

        let fel = cel.getElement(null, false);
        fel.className = "albumtrack";
        trackelements.push(<HTMLDivElement>fel);
    }

    currentalbum.setTracks(tracklist);
    currentalbum.setTracksElements(trackelements);
    currentalbum.create(2);
}

function createAlbumView(res : SpotifyApiRequestResult) {
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
        let o : AlbumData = {
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


function displayAlbum(id : string) {
    replaceDomContent(document.createElement("div"), false);
    displayLoader();
    let req = new SpotiyApiAlbumRequest(id, []);
    req.execute(createAlbumView);
}

function hover(ev : Event) {
    return;
    let t = <any>ev.target;
    t.children[1].classList.add("front");
    if (t.children[0].style) {
        t.children[0].style.display = "inline-block";
    }
}

function unhover(ev : Event){
    return;
    let t = <any>ev.target;
    if (t.children[0].style) {
        t.children[0].style.display = "none";
    }
    t.children[1].classList.remove("front");
}

/**
 * To convert from a data in American (bad) format to good format
 * @param date Date in bad format
 */
function rearrangeDate(date : string) : string {
    let parts = date.split("-");
    parts.reverse();
    let s = "";
    for (var i = 0; i < parts.length; i++) {
        if (i != parts.length-1) {
            s += parts[i] + "-";
        } else {
            s += parts[i];
        }
    }
    return s;
}

/**
 * To captialize the first letter of a string
 * @param s String to capitalize the first letter of
 */
function capitalizeFirstLetter(s : string) {
    let f = s.charAt(0).toUpperCase();
    return f + s.substr(1);
}