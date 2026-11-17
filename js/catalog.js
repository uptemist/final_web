$(function () {
    'use strict';

    var $grid = $('#catalogGrid');
    var $cards = $grid.find('.card');

    var $search = $('#searchInput');
    var $filterButtons = $('.filter-btn');
    var $resultsCount = $('#resultsCount');
    var $noResults = $('#noResults');
    var activeCategory = 'all';

    function normalise(text) {
        return String(text).replace(/\s+/g, ' ').trim().toLowerCase();
    }

    // Text that the search looks at: title, description, category, details
    function searchableText($card) {
        return normalise($card.find('h3, .card-body > p, .category, .card-details, .card-more').text());
    }

    function applyFilters() {
        var query = normalise($search.val());
        var visible = 0;

        $cards.each(function () {
            var $card = $(this);
            var categoryOk = activeCategory === 'all' || $card.data('category') === activeCategory;
            var textOk = query === '' || searchableText($card).indexOf(query) !== -1;
            var show = categoryOk && textOk;

            $card.toggle(show);
            if (show) {
                visible += 1;
            }
        });

        var label = $filterButtons.filter('[data-category="' + activeCategory + '"]').text().toLowerCase();
        var summary = 'Showing ' + visible + ' of ' + $cards.length + ' programs';
        if (activeCategory !== 'all') {
            summary += ' in ' + label;
        }
        if (query !== '') {
            summary += ' matching "' + query + '"';
        }
        $resultsCount.text(summary);
        $noResults.prop('hidden', visible !== 0);
    }

    $search.on('input', applyFilters);

    $filterButtons.on('click', function () {
        activeCategory = $(this).data('category');
        $filterButtons.attr('aria-pressed', 'false');
        $(this).attr('aria-pressed', 'true');
        applyFilters();
    });

    $('#clearFilters').on('click', function () {
        $search.val('');
        activeCategory = 'all';
        $filterButtons.attr('aria-pressed', 'false')
            .filter('[data-category="all"]').attr('aria-pressed', 'true');
        applyFilters();
        $search.trigger('focus');
    });

    // .stop(true) clears any queued animation so fast double-clicks don't stack
    $grid.on('click', '.details-btn', function () {
        var $button = $(this);
        var $panel = $('#' + $button.attr('aria-controls'));
        var willOpen = $button.attr('aria-expanded') !== 'true';

        $button.attr('aria-expanded', String(willOpen)).text(willOpen ? 'HIDE DETAILS' : 'DETAILS');
        if (willOpen) {
            $panel.stop(true).slideDown(220);
        } else {
            $panel.stop(true).slideUp(220);
        }
    });

    var STORAGE_KEY = 'wildlife-shortlist';
    var $list = $('#shortlist');
    var $count = $('#shortlistCount');
    var $empty = $('#shortlistEmpty');
    var $clearAll = $('#clearShortlist');
    var $status = $('#shortlistStatus');
    var $activityInput = $('#activityInput');
    var $activityError = $('#activityError');

    // Fading status message (second animated effect)
    function showStatus(text) {
        $status.stop(true, true).text(text).fadeIn(200).delay(2200).fadeOut(400);
    }

    function getItems() {
        return $list.children('li').map(function () {
            return { id: $(this).data('id'), title: $(this).data('title') };
        }).get();
    }

    function saveItems() {
        WildlifeSite.writeStorage(STORAGE_KEY, JSON.stringify(getItems()));
    }

    function hasTitle(title) {
        var wanted = normalise(title);
        return $list.children('li').filter(function () {
            return normalise($(this).data('title')) === wanted;
        }).length > 0;
    }

    function updateShortlistState() {
        var total = $list.children('li').length;
        $count.text(total + (total === 1 ? ' item planned' : ' items planned'));
        $empty.toggle(total === 0);
        $clearAll.toggle(total > 0);
    }

    function setSaveButton(programId, isSaved) {
        $cards.filter('[data-id="' + programId + '"]').find('.save-btn')
            .attr('aria-pressed', String(isSaved))
            .text(isSaved ? 'SAVED' : 'SAVE');
    }

    // User text is inserted with .text(), never as HTML
    function addItem(id, title) {
        var $item = $('<li>').attr('data-id', id).data('id', id).data('title', title);
        $('<span>').text(title).appendTo($item);
        $('<button>', { type: 'button', 'class': 'remove-btn' })
            .attr('aria-label', 'Remove ' + title + ' from shortlist')
            .text('REMOVE')
            .appendTo($item);
        $list.append($item);
    }

    function removeItem($item) {
        var id = String($item.data('id'));
        var title = $item.data('title');
        $item.remove();
        setSaveButton(id, false);
        updateShortlistState();
        saveItems();
        showStatus('"' + title + '" removed from your shortlist.');
    }

    // Delegated handler on the grid: works for every card's SAVE button
    $grid.on('click', '.save-btn', function () {
        var $card = $(this).closest('.card');
        var id = String($card.data('id'));
        var title = $card.data('title');
        var $existing = $list.children('li').filter('[data-id="' + id + '"]');

        if ($existing.length) {
            removeItem($existing);
            return;
        }
        addItem(id, title);
        setSaveButton(id, true);
        updateShortlistState();
        saveItems();
        showStatus('"' + title + '" added to your shortlist.');
    });

    // Delegated handler on the list: also works for items added later
    $list.on('click', '.remove-btn', function () {
        var $item = $(this).closest('li');
        var $next = $item.next().length ? $item.next() : $item.prev();
        removeItem($item);
        if ($next.length) {
            $next.find('.remove-btn').trigger('focus');
        } else {
            $activityInput.trigger('focus');
        }
    });

    $('#activityForm').on('submit', function (event) {
        event.preventDefault();
        var title = WildlifeSite.cleanValue($activityInput);

        if (title === '') {
            $activityError.text('Please type an activity before adding it.');
            $activityInput.addClass('is-invalid').attr('aria-invalid', 'true').trigger('focus');
            return;
        }
        if (hasTitle(title)) {
            $activityError.text('This activity is already in your shortlist.');
            $activityInput.addClass('is-invalid').attr('aria-invalid', 'true').trigger('focus');
            return;
        }

        $activityError.text('');
        $activityInput.removeClass('is-invalid').attr('aria-invalid', 'false').val('');
        addItem('custom-' + Date.now(), title);
        updateShortlistState();
        saveItems();
        showStatus('"' + title + '" added to your shortlist.');
    });

    $activityInput.on('input', function () {
        if (WildlifeSite.cleanValue($activityInput) !== '') {
            $activityError.text('');
            $activityInput.removeClass('is-invalid').attr('aria-invalid', 'false');
        }
    });

    $clearAll.on('click', function () {
        $list.children('li').each(function () {
            setSaveButton(String($(this).data('id')), false);
        });
        $list.empty();
        updateShortlistState();
        saveItems();
        showStatus('Shortlist cleared.');
        $activityInput.trigger('focus');
    });

    // Restore the shortlist saved in this browser
    (function restoreShortlist() {
        var saved = [];
        try {
            saved = JSON.parse(WildlifeSite.readStorage(STORAGE_KEY) || '[]');
        } catch (e) {
            saved = [];
        }
        $.each(Array.isArray(saved) ? saved : [], function (i, item) {
            if (item && item.id && item.title) {
                addItem(String(item.id), String(item.title));
                setSaveButton(String(item.id), true);
            }
        });
        updateShortlistState();
    })();

    var PARKS = {
        'altyn-emel': { label: 'Altyn-Emel National Park', lat: 44.1667, lon: 78.6167 },
        'burabay': { label: 'Burabay National Park', lat: 53.0833, lon: 70.3167 },
        'ile-alatau': { label: 'Ile-Alatau National Park', lat: 43.2775, lon: 77.0858 },
        'charyn': { label: 'Charyn Canyon National Park', lat: 43.35, lon: 79.0667 }
    };

    var WEATHER_CODES = {
        0: 'clear sky', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast',
        45: 'fog', 48: 'freezing fog',
        51: 'light drizzle', 53: 'drizzle', 55: 'dense drizzle',
        61: 'light rain', 63: 'rain', 65: 'heavy rain',
        71: 'light snow', 73: 'snow', 75: 'heavy snow',
        80: 'rain showers', 81: 'rain showers', 82: 'violent showers',
        95: 'thunderstorm'
    };

    var $weatherForm = $('#weatherForm');
    var $weatherResult = $('#weatherResult');

    function describeWeather(code) {
        return WEATHER_CODES[code] || 'changing conditions';
    }

    function showWeatherText(text, isError) {
        $weatherResult.stop(true, true).fadeOut(100, function () {
            $weatherResult.toggleClass('is-error', Boolean(isError)).text(text).fadeIn(200);
        });
    }

    $weatherForm.on('submit', async function (event) {
        event.preventDefault();
        var park = PARKS[$('#weatherPark').val()];
        if (!park) {
            return;
        }

        showWeatherText('Checking the sky over ' + park.label + '...', false);

        var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + park.lat +
            '&longitude=' + park.lon + '&current_weather=true';

        try {
            var response = await fetch(url);
            if (!response.ok) {
                throw new Error('weather service responded with an error');
            }
            var data = await response.json();
            var current = data && data.current_weather;
            if (!current) {
                throw new Error('weather data missing from response');
            }
            showWeatherText(
                park.label + ': ' + Math.round(current.temperature) + '°C, ' +
                describeWeather(current.weathercode) + ', wind ' + Math.round(current.windspeed) + ' km/h.',
                false
            );
        } catch (err) {
            showWeatherText('Could not reach the weather service right now. Please try again later.', true);
        }
    });

    var $reg = $('#registrationForm');
    var $regResult = $('#registrationResult');

    var regRules = {
        'reg-firstname': function (v) { return v.length >= 2 ? '' : 'First name must be at least 2 characters.'; },
        'reg-lastname': function (v) { return v.length >= 2 ? '' : 'Last name must be at least 2 characters.'; },
        'reg-email': function (v) {
            if (v === '') { return 'Email is required.'; }
            return WildlifeSite.isValidEmail(v) ? '' : 'Enter an email like name@example.com.';
        },
        'reg-pass': function () {
            return WildlifeSite.isStrongPassword($('#reg-pass').val())
                ? ''
                : 'At least 8 characters, with a letter and a number.';
        },
        'reg-confirm': function () {
            var confirm = $('#reg-confirm').val();
            if (confirm === '') { return 'Please repeat the password.'; }
            return confirm === $('#reg-pass').val() ? '' : 'Passwords do not match.';
        },
        'reg-country': function (v) { return v !== '' ? '' : 'Please select a country.'; }
    };

    function validateRegField(id) {
        var $field = $('#' + id);
        return WildlifeSite.setFieldError($field, regRules[id](WildlifeSite.cleanValue($field)));
    }

    $reg.on('input change', 'input, select', function () {
        if (!$reg.data('submitted')) { return; }
        if (regRules[this.id]) { validateRegField(this.id); }
        if (this.id === 'reg-pass') { validateRegField('reg-confirm'); }
    });

    $reg.on('submit', function (event) {
        event.preventDefault();
        $reg.data('submitted', true);

        var firstInvalid = null;
        $.each(regRules, function (id) {
            if (!validateRegField(id) && !firstInvalid) {
                firstInvalid = id;
            }
        });

        if (firstInvalid) {
            $regResult.empty().removeClass('is-success');
            $('#' + firstInvalid).trigger('focus');
            return;
        }

        var firstName = WildlifeSite.cleanValue($('#reg-firstname'));
        this.reset();
        WildlifeSite.showResult($regResult, [
            'Demo registration checked: welcome, ' + firstName + '!',
            'All fields are valid. No account was created and nothing was sent, because this website has no backend.'
        ]);
    });

    $reg.on('reset', function () {
        $reg.data('submitted', false);
        WildlifeSite.clearFieldErrors($reg);
        $regResult.empty().removeClass('is-success');
    });
});
