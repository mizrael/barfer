barfer.areas.home = function () {
    var _init = function (index, container) {
        var $container = $(container),
            archive = new barfer.controllers.barfsArchive($container.find('.jsBarfs')),
            topUsers = new barfer.controllers.topUsers($container.find('.jsTopUsers'))
        createBarf = new barfer.controllers.createBarf($container.find('.jsBarfer'));

        if (barfer.context.user) {
            archive.read();
        }

        topUsers.read();

        barfer.context.socket.on('barf.ready', function (data) {
            archive.read();
        });
    };
    $('.jsHome').each(_init);
};