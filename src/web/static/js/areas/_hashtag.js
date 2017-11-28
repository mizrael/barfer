barfer.areas.hashtag = function () {
    var _init = function (index, container) {
        var $container = $(container),
            $topUsersArchive = $container.find('.jsTopUsers'),
            topUsers = new barfer.widgets.users($topUsersArchive, {
                type: 'top'
            });

        topUsers.read();
    };
    $('.jsHashtag').each(_init);
};