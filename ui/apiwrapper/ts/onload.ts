function addLoadEvent(func : Function) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        //@ts-ignore
      window.onload = func;
    } else {
      window.onload = function(ev) {
        if (oldonload) {
            //@ts-ignore
          oldonload(ev);
        }
        func(ev);
      }
    }
}