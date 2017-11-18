barfer.init = function (options) {
    console.log("starting barfer web client...");

    var socketAddress = window.location.protocol + "//" + window.location.host;
    barfer.context = {
        socket: io(), // io.connect(socketAddress),
        user: options.user
    };

    var headerSearch = new barfer.controllers.headerSearch($('#header-search'));

    barfer.controllers.follow.bind($('body'));

    if (barfer.areas[options.area]) {
        barfer.areas[options.area]();
    }
}