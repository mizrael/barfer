barfer.widgets = barfer.widgets || {};

barfer.widgets.users = function ($container, options) {
    options = Object.assign({
        type: 'top'
    }, options);
    var url = "/widgets/users?type=" + options.type,
        read = function () {
            $container.empty();
            $.get(url).then(function (data) {
                $container.html(data);

                var opts = Object.assign({}, barfer.utils.tooltipOptions);
                opts.functionReady = function (instance, helper) {
                    barfer.controllers.follow.bind($(helper.tooltip));
                }
                $container.find('.jsTooltip').tooltipster(opts);
                if (options.onSuccess) {
                    options.onSuccess();
                }
            });
        };

    return {
        read: read
    };
};