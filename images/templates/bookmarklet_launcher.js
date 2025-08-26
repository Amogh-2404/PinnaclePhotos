(function(){
    let bookmarklet_js;
    if (!window.bookmarklet) {
        bookmarklet_js = document.body.appendChild(document.createElement('script'));
        {% load static %}
        var host = '{{ request.get_host }}';
        var isLocal = host.indexOf('localhost') === 0 || host.indexOf('127.0.0.1') === 0;
        var prefix = isLocal ? 'http://' : '//';
        bookmarklet_js.src = prefix + host + '{% static "js/bookmarklet.js" %}?r='
            + Math.floor(Math.random() * 9999999999999999)
            + '&css={% static "css/bookmarklet.css" %}';
        window.bookmarklet = true;
    } else {
        if (typeof bookmarkletLaunch === 'function') { bookmarkletLaunch(); }
    }
})();