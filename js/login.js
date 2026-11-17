$(function () {
    'use strict';

    var $form = $('#loginForm');
    var $result = $('#loginResult');

    if (WildlifeSite.currentUser()) {
        window.location.href = 'profile.html';
        return;
    }

    var rules = {
        'login-email': function (v) {
            if (v === '') { return 'Please enter your email.'; }
            return WildlifeSite.isValidEmail(v) ? '' : 'Enter an email like name@example.com.';
        },
        'login-password': function (v) {
            return v === '' ? 'Please enter your password.' : '';
        }
    };

    function validateField(id) {
        var $field = $('#' + id);
        return WildlifeSite.setFieldError($field, rules[id](WildlifeSite.cleanValue($field)));
    }

    $form.on('input change', 'input', function () {
        if ($form.data('submitted') && rules[this.id]) {
            validateField(this.id);
        }
    });

    $form.on('submit', function (event) {
        event.preventDefault();
        $form.data('submitted', true);

        var firstInvalid = null;
        $.each(rules, function (id) {
            if (!validateField(id) && !firstInvalid) {
                firstInvalid = id;
            }
        });

        if (firstInvalid) {
            $result.empty().removeClass('is-success');
            $('#' + firstInvalid).trigger('focus');
            return;
        }

        var email = WildlifeSite.cleanValue($('#login-email'));
        var password = $('#login-password').val();
        var user = WildlifeSite.findUserByEmail(email);

        if (!user || user.password !== password) {
            $result.empty().removeClass('is-success').addClass('is-error')
                .text('Email or password is incorrect. Please try again or sign up.');
            $('#login-password').trigger('focus');
            return;
        }

        WildlifeSite.startSession(user.email);
        WildlifeSite.showResult($result, ['Welcome back, ' + user.name + '! Taking you to your profile...']);

        window.setTimeout(function () {
            window.location.href = 'profile.html';
        }, 700);
    });
});
