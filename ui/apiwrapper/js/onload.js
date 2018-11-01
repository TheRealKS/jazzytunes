function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
      window.onload = func;
    } else {
      window.onload = function(ev) {
        if (oldonload) {
          oldonload(ev);
        }
        func(ev);
      }
    }
}