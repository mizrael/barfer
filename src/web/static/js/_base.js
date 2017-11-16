if (!('barfer' in window)) {
    barfer = {};
}

barfer.areas = barfer.areas || {};

barfer.controllers = barfer.controllers || {};

barfer.controllers.barfsArchive = function ($container, options) {
    options = options || {};

    var read = function () {
        $container.empty();
        var url = "/barfs";
        if (options.author) {
            url += "?author=" + options.author;
        }
        $.get(url).then(function (data) {
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

barfer.controllers.topUsers = function ($container, options) {
    options = options || {};
    var read = function () {
        $container.empty();
        $.get("/topusers").then(function (data) {
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
            var text = newStatus ? "Unfollow" : "Follow";

            $btn.data('followed', newStatus);
            $btn.html(newStatus ? '<i class="fa fa-heart fa-hover-hidden" aria-hidden="true"></i><i class="fa fa-heart-o fa-hover-show" aria-hidden="true"></i>' :
                '<i class="fa fa-heart fa-hover-show" aria-hidden="true"></i><i class="fa fa-heart-o fa-hover-hidden" aria-hidden="true"></i>');
            $btn.attr('alt', text);
            $btn.attr('title', text);
        },
        _refresh = function ($container) {
            $container.find('.jsFollow').each(function (i, val) {
                var $btn = $(val);
                _setState($btn, _getState($btn));
            });
        },
        _run = function ($btn, onChange) {
            var newStatus = !_getState($btn),
                url = "/users/" + $btn.data('id') + "/follow",
                payload = {
                    status: newStatus
                };
            $btn.hide();
            $.ajax({
                url: url,
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
            $text.val("");
            if (options.onSaved) {
                options.onSaved(response);
            };
        }).catch(function () {
            $text.val("");
        });
    });

    return {};
};