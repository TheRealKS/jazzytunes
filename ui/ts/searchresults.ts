/// <reference path="../apiwrapper/ts/spotifyapirequest.ts" />

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
    categories : Array<SearchResultsCategory>;

    constructor(artists : boolean, albums : boolean, tracks : boolean, playlists : boolean, query : string) {
        this.artists = artists;
        this.albums = albums;
        this.tracks = tracks;
        this.playlists = playlists;
        this.query = query;
    }

    create() {
        
    }
}

class SearchResultsCategory {
    categorytype : Category;
    seemorebutton : HTMLDivElement;
    entries : Array<SearchResultsEntry>;

    constructor() {

    }
}

class SearchResultsEntry {
    type : Category;
    imageelement : HTMLImageElement;
    labelelement : HTMLSpanElement;
    descriptor : HTMLDivElement;

    constructor() {

    }
}

var currentresults : SearchResults;

function buildArtistAlbumSearchResult(result : SpotifyApiRequestResult) {

}

function buildTracksPlaylistsSearchResult(result : SpotifyApiRequestResult) {

}

function search(query : string) {
    let request = new SpotifyApiSearchRequest(true, true, false, false, 4);
    request.buildGeneralQuery(query.split(" "));
    request.execute(buildArtistAlbumSearchResult);
    let request2 = new SpotifyApiSearchRequest(false, false, true, true, 10);
    request.buildGeneralQuery(query.split(" "));
    request2.execute(buildTracksPlaylistsSearchResult);

}

addLoadEvent(() => {
    document.getElementById("searchbox").addEventListener("input", (ev) => {
        search(ev.target.value);
    });
});