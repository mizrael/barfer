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

barfer.controllers.topUsers = function ($container) {
    var read = function () {
        $container.empty();
        $.get("/users/top").then(function (data) {
            $container.html(data);
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
        });
    });

    return {};
};