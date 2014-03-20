//http://stackoverflow.com/questions/20318822/how-to-create-a-stopwatch-using-javascript
(function ($) {

    var Stopwatch = function (elem, options) {

        var timer = createTimer(),
            startButton = createButton("start", start, "glyphicon-play"),
            stopButton = createButton("pause", stop, "glyphicon-pause"),
            resetButton = createButton("reset", reset, "glyphicon-refresh"),
            offset,
            clock,
            interval;

        // default options
        options = options || {};
        options.delay = options.delay || 1;

        // append elements 
        var elRow = document.createElement("div");
        elem.appendChild(elRow);
        var elCol1 = document.createElement("div");
        elRow.appendChild(elCol1);
        elCol1.className = "col-xs-7 col-sm-7 col-md-7 col-lg-7";
        elCol1.appendChild(startButton);
        elCol1.appendChild(stopButton);
        elCol1.appendChild(resetButton);
        var elCol2 = document.createElement("div");
        elRow.appendChild(elCol2);
        elCol2.className = "col-xs-5 col-sm-5 col-md-5 col-lg-5";
        elCol2.appendChild(timer);

        // initialize
        reset();

        // private functions
        function createTimer() {
            return document.createElement("h1");
        }
        
        function createButton(action, handler, icon) {
            var a = document.createElement("a");
            a.className = "btn btn-success";
            a.href = "#" + action;
            a.innerHTML = "<span class='glyphicon glyph-big "+icon+"'></span><br>" + action;
            a.addEventListener("click", function (event) {
                handler();
                event.preventDefault();
            });
            return a;
        }

        function start() {
            offset = Date.now();
            interval = setInterval(update, options.delay);
        }

        function stop() {
            if (interval) {
                clearInterval(interval);
            }
        }

        function reset() {
            clock = 0;
            render();
        }

        function update() {
            clock += delta();
            render();
        }

        function render() {
            var m = moment(clock);
            timer.innerHTML = m.format("HH:mm:ss");
        }

        function delta() {
            var now = Date.now(),
                d = now - offset;

            offset = now;
            return d;
        }

        // public API
        this.start = start;
        this.stop = stop;
        this.reset = reset;
    };

    $.fn.stopwatch = function (options) {
        return this.each(function (idx, elem) {
            new Stopwatch(elem, options);
        });
    };
})(jQuery);