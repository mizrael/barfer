barfer.areas.user = function () {
    var _init = function (index, container) {
        var $container = $(container),
            $topUsersArchive = $container.find('.jsTopUsers'),
            topUsers = new barfer.widgets.users($topUsersArchive, {
                type: 'top'
            });

        topUsers.read();
        follow.bind($container);
    };
    $('.jsUserDetails').each(_init);
};