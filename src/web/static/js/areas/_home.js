barfer.areas.home = function () {
    var _init = function (index, container) {
        var $container = $(container),
            socket = io.connect('http://localhost:3100'),
            archive = new barfer.controllers.barfsArchive($container.find('.jsBarfs')),
            createBarf = new barfer.controllers.createBarf($container.find('.jsBarfer'));

        archive.read();
        socket.on('barf.ready', function (data) {
            archive.read();
        });
    };
    $('.jsHome').each(_init);
};