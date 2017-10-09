barfer.areas.home = function (context) {
    var _init = function (index, container) {
        var $container = $(container),
            archive = new barfer.controllers.barfsArchive($container.find('.jsBarfs')),
            createBarf = new barfer.controllers.createBarf($container.find('.jsBarfer'));

        archive.read();

        context.socket.on('barf.ready', function (data) {
            archive.read();
        });
    };
    $('.jsHome').each(_init);
};