(function(){
    let bookmarklet_js;
    if (!window.bookmarklet) {
        bookmarklet_js = document.body.appendChild(document.createElement('script'));
        {% load static %}
        bookmarklet_js.src = '//{{ request.get_host }}{% static "js/bookmarklet.js" %}?r='
            + Math.floor(Math.random() * 9999999999999999)
            + '&css={% static "css/bookmarklet.css" %}';
        window.bookmarklet = true;
    } else {
        if (typeof bookmarkletLaunch === 'function') { bookmarkletLaunch(); }
    }
})();