function redirect() {
    window.open("redirect.html");
}

window.addEventListener('storage', function(e) {
    alert(e.key);
})