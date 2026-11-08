(function () {
    var MANIFEST = 'assets/css/images/slideshow/manifest.json';
    var FOLDER = 'assets/css/images/slideshow/';   // where the photos actually live

    var SLIDE_MS = 9500;
    var FADE_MS = 2100;
    var PAN = 2.75;
    var SCALE = 1.12;

    fetch(MANIFEST)
        .then(function (response) {
            if (!response.ok) throw new Error('Failed to load image manifest (' + response.status + ')');
            return response.json();
        })
        .then(function (files) {
            var images = files.map(function (file) { return FOLDER + encodeURI(file); });
            startSlideshow(images);
        })
        .catch(function (error) {
            console.error('Slideshow loading failed:', error);
        });

    function startSlideshow(IMAGES) {
        var intro = document.getElementById('intro');
        var box = document.querySelector('.intro-bg');
        if (!intro || !box || !IMAGES.length) return;

        var conn = navigator.connection || {};
        var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            || conn.saveData === true;

        var slides = IMAGES.map(function (src) {
            var el = document.createElement('div');
            el.className = 'intro-slide';
            el.style.backgroundImage = 'url("' + src + '")';
            el.style.transitionDuration = FADE_MS + 'ms';
            box.appendChild(el);
            return el;
        });

        function drift() {
            var x = (Math.random() < 0.5 ? -1 : 1) * (1.5 + Math.random() * (PAN - 1.5));
            var y = (Math.random() < 0.5 ? -1 : 1) * (1.5 + Math.random() * (PAN - 1.5));
            return [
                { transform: 'translate(' + x + '%, ' + y + '%) scale(' + SCALE + ')' },
                { transform: 'translate(' + -x + '%, ' + -y + '%) scale(' + SCALE + ')' }
            ];
        }

        var i = 0, timer = null, running = null;
        var tabVisible = !document.hidden, inView = true, gaveUp = false;

        function show(n) {
            slides.forEach(function (s, k) { s.classList.toggle('active', k === n); });
            if (still) return;
            var el = slides[n];
            if (el._pan) el._pan.cancel();
            el._pan = el.animate(drift(), {
                duration: SLIDE_MS + FADE_MS * 2,
                easing: 'linear',
                fill: 'forwards'
            });
        }

        function next() {
            i = (i + 1) % slides.length;
            show(i);
        }

        function update() {
            var go = tabVisible && inView && !gaveUp && !still;
            if (go === running) return;
            running = go;
            slides.forEach(function (s) {
                if (!s._pan) return;
                if (go && s._pan.playState === 'paused') s._pan.play();
                else if (!go && s._pan.playState === 'running') s._pan.pause();
            });
            clearInterval(timer);
            if (go && slides.length > 1) timer = setInterval(next, SLIDE_MS);
        }

        document.addEventListener('visibilitychange', function () {
            tabVisible = !document.hidden;
            update();
        });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                inView = entries[0].isIntersecting;
                update();
            }).observe(intro);
        }

        function sample() {
            var last = 0, frames = 0, time = 0;
            function tick(t) {
                if (last && t - last < 500) { frames++; time += t - last; }
                last = t;
                if (time < 6000) { requestAnimationFrame(tick); return; }
                if (frames / (time / 1000) < 40) { gaveUp = true; update(); }
            }
            setTimeout(function () { requestAnimationFrame(tick); }, 1500);
        }

        show(0);
        update();
        if (!still) sample();
    }
})();