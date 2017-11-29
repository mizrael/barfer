barfer.widgets = barfer.widgets || {};

(function () {
    var baseUrl = "/widgets/users?type=",
        read = function ($container) {
            var url = baseUrl + $container.attr("widget-users");

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
        read($(item));
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