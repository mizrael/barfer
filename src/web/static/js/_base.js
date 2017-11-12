if (!('barfer' in window)) {
    barfer = {};
}

barfer.areas = barfer.areas || {};

barfer.controllers = barfer.controllers || {};

barfer.controllers.barfsArchive = function ($container) {
    var read = function () {
        $container.empty();
        $.get("/barfs").then(function (data) {
            $container.html(data);
        });
    };

    return {
        read: read
    };
};

barfer.controllers.topUsers = function ($container, options) {
    options = options || {};
    var read = function () {
        $container.empty();
        $.get("/users/top").then(function (data) {
            $container.html(data);
            if (options.onSuccess) {
                options.onSuccess();
            }
        });
    };

    return {
        read: read
    };
};

barfer.controllers.follow = function () {
    var _getState = function ($btn) {
            var state = $btn.data('followed');
            return state;
        },
        _setState = function ($btn, newStatus) {
            $btn.data('followed', newStatus);
            $btn.text(newStatus ? "Unfollow" : "Follow");
        },
        _refresh = function ($container) {
            $container.find('.jsFollow').each(function (i, val) {
                var $btn = $(val);
                _setState($btn, _getState($btn));
            });
        },
        _run = function ($btn, onChange) {
            var newStatus = !_getState($btn),
                payload = {
                    followedId: $btn.data('id'),
                    status: newStatus
                };
            $btn.hide();
            $.ajax({
                url: "/users/follow",
                type: "post",
                data: JSON.stringify(payload),
                contentType: 'application/json',
                dataType: "json"
            }).then(function (response) {
                _setState($btn, response.status);
                $btn.show();
                if (onChange) {
                    onChange();
                }
            });
        },
        _bind = function ($container, onChange) {
            $container.on('click', '.jsFollow', function (e) {
                var $btn = $(this);
                _run($btn, onChange);
                e.preventDefault();
            });
            _refresh($container);
        };

    return {
        bind: _bind
    };
};

barfer.controllers.createBarf = function ($container, options) {
    var $form = $container.find('form'),
        $text = $form.find('textarea'),
        $submit = $form.find('button');

    options = options || {};
    $submit.prop("disabled", true);

    $text.keyup(function (e) {
        var text = $text.val().trim(),
            disableSubmit = (0 == text.length);

        $submit.prop("disabled", disableSubmit);
    });

    $submit.click(function (e) {
        e.preventDefault();

        var text = $text.val().trim(),
            payload = {
                text: text
            };

        $submit.prop("disabled", true);

        $.ajax({
            url: "/barfs",
            type: "post",
            data: JSON.stringify(payload),
            contentType: 'application/json',
            dataType: "json"
        }).then(function (response) {
            if (options.onSaved) {
                options.onSaved(response);
            };
        }).complete(function () {
            $text.val("");
        });
    });

    return {};
};