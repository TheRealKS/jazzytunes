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
    element.getElement(document.getElementById("content"));

    let recentlyplayed = new SpotifyApiRecentTracksRequest(5);
    
}

function getHomepageHeaderText() : string {
    let date = new Date();
    let hourslocale = date.getUTCHours() + date.getTimezoneOffset();
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