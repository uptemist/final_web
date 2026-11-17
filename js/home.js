$(function () {
    'use strict';

    var NAME_KEY = 'visitor-name';
    var $form = $('#greetForm');
    var $input = $('#nameInput');
    var $preview = $('#greetPreview');
    var $message = $('#greetMessage');

    function updatePreview() {
        var name = WildlifeSite.cleanValue($input);
        $preview.text('Preview: Hello, ' + (name || 'explorer') + '!');
    }

    function showMessage(text, stateClass) {
        $message
            .text(text)
            .removeClass('is-success is-error')
            .addClass(stateClass);
    }

    // input event: live preview while the user types
    $input.on('input', function () {
        updatePreview();
        if (WildlifeSite.cleanValue($input) !== '') {
            $input.removeClass('is-invalid').attr('aria-invalid', 'false');
        }
    });

    // submit event: validate and greet (Enter key works too)
    $form.on('submit', function (event) {
        event.preventDefault();
        var name = WildlifeSite.cleanValue($input);

        if (name === '') {
            showMessage('Please enter your name first.', 'is-error');
            $input.addClass('is-invalid').attr('aria-invalid', 'true').trigger('focus');
            return;
        }

        $input.val(name);
        showMessage('Welcome to the Wildlife Encyclopedia, ' + name + '! We are glad to see you.', 'is-success');
        WildlifeSite.writeStorage(NAME_KEY, name);
        updatePreview();
    });

    // click event: reset everything to the initial state
    $('#greetClear').on('click', function () {
        $input.val('').removeClass('is-invalid').attr('aria-invalid', 'false');
        $message.text('').removeClass('is-success is-error');
        WildlifeSite.removeStorage(NAME_KEY);
        updatePreview();
        $input.trigger('focus');
    });

    // Returning visitor: restore the saved name
    var savedName = WildlifeSite.readStorage(NAME_KEY);
    if (savedName) {
        $input.val(savedName);
        showMessage('Welcome back, ' + savedName + '!', 'is-success');
    }
    updatePreview();
});
