////<reference path="../apiwrapper/ts/spotifyapirequest.ts" />
////<reference path="../elements/elements.d.ts" />

var currentTopTracks : Array<ActionPayload> = [];

function createFrameWork(artist : any) : Element {
    let followers = formatNumberString(artist.followers.total.toString());
    let name = artist.name;
    let popularity = artist.popularity;

    let nm = span();
    nm.className = "artist_information";
    nm.slot = "artist_information";
    nm.innerHTML = name + "<br><span>" + followers + " followers - " + determinePopularityString(popularity) + " popular</span>";

    let img = document.createElement("img");
    img.className = "artist_image";
    img.slot = "artist_image";
    img.src = artist.images[0].url;

    let ar = database.getElement("artist");
    let artistelement = new CustomElement(ar.name, ar.getContent());
    artistelement.populateSlots([img, nm]);
    return artistelement.getElement(null, false).firstElementChild;
}

function createArtistViewBox(type : string, right : boolean) {
    let container = document.createElement("div");
    container.classList.add("artist_content_box");
    if (right) container.classList.add("right");
    let s = span();
    s.innerHTML = type;
    let items = document.createElement("div");
    items.className = "artist_content_items";
    container.appendChild(s);   
    container.appendChild(items);
    return container;
}

function createContentItem(img : string, text : string, subtext : string, aux : string, rtl : boolean) {
    let image = document.createElement("img");
    image.slot = "item_image";
    image.src = img;

    let txt = span();
    txt.slot = "item_text";
    txt.innerHTML = text;
    let subtxt = span();
    subtxt.slot = "item_subtext";
    subtxt.innerHTML = subtext;
    let auxtxt = span();
    auxtxt.slot = "item_aux";
    auxtxt.innerHTML = aux;

    let el = database.getElement("artist-content-small");
    let cel = new CustomElement(el.name, el.getContent());
    cel.populateSlots([image, txt, subtxt, auxtxt]);
    let c = cel.getElement(null, false).firstElementChild;
    if (!rtl) c.classList.add("align_left");
    return c;
}

function createArtistView(results : Array<SpotifyApiRequestResult>) {
    let artist = results[0].result;
    let tracks = results[1];
    let albums = results[2];

    let artistframework = createFrameWork(artist); 
    let box = createArtistViewBox("Top Tracks", false);
    let box2 = createArtistViewBox("Albums", true);
    
    if (tracks.status === RequestStatus.RESOLVED) {
        var i = -1;
        for (let track of tracks.result.tracks) {
            let img = track.album.images[track.album.images.length-1].url;
            let text = track.name;
            let subtext = track.album.name + " (" + track.album.release_date.split("-")[0] + ")";
            let aux = track.popularity + "/100";    
            let view = createContentItem(img, text, subtext, aux, true);
            let payload : ActionPayload = {
                type: ActionType.PLAY,
                contexttype: "OTHER",
                uri: track.uri,
                contextparams: {offset: ++i}
            };
            currentTopTracks.push(payload);
            view.addEventListener("click", function() {
                let idarray = [];
                for (var i = this.contextparams.offset; i < currentTopTracks.length; i++) {
                    idarray.push(currentTopTracks[i].uri);
                }
                let req = new SpotifyApiPlayRequest(false, null, null, idarray);
                req.execute((e:any) => {});
            }.bind(payload));
            box.children[1].appendChild(view);
        }

        for (let album of albums.result.items) {
            if (album.album_group === "album") {
                let img = album.images[album.images.length-1].url;
                let text = album.name;
                let subtext = album.release_date.split("-")[0];
                let aux = album.album_type;
                let view = createContentItem(img, text, subtext, aux, false);
                view.addEventListener("click", function() {
                    displayAlbum(this);
                }.bind(album.id));
                box2.children[1].appendChild(view);
            }
        }

        let content = artistframework.getElementsByClassName("artist_content")[0];
        content.appendChild(box);
        content.appendChild(box2);

        replaceDomContent(artistframework, true);
    } else {
        console.error(tracks.error);
    }
}

function displayArtist(id : string) {
    replaceDomContent(document.createElement("div"), false);
    displayLoader();
    currentTopTracks = [];
    let x = new SpotifyApiArtistRequest(id);
    let xo = new SpotifyApiArtistTopTracksRequest(id, "NL");
    let opts = [];
    opts["limit"] = 5;
    let xox = new SpotifyApiArtistAlbumsRequest(id, opts);
    runMultipleRequests({"artist": x, "tracks": xo, "albums": xox}, function(results : Object) {
        createArtistView([results.artist, results.tracks, results.albums]);
    });
}