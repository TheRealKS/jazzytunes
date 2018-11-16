addLoadEvent(function() {
    let classs = document.getElementsByClassName("albumtrack");
    for (var i = 0; i < classs.length; i++) {
        classs[i].addEventListener("mouseenter", hover);
        classs[i].addEventListener("mouseout", unhover);
    }
});

function hover(ev) {
    let t = ev.target;
    t.children[1].classList.add("front");
    t.children[0].style.display = "inline-block";
}

function unhover(ev){
    let t = ev.target;
    t.children[0].style.display = "none";
    t.children[1].classList.remove("front");
}