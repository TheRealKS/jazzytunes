/// <reference path="../elements/elements.d.ts" />
/// <reference path="../apiwrapper/js/script.d.ts" />
/// <reference types="node" />
declare var homepage: HomePage;
declare class HomePage {
    header: HTMLSpanElement;
    entries: Array<HomePageEntry>;
    holder: HTMLDivElement;
    domTarget: HTMLDivElement;
    constructor(header: HTMLSpanElement);
    addEntry(headertext: string, entries: Array<HomePageInteractiveEntry>): void;
}
declare class HomePageEntry {
    element: HTMLDivElement;
    header: HTMLSpanElement;
    content: Array<HomePageInteractiveEntry>;
    domTarget: HTMLElement;
    constructor(header: HTMLSpanElement, entries: Array<HomePageInteractiveEntry>);
    create(): void;
    add(element: HomePageInteractiveEntry): void;
    clear(): void;
}
declare class HomePageInteractiveEntry {
    imageuri: string;
    label: string;
    imgelement: HTMLImageElement;
    labelelement: HTMLSpanElement;
    loader: boolean;
    element: Element;
    action: EventListener;
    actionpayload: ActionPayload;
    constructor(imageuri: string, labeltxt: string, action: EventListener, actionpayload: ActionPayload, loader?: boolean);
    create(): void;
}
declare function initHome(): void;
declare function createRecentTracksList(result: SpotifyApiRequestResult): void;
declare function getHomepageHeaderText(): string;
declare function playHomePageTrack(): void;
declare var queryrunning: NodeJS.Timer;
declare enum Category {
    ALBUMS = 0,
    ARTISTS = 1,
    TRACKS = 2,
    PLAYLISTS = 3
}
declare class SearchResults {
    artists: boolean;
    albums: boolean;
    tracks: boolean;
    playlists: boolean;
    query: string;
    categories: Array<SearchResultsCategory>;
    celement: CustomElement;
    element: HTMLDivElement;
    domtarget: HTMLDivElement;
    categoryholder: HTMLDivElement;
    header: HTMLSpanElement;
    constructor(artists: boolean, albums: boolean, tracks: boolean, playlists: boolean, query: string);
    create(): void;
    finalise(): void;
    attach(): void;
    addCategory(element: SearchResultsCategory): void;
}
declare class SearchResultsCategory {
    categorytype: Category;
    seemorebutton: HTMLDivElement;
    seemorepayload: ActionPayload;
    header: HTMLSpanElement;
    nexturl: string;
    entries: Array<SearchResultsEntry>;
    element: CustomElement;
    htmlelement: HTMLElement;
    constructor(type: Category, element: CustomElement, header: HTMLSpanElement, nexturl: string);
    addEntry(entry: SearchResultsEntry): void;
    finalise(): void;
}
declare class SearchResultsEntry {
    type: Category;
    imageelement: HTMLImageElement;
    labelelement: HTMLSpanElement;
    descriptor: HTMLDivElement;
    imageactionpayload: ActionPayload;
    textactionpayload: ActionPayload;
    customelement: CustomElement;
    element: HTMLElement;
    constructor(type: Category, customelement: CustomElement, imageelement: HTMLImageElement, labelelement: HTMLSpanElement, imgpayload: ActionPayload, textpayload: ActionPayload);
}
declare var currentresults: SearchResults;
declare function buildArtistAlbumSearchResult(result: SpotifyApiRequestResult): void;
declare function buildCategory(htxt: string): Object;
declare function buildTracksPlaylistsSearchResult(result: SpotifyApiRequestResult): void;
declare function attachEventListeners(a: HTMLDivElement): void;
declare function search(query: string): void;
declare enum ActionType {
    PLAY = 0,
    INTENT = 1
}
interface ActionPayload {
    type: ActionType;
    contexttype: string;
    uri: string;
}
declare var volumecontrolopen: boolean;
declare function createSidebarEntry(name: string): HTMLDivElement;
declare function createPlayBackControls(sidebarentry: HTMLDivElement): Element;
declare function toggleSidebarEntry(entry: HTMLElement, icon: HTMLElement): void;
declare function toggleVolumeControl(): void;
declare function setVolume(): void;
declare function testSearch(): void;
