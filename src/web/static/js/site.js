barfer.init = function (options) {
    console.log("starting barfer web client...");

    barfer.context = {
        socket: io.connect('http://localhost:3100'),
        user: options.user
    };

    if (barfer.user && barfer.user != '') {
        barfer.context.socket.emit('auth', {
            user: barfer.user
        });
    }

    if (barfer.areas[options.area]) {
        barfer.areas[options.area]();
    }
}