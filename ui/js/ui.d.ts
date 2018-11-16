/// <reference path="../elements/elements.d.ts" />
/// <reference path="../apiwrapper/js/script.d.ts" />
/// <reference types="node" />
declare var currentalbum: AlbumView;
interface AlbumData {
    type: string;
    name: string;
    artists: Array<string>;
    images: Array<string>;
    release: string;
    tracks: number;
    duration: number;
    uri: string;
}
interface TrackData {
    name: string;
    duration: number;
    features: Array<string>;
    track_no: number;
}
interface TrackObjectDomtarget {
    target: Node;
    payload: ActionPayload;
}
declare class AlbumView {
    SEPARATOR: string;
    data: AlbumData;
    domTargetMain: Node;
    domTargetImages: Node;
    domTargetsTracks: Array<TrackObjectDomtarget>;
    header: HTMLDivElement;
    tracks: Array<TrackData>;
    trackel: Array<HTMLDivElement>;
    constructor(data: AlbumData);
    create(step: number): void;
    attachListener(type: string, action: Function, target: Node): void;
    createHeader(): void;
    setTracks(e: Array<TrackData>): void;
    setTracksElements(e: Array<HTMLDivElement>): void;
}
declare function createTracksDisplay(tracks: any): void;
declare function createAlbumView(res: SpotifyApiRequestResult): void;
declare function displayAlbum(id: string): void;
declare function hover(ev: Event): void;
declare function unhover(ev: Event): void;
/**
 * To convert from a data in American (bad) format to good format
 * @param date Date in bad format
 */
declare function rearrangeDate(date: string): string;
/**
 * To captialize the first letter of a string
 * @param s String to capitalize the first letter of
 */
declare function capitalizeFirstLetter(s: string): string;
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
interface ContextParmaters {
    offset: number;
}
interface ActionPayload {
    type: ActionType;
    contexttype: string;
    contextparams?: ContextParmaters;
    uri: string;
    id?: string;
}
declare var volumecontrolopen: boolean;
declare function createSidebarEntry(name: string): HTMLDivElement;
declare function createPlayBackControls(sidebarentry: HTMLDivElement): Element;
declare function toggleSidebarEntry(entry: HTMLElement, icon: HTMLElement): void;
declare function toggleVolumeControl(): void;
declare function setVolume(amount?: number): void;
declare function testSearch(): void;
declare function span(): HTMLSpanElement;
