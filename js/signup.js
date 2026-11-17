$(function () {
    'use strict';

    var $form = $('#signupForm');
    var $result = $('#signupResult');

    var rules = {
        'signup-name': function (v) {
            return v.length >= 2 ? '' : 'Name must be at least 2 characters.';
        },
        'signup-email': function (v) {
            if (v === '') { return 'Please enter your email.'; }
            if (!WildlifeSite.isValidEmail(v)) { return 'Enter an email like name@example.com.'; }
            var existing = WildlifeSite.findUserByEmail(v);
            return existing ? 'An account with this email already exists.' : '';
        },
        'signup-phone': function (v) {
            if (v === '') { return 'Please enter your phone number.'; }
            return WildlifeSite.isValidPhone(v) ? '' : 'Use digits only, e.g. +7 701 234 5678.';
        },
        'signup-password': function (v) {
            if (v === '') { return 'Please choose a password.'; }
            return WildlifeSite.isStrongPassword(v) ? '' : 'At least 8 characters, with a letter and a number.';
        },
        'signup-confirm': function (v) {
            if (v === '') { return 'Please repeat the password.'; }
            return v === $('#signup-password').val() ? '' : 'Passwords do not match.';
        }
    };

    function validateField(id) {
        var $field = $('#' + id);
        return WildlifeSite.setFieldError($field, rules[id](WildlifeSite.cleanValue($field)));
    }

    $form.on('input change', 'input', function () {
        if (!$form.data('submitted')) { return; }
        if (rules[this.id]) { validateField(this.id); }
        if (this.id === 'signup-password') { validateField('signup-confirm'); }
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

        var user = {
            name: WildlifeSite.cleanValue($('#signup-name')),
            email: WildlifeSite.cleanValue($('#signup-email')).toLowerCase(),
            phone: WildlifeSite.cleanValue($('#signup-phone')),
            password: $('#signup-password').val()
        };

        var users = WildlifeSite.getUsers();
        users.push(user);
        WildlifeSite.saveUsers(users);
        WildlifeSite.startSession(user.email);

        WildlifeSite.showResult($result, [
            'Account created, ' + user.name + '! Taking you to your profile...'
        ]);

        window.setTimeout(function () {
            window.location.href = 'profile.html';
        }, 900);
    });
});
