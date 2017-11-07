barfer.areas.home = function () {
    var _init = function (index, container) {
        var $container = $(container),
            archive = new barfer.controllers.barfsArchive($container.find('.jsBarfs')),
            refreshArchive = function () {
                if (barfer.context.user) {
                    archive.read();
                }
            },
            $topUsersArchive = $container.find('.jsTopUsers'),
            follow = new barfer.controllers.follow(),
            topUsersOptions = {
                onSuccess: function () {
                    follow.bind($topUsersArchive, function () {
                        setTimeout(refreshArchive, 1000);
                    });
                }
            },
            topUsers = new barfer.controllers.topUsers($topUsersArchive, topUsersOptions),

            createBarf = new barfer.controllers.createBarf($container.find('.jsBarfer'));

        refreshArchive();

        topUsers.read();

        barfer.context.socket.on('barf.ready', function (data) {
            archive.read();
        });
    };
    $('.jsHome').each(_init);
};