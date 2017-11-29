barfer.widgets = barfer.widgets || {};

(function () {
    var baseUrl = "/widgets/users?type=",
        read = function ($container, type) {
            var url = baseUrl + type;

            $container.empty();
            $.get(url).then(function (data) {
                $container.html(data);

                var opts = Object.assign({}, barfer.utils.tooltipOptions);
                opts.functionReady = function (instance, helper) {
                    barfer.controllers.follow.bind($(helper.tooltip));
                }
                $container.find('.jsTooltip').tooltipster(opts);
            });
        };

    $('[widget-users]').each(function (index, item) {
        var $container = $(item),
            type = $container.attr("widget-users");
        read($container, type);
    });
})();

(function tagcloud_widget() {
    var url = "/widgets/tagcloud",
        read = function ($container) {
            $container.empty();
            $.get(url).then(function (data) {
                $container.html(data);
            });
        };

    $('[widget-tag-cloud]').each(function (index, item) {
        read($(item));
    });
})();