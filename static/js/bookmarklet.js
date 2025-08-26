var scripts = document.getElementsByTagName('script');
var currentScript = document.currentScript || scripts[scripts.length - 1];
var src = currentScript && currentScript.src ? currentScript.src : '';
var anchor = document.createElement('a'); anchor.href = src;
var siteOrigin = anchor.origin || (anchor.protocol + '//' + anchor.host);
var siteUrl = siteOrigin + '/';
var cssMatch = src.indexOf('?') !== -1 ? src.substring(src.indexOf('?') + 1).match(/(?:^|&)css=([^&]+)/) : null;
var styleUrl = siteOrigin + (cssMatch ? decodeURIComponent(cssMatch[1]) : '/static/css/bookmarklet.css');
const minWidth = 120;
const minHeight = 120;

// Load CSS

var head = document.getElementsByTagName('head')[0];
var link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = styleUrl + '?r=' + Math.floor(Math.random() * 9999999999999999);
head.appendChild(link);

// Load HTML
var body = document.getElementsByTagName('body')[0];
var boxHtml = `
        <div id="bookmarklet">
            <a href="#" id="close">&times;</a>
            <h1>Select an image to bookmark:</h1>
            <div class="images"></div>
        </div>`;
body.innerHTML += boxHtml;

function bookmarkletLaunch() {
    let bookmarklet = document.getElementById('bookmarklet');
    var imagesFound = bookmarklet.querySelector('.images');
    // Clear images found
    imagesFound.innerHTML = '';
    // Display bookmarklet
    bookmarklet.style.display = 'block';
    // Close event
    bookmarklet.querySelector('#close').addEventListener('click', function () {
        bookmarklet.style.display = 'none';
    });
    // Collect candidates from <img> and CSS background images
    const added = new Set();
    function pickFromSrcset(srcset) {
        try {
            const parts = srcset.split(',').map(s => s.trim()).filter(Boolean);
            let best = '', bestW = 0;
            parts.forEach(p => {
                const [u, w] = p.split(/\s+/);
                const m = /(\d+)w/.exec(w || '');
                const wv = m ? parseInt(m[1], 10) : 0;
                if (wv >= bestW) { bestW = wv; best = u; }
            });
            return best || (parts[0] ? parts[0].split(/\s+/)[0] : '');
        } catch (e) { return ''; }
    }
    function resolveUrl(img) {
        let u = (img.currentSrc || img.src || '').trim();
        if (!u && img.srcset) { u = pickFromSrcset(img.srcset); }
        if (!u) {
            const cand = img.getAttribute('data-src') || img.getAttribute('data-original') || img.getAttribute('data-lazy-src') || img.getAttribute('data-lazyload') || img.getAttribute('data-srcset');
            if (cand) {
                u = cand.indexOf(',') !== -1 ? pickFromSrcset(cand) : cand.trim();
            }
        }
        return u;
    }
    function addCandidate(url, w, h) {
        if (!url || url.startsWith('data:')) return;
        if ((w || 0) < minWidth || (h || 0) < minHeight) return;
        if (added.has(url)) return;
        var imageFound = document.createElement('img');
        imageFound.src = url;
        imagesFound.append(imageFound);
        added.add(url);
    }
    // IMG elements (including lazyloaded/srcset)
    document.querySelectorAll('img').forEach(img => {
        const u = resolveUrl(img);
        const w = img.naturalWidth || img.width || img.clientWidth || 0;
        const h = img.naturalHeight || img.height || img.clientHeight || 0;
        addCandidate(u, w, h);
    });
    // CSS background images
    Array.prototype.forEach.call(document.querySelectorAll('*'), function(el) {
        const style = window.getComputedStyle(el);
        const bg = style && style.backgroundImage;
        if (!bg || bg === 'none') return;
        const m = /url\(("|')?([^"')]+)("|')?\)/.exec(bg);
        const url = m && m[2] ? m[2] : '';
        const rect = el.getBoundingClientRect();
        addCandidate(url, Math.round(rect.width), Math.round(rect.height));
    });
    imagesFound.querySelectorAll('img').forEach(image => {
        image.addEventListener('click', function (event) {
            let imageSelected = event.target;
            bookmarklet.style.display = 'none';
            window.open(
                siteUrl + 'images/create/?url=' + encodeURIComponent(imageSelected.src) + '&title=' + encodeURIComponent(document.title),
                '_blank'
            );
        });
    });
}

// Launch the bookmarklet
bookmarkletLaunch();

