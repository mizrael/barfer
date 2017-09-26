barfer.areas.home = function () {
    var _initBarfer = function ($container) {

        },
        _init = function (index, container) {
            var $container = $(container),
                archive = new barfer.controllers.barfsArchive($container.find('.jsBarfs')),
                onBarfSaved = function (resp) {
                    archive.read();
                },
                createBarf = new barfer.controllers.createBarf($container.find('.jsBarfer'), {
                    onSaved: onBarfSaved
                });

            archive.read();
        };
    $('.jsHome').each(_init);
};