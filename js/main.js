// Shared helpers loaded on every page: theme switch, storage wrappers,
// form error rendering and the account nav state.
var WildlifeSite = (function ($) {
    'use strict';

    var THEME_KEY = 'site-theme';
    var USERS_KEY = 'wildlife-users';
    var SESSION_KEY = 'wildlife-session';
    var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var PHONE_PATTERN = /^\+?[0-9][0-9\s-]{8,17}$/;

    function readStorage(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    function writeStorage(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (e) {
            return false;
        }
        return true;
    }

    function removeStorage(key) {
        try {
            window.localStorage.removeItem(key);
        } catch (e) {
            return false;
        }
        return true;
    }

    function applyTheme(isDark) {
        $('body').toggleClass('dark-theme', isDark);
        $('#themeToggle')
            .text(isDark ? 'Light mode' : 'Dark mode')
            .attr('aria-pressed', String(isDark));
    }

    function initTheme() {
        applyTheme(readStorage(THEME_KEY) === 'dark');

        $('#themeToggle').on('click', function () {
            var isDark = !$('body').hasClass('dark-theme');
            applyTheme(isDark);
            writeStorage(THEME_KEY, isDark ? 'dark' : 'light');
        });
    }

    function getUsers() {
        try {
            var list = JSON.parse(readStorage(USERS_KEY) || '[]');
            return Array.isArray(list) ? list : [];
        } catch (e) {
            return [];
        }
    }

    function saveUsers(list) {
        writeStorage(USERS_KEY, JSON.stringify(list));
    }

    function findUserByEmail(email) {
        var wanted = String(email || '').trim().toLowerCase();
        var match = null;
        $.each(getUsers(), function (i, user) {
            if (user && String(user.email).toLowerCase() === wanted) {
                match = user;
                return false;
            }
        });
        return match;
    }

    function currentUser() {
        var email = readStorage(SESSION_KEY);
        return email ? findUserByEmail(email) : null;
    }

    function startSession(email) {
        writeStorage(SESSION_KEY, String(email).trim().toLowerCase());
    }

    function endSession() {
        removeStorage(SESSION_KEY);
    }

    function initAccountNav() {
        function refresh() {
            var user = currentUser();
            $('[data-auth="guest"]').prop('hidden', Boolean(user));
            $('[data-auth="user"]').prop('hidden', !user);
            if (user) {
                $('.nav-account-name').text(user.name.split(' ')[0]);
            }
        }

        refresh();

        $('#navLogout').on('click', function () {
            endSession();
            refresh();
            if (/profile\.html$/.test(window.location.pathname)) {
                window.location.href = 'index.html';
            }
        });
    }

    function cleanValue($input) {
        return String($input.val() || '').trim();
    }

    function isValidEmail(value) {
        return EMAIL_PATTERN.test(value);
    }

    function isValidPhone(value) {
        return PHONE_PATTERN.test(value);
    }

    function isStrongPassword(value) {
        return value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
    }

    // Shows (or clears, when message is '') the error under one field.
    // The error element id is "<input id>-error".
    function setFieldError($input, message) {
        $('#' + $input.attr('id') + '-error').text(message);
        $input
            .toggleClass('is-invalid', message !== '')
            .attr('aria-invalid', message !== '' ? 'true' : 'false');
        return message === '';
    }

    function clearFieldErrors($form) {
        $form.find('.field-error').text('');
        $form.find('.is-invalid').removeClass('is-invalid');
        $form.find('[aria-invalid]').attr('aria-invalid', 'false');
    }

    // Builds a success box safely: every piece of user text goes through .text()
    function showResult($box, lines) {
        $box.empty().removeClass('is-error').addClass('is-success');
        $.each(lines, function (i, line) {
            $('<p>').text(line).appendTo($box);
        });
        $box.trigger('focus');
    }

    $(function () {
        initTheme();
        initAccountNav();
    });

    return {
        readStorage: readStorage,
        writeStorage: writeStorage,
        removeStorage: removeStorage,
        getUsers: getUsers,
        saveUsers: saveUsers,
        findUserByEmail: findUserByEmail,
        currentUser: currentUser,
        startSession: startSession,
        endSession: endSession,
        cleanValue: cleanValue,
        isValidEmail: isValidEmail,
        isValidPhone: isValidPhone,
        isStrongPassword: isStrongPassword,
        setFieldError: setFieldError,
        clearFieldErrors: clearFieldErrors,
        showResult: showResult
    };
})(jQuery);
