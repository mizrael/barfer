barfer.areas.barf = function () {
    var _init = function (index, container) {
        var $container = $(container),
            $topUsersArchive = $container.find('.jsTopUsers'),
            topUsers = new barfer.controllers.topUsers($topUsersArchive, {});
        topUsers.read();
    };
    $('.jsBarfDetails').each(_init);
};