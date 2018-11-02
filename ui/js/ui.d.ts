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
}
declare class HomePageInteractiveEntry {
    imageuri: string;
    label: string;
    imgelement: HTMLImageElement;
    labelelement: HTMLSpanElement;
    loader: boolean;
    element: any;
    constructor(imageuri: string, labeltxt: string, loader?: boolean);
    create(): void;
}
declare function initHome(): void;
declare function createRecentTracksList(result: SpotifyApiRequestResult): void;
declare function getHomepageHeaderText(): string;
declare function createSidebarEntry(name: string): HTMLDivElement;
declare function createPlayBackControls(sidebarentry: HTMLDivElement): any;
declare function createSpinner(): any;
