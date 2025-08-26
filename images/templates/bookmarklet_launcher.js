(function(){
    let bookmarklet_js;
    if (!window.bookmarklet) {
        bookmarklet_js = document.body.appendChild(document.createElement('script'));
        {% load static %}
        var host = '{{ request.get_host }}';
        var isLocal = host.indexOf('localhost') === 0 || host.indexOf('127.0.0.1') === 0;
        // If the bookmarklet was saved from localhost but is being run on an HTTPS page,
        // fall back to the production host so the script can load over HTTPS.
        var onHttps = window.location.protocol === 'https:';
        var fallbackHost = 'photos.ramogh.com';
        var useHost = (onHttps && isLocal) ? fallbackHost : host;
        var prefix = (useHost.indexOf('localhost') === 0 || useHost.indexOf('127.0.0.1') === 0) ? 'http://' : '//';
        bookmarklet_js.src = prefix + useHost + '{% static "js/bookmarklet.js" %}?r='
            + Math.floor(Math.random() * 9999999999999999)
            + '&css={% static "css/bookmarklet.css" %}';
        window.bookmarklet = true;
    } else {
        if (typeof bookmarkletLaunch === 'function') { bookmarkletLaunch(); }
    }
})();