barfer.areas.user = function () {
    var _init = function (index, container) {
        var $container = $(container),
            $topUsersArchive = $container.find('.jsTopUsers'),
            topUsers = new barfer.widgets.users($topUsersArchive, {
                type: 'top'
            });

        topUsers.read();
        follow.bind($container);
        new barfer.widgets.tagcloud($container.find('.jsTagCloud'), {}).read();
    };
    $('.jsUserDetails').each(_init);
};