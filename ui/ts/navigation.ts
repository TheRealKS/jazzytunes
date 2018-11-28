var navhistory : NavigationHistory;

var backbutton : HTMLElement;
var forwardbutton : HTMLElement;

var contentdom : HTMLElement;

var currentposition : number = -1;

enum NavigationPosition {
    BACK,
    FRONT
}

class NavigationHistory {
    entries : Array<NavigationEntry> = [];
    ids : Array<number> = [];

    currentposition : NavigationEntry;

    /**
     * Adds a state to the navigation history and increments the current position
     * @param position Whether to add the entry at the front or at the back of the history
     * @param entry The entry to add
     */
    addState(position : NavigationPosition, entry : NavigationEntry) {
        this.ids.push(entry.id);
        if (position === NavigationPosition.BACK) {
            this.entries.push(entry);
        } else {
            this.entries.unshift(entry);
        }
        currentposition++;

        this.collectGarbage();
    } 

    private collectGarbage() {
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
        return this.entries[currentposition-1];
    }

    /**
     * Gets the next state (relative to the value of current position)
     */
    getNextState() {
        return this.entries[currentposition+1];
    }

    /**
     * Gets the state at the index of the value of current position
     */
    getCurrentState() {
        return this.entries[currentposition];
    }
}

class NavigationEntry {
    id : number;
    htmlContent : any;

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
function replaceDomContent(newhtml : any, addEntry : boolean) {
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
function generateID() : number {
    let id : string = "";
    do {
        for (var i = 0; i < 4; i++) {
            id += Math.floor((Math.random() * 9));
        }
    } while (navhistory.ids.indexOf(parseInt(id)) >= 0);
    return parseInt(id);
}

addLoadEvent(initializeNavigation);