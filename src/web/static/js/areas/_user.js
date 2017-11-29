barfer.areas.user = function () {
    var _init = function (index, container) {
        var $container = $(container);
        barfer.controllers.follow.bind($container);
    };
    $('.jsUserDetails').each(_init);
};