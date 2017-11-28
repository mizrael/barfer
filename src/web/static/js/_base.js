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
            barfer.utils.timeAgo.refresh();
            if (options.onSuccess) {
                options.onSuccess();
            }
        });
    };

    return {
        read: read
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

barfer.controllers.headerSearch = function ($container) {
    var $button = $container.find('button'),
        $text = $container.find('input[type="search"]'),
        getText = function () {
            return $text.val().trim();
        },
        isValid = function () {
            var text = getText();
            return (text && 0 !== text.trim().length);
        };
    $text.on('keyup', function () {
        if (isValid()) {
            $button.removeAttr('disabled');
        } else {
            $button.attr('disabled', true)
        }
    });
    $button.attr('disabled', true)
        .click(function (e) {
            e.preventDefault();
            if (!isValid()) {
                return;
            }
            $button.find('i').removeClass('fa-search').addClass('fa-circle-o-notch fa-spin');

            window.location = "/hashtag/" + getText();
        });
};

barfer.controllers.follow = (function () {
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
                $('body').trigger("relationship:change");
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
})();

/****************/

barfer.utils = barfer.utils || {};

barfer.utils.timeAgo = (function (options) {

    var templates = {
        prefix: "",
        suffix: " ago",
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years"
    };
    var template = function (t, n) {
        return templates[t] && templates[t].replace(/%d/i, Math.abs(Math.round(n)));
    };

    var timer = function (time) {
        if (!time)
            return;
        time = time.replace(/\.\d+/, ""); // remove milliseconds
        time = time.replace(/-/, "/").replace(/-/, "/");
        time = time.replace(/T/, " ").replace(/Z/, " UTC");
        time = time.replace(/([\+\-]\d\d)\:?(\d\d)/, " $1$2"); // -04:00 -> -0400
        time = new Date(time * 1000 || time);

        var now = new Date();
        var seconds = ((now.getTime() - time) * .001) >> 0;
        var minutes = seconds / 60;
        var hours = minutes / 60;
        var days = hours / 24;
        var years = days / 365;

        return templates.prefix + (
            seconds < 45 && template('seconds', seconds) ||
            seconds < 90 && template('minute', 1) ||
            minutes < 45 && template('minutes', minutes) ||
            minutes < 90 && template('hour', 1) ||
            hours < 24 && template('hours', hours) ||
            hours < 42 && template('day', 1) ||
            days < 30 && template('days', days) ||
            days < 45 && template('month', 1) ||
            days < 365 && template('months', days / 30) ||
            years < 1.5 && template('year', 1) ||
            template('years', years)
        ) + templates.suffix;
    };

    var elements = [],
        intervalId;

    var refresh = function () {
        clearInterval(intervalId);
        elements = document.querySelectorAll(options.selector);
        intervalId = setInterval(execute, options.interval);
        execute();
    };

    var execute = function () {
        for (var i in elements) {
            var $this = elements[i];
            if (typeof $this === 'object') {
                var time = $this.getAttribute('datetime');
                $this.innerHTML = timer(time);
            }
        }
    };

    refresh();
    execute();
    intervalId = setInterval(execute, options.interval);

    return {
        refresh: refresh
    };
})({
    selector: ".timeago",
    interval: 59000
});

barfer.utils.tooltipOptions = {
    contentAsHTML: true,
    interactive: true
};