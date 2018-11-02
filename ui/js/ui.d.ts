/// <reference path="../elements/elements.d.ts" />
/// <reference path="../apiwrapper/js/script.d.ts" />
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
declare enum ActionType {
    PLAY = 0,
    INTENT = 1
}
interface ActionPayload {
    type: ActionType;
    uri: string;
}
declare var volumecontrolopen: boolean;
declare function createSidebarEntry(name: string): HTMLDivElement;
declare function createPlayBackControls(sidebarentry: HTMLDivElement): Element;
declare function toggleSidebarEntry(entry: HTMLElement, icon: HTMLElement): void;
declare function toggleVolumeControl(): void;
declare function setVolume(): void;
declare function testSearch(): void;
