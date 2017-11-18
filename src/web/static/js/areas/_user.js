barfer.areas.user = function () {
    var _init = function (index, container) {
        var $container = $(container),
            $topUsersArchive = $container.find('.jsTopUsers'),
            topUsers = new barfer.controllers.topUsers($topUsersArchive, {});

        topUsers.read();
        follow.bind($container);
    };
    $('.jsUserDetails').each(_init);
};