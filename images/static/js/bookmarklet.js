var scripts = document.getElementsByTagName('script');
var currentScript = document.currentScript || scripts[scripts.length - 1];
var src = currentScript && currentScript.src ? currentScript.src : '';
var anchor = document.createElement('a'); anchor.href = src;
var siteOrigin = anchor.origin || (anchor.protocol + '//' + anchor.host);
var siteUrl = siteOrigin + '/';
var cssMatch = src.indexOf('?') !== -1 ? src.substring(src.indexOf('?') + 1).match(/(?:^|&)css=([^&]+)/) : null;
var styleUrl = siteOrigin + (cssMatch ? decodeURIComponent(cssMatch[1]) : '/static/css/bookmarklet.css');
const minWidth = 250;
const minHeight = 250;

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
    // Find images in the DOM with the minimum dimensions and supported extensions
    let images = document.querySelectorAll('img');
    const extRe = /\.(?:jpe?g|png|gif|webp)(?:[#?].*)?$/i;
    images.forEach(image => {
        const url = (image.currentSrc || image.src || '').trim();
        if (!url || url.startsWith('data:')) { return; }
        if (!extRe.test(url)) { return; }
        if (image.naturalWidth >= minWidth && image.naturalHeight >= minHeight) {
            var imageFound = document.createElement('img');
            imageFound.src = url;
            imagesFound.append(imageFound);
        }
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

