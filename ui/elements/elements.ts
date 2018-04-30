//Recreate rel="import" like behaviour
var imports = [];
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