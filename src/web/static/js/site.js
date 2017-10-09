barfer.init = function (options) {
    console.log("starting barfer web client...");

    var context = {
        socket: io.connect('http://localhost:3100')
    };

    if (options.user && options.user != '') {
        context.socket.emit('auth', {
            user: options.user
        });
    }

    if (barfer.areas[options.area]) {
        barfer.areas[options.area](context);
    }
}