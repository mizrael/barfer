barfer.areas.home = function () {
    var _init = function (index, container) {
        var $container = $(container),
            archive = new barfer.controllers.barfsArchive($container.find('.jsBarfs')),
            refreshArchive = function () {
                if (barfer.context.user) {
                    archive.read();
                }
            },
            createBarf = new barfer.controllers.createBarf($container.find('.jsBarfer'));

        refreshArchive();

        if (barfer.context.user) {
            var key = 'barf.for.' + barfer.context.user;
            barfer.context.socket.on(key, function (data) {
                archive.read();
            });
        }

        $('body').on("relationship:change", function (event) {
            setTimeout(refreshArchive, 1000);
            console.log(event);
        });
    };
    $('.jsHome').each(_init);
};