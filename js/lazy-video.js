(function () {
    var videos = document.querySelectorAll(".js-lazy-video");
    if (!videos.length) {
        return;
    }

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
        return;
    }

    var attachSources = function (video) {
        if (video.dataset.ready) {
            return;
        }
        var sources = video.querySelectorAll("source[data-src]");
        for (var i = 0; i < sources.length; i++) {
            sources[i].src = sources[i].getAttribute("data-src");
        }
        video.load();
        video.dataset.ready = "1";
    };

    if (!("IntersectionObserver" in window)) {
        for (var i = 0; i < videos.length; i++) {
            attachSources(videos[i]);
            videos[i].play().catch(function () {});
        }
        return;
    }

    var observer = new IntersectionObserver(
        function (entries) {
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                var video = entry.target;
                if (entry.isIntersecting) {
                    attachSources(video);
                    video.play().catch(function () {});
                } else {
                    video.pause();
                }
            }
        },
        { rootMargin: "200px 0px", threshold: 0.15 }
    );

    for (var j = 0; j < videos.length; j++) {
        observer.observe(videos[j]);
    }
})();
