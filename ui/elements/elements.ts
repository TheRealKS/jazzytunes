//Recreate rel="import" like behaviour
function importElement(elementURI) {
    fetch(elementURI)
    .then((res) => {
        if (res.ok) {
            return res;
        }
    })
    .then((result) => {
        imports[elementURI] = result.text();
    });
}

function importElementList() {
    fetch("element-list.json").then((res) => {
        if (res.ok) {
            return res.json();
        }
    })
    .then(json => {
        //Loop through JSON to fetch critical components (Player UI and immediate sidebar UI etc.)
    });
}