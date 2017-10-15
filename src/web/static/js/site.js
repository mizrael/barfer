barfer.init = function (options) {
    console.log("starting barfer web client...");

    barfer.context = {
        socket: io.connect('http://localhost:3100'),
        user: options.user
    };

    new barfer.controllers.follow($('.jsMain'));

    if (barfer.areas[options.area]) {
        barfer.areas[options.area]();
    }
}