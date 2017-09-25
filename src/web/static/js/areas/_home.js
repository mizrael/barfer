barfer.areas.home = function () {
    var _init = function (index, container) {
        var $container = $(container),
            $barfsContainer = $container.find('.jsBarfs');
        $.get("/api/barfs").then(function (data) {
            $barfsContainer.html(data);
        });

    };
    $('.jsHome').each(_init);
};