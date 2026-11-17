$(function () {
    'use strict';

    // Buttons, not links, so Enter/Space work without extra ARIA plumbing
    $('#faqList').on('click', '.faq-question', function () {
        var $button = $(this);
        var $answer = $('#' + $button.attr('aria-controls'));
        var willOpen = $button.attr('aria-expanded') !== 'true';

        $button.attr('aria-expanded', String(willOpen));
        $button.find('.faq-icon').text(willOpen ? '-' : '+');

        if (willOpen) {
            $answer.stop(true).slideDown(250);
        } else {
            $answer.stop(true).slideUp(250);
        }
    });

    var $form = $('#contactForm');
    var $result = $('#contactResult');
    var $message = $('#message');
    var $counter = $('#message-count');
    var MAX_LENGTH = 500;
    var MIN_LENGTH = 10;

    var rules = {
        name: function (v) {
            if (v === '') { return 'Please enter your name.'; }
            return v.length >= 2 ? '' : 'Name must be at least 2 characters.';
        },
        email: function (v) {
            if (v === '') { return 'Please enter your email.'; }
            return WildlifeSite.isValidEmail(v) ? '' : 'Enter an email like name@example.com.';
        },
        topic: function (v) {
            return v !== '' ? '' : 'Please choose a program or topic.';
        },
        message: function (v) {
            if (v === '') { return 'Please write a message.'; }
            if (v.length < MIN_LENGTH) { return 'Message must be at least ' + MIN_LENGTH + ' characters (now ' + v.length + ').'; }
            return v.length <= MAX_LENGTH ? '' : 'Message must be ' + MAX_LENGTH + ' characters or fewer.';
        }
    };

    function validateField(id) {
        var $field = $('#' + id);
        return WildlifeSite.setFieldError($field, rules[id](WildlifeSite.cleanValue($field)));
    }

    function updateCounter() {
        var length = WildlifeSite.cleanValue($message).length;
        $counter.text(length + ' / ' + MAX_LENGTH + ' characters (minimum ' + MIN_LENGTH + ')');
    }

    // Pre-select the program when coming from the catalog (contact.html?program=safari)
    var params = new URLSearchParams(window.location.search);
    var requested = params.get('program');
    if (requested && $('#topic option[value="' + requested.replace(/[^a-z-]/gi, '') + '"]').length) {
        $('#topic').val(requested);
    }

    $message.on('input', updateCounter);

    // After the first submit, errors update while the user fixes them
    $form.on('input change', 'input, select, textarea', function () {
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

        var name = WildlifeSite.cleanValue($('#name'));
        var topic = $('#topic option:selected').text();

        // Reset the fields after a valid demo submission
        this.reset();
        $form.data('submitted', false);
        WildlifeSite.clearFieldErrors($form);
        updateCounter();

        WildlifeSite.showResult($result, [
            'Thank you, ' + name + '! Your enquiry about "' + topic + '" passed all checks.',
            'Demonstration only: no message was sent, because this website has no backend.'
        ]);
    });

    updateCounter();
});
