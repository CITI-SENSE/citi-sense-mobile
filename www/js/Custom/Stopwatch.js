Stopwatch = function (timer, options) {

    var offset,
        clock,
        interval;

    // default options
    options = options || {};
    options.delay = options.delay || 1;

    // initialize
    resetclock();

    // private functions
    function start() {
        offset = Date.now();
        interval = setInterval(update, options.delay);
    }

    function stop() {
        if (interval) {
            clearInterval(interval);
        }
    }

    function resetclock() {
        clock = 0;
        render();
    }

    function update() {
        clock += delta();
        render();
    }

    function render() {
        var m = moment(clock).utc();
        timer.html(m.format("HH:mm:ss"));
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
    this.resetclock = resetclock;
};
