//// <reference path="../apiwrapper/ts/spotifyapirequest.ts" />
//// <reference path="../elements/elements.ts" /> 
function initHome() {
    let homepageheader = document.createElement("span");
    homepageheader.slot = "homepage_header_text";
    homepageheader.className = "homepage_header_text";
    homepageheader.innerHTML = getHomepageHeaderText() + " What would you like to listen to?";

    let slots = [homepageheader];
    let element = database.getElement("homepage");
    element.populateSlots(slots);
    let container = element.getElement(null, false).children[0];
    
    let omepageheader = document.createElement("slot");
    omepageheader.slot = "homepage_entry_header";
    omepageheader.className = "homepage_entry_header";
    omepageheader.innerHTML = "Your recent tracks:";

    let entriesholder = document.createElement("div");

    let image = document.createElement("img");
    image.src="assets/images/baseline_album_white_48dp.gif";
    image.slot = "homepage_entry_image";
    image.className = "homepage_entry_image";
    let header = document.createElement("span");
    header.className = "homepage_entry_label";
    header.slot = "homepage_entry_label";
    header.innerHTML = "Loading...";

    let singlentry = database.getElement("homepage-entry-single");
    singlentry.populateSlots([image, header]);
    let single = singlentry.getElement(null, false).children[0];

    let slot = [omepageheader, single];

    let contentholder = database.getElement("homepage-entry");
    contentholder.populateSlots(slot);

    let content = contentholder.getElement(null, false).children[0];
    
    container.appendChild(content);

    document.getElementById("content").appendChild(container);

    let recentlyplayed = new SpotifyApiRecentTracksRequest(5);
    
}

function getHomepageHeaderText() : string {
    let date = new Date();
    let hourslocale = date.getUTCHours() - (date.getTimezoneOffset() / 60);
    if (hourslocale >= 7 && hourslocale < 12) {
        return "Good morning!";
    } else if (hourslocale >= 12 && hourslocale < 17) {
        return "Good afternoon!";
    } else if (hourslocale >= 17 && hourslocale < 23) {
        return "Good evening!";
    } else if (hourslocale >= 23 && hourslocale < 7) {
        return "Good night!";
    }
}