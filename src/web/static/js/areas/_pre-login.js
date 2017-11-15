barfer.areas.preLogin = function () {
    var _init = function (index, container) {
        var $container = $(container),
            $topUsersArchive = $container.find('.jsTopUsers'),
            follow = new barfer.controllers.follow(),
            topUsersOptions = {
                onSuccess: function () {
                    follow.bind($topUsersArchive);
                }
            },
            topUsers = new barfer.controllers.topUsers($topUsersArchive, topUsersOptions);

        topUsers.read();
    };
    $('.jsPreLogin').each(_init);
};