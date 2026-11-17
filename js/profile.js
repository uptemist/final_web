$(function () {
    'use strict';

    var user = WildlifeSite.currentUser();

    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    $('#profileName').text(user.name);
    $('#profileEmail').text(user.email);
    $('#profilePhone').text(user.phone || 'Not provided');

    var $savedList = $('#profileSaved');
    var $savedEmpty = $('#profileSavedEmpty');
    var saved = [];
    try {
        saved = JSON.parse(WildlifeSite.readStorage('wildlife-shortlist') || '[]');
    } catch (e) {
        saved = [];
    }

    if (Array.isArray(saved) && saved.length) {
        $.each(saved, function (i, item) {
            if (item && item.title) {
                $('<li>').text(item.title).appendTo($savedList);
            }
        });
        $savedEmpty.hide();
    } else {
        $savedEmpty.show();
    }

    $('#profileLogout').on('click', function () {
        WildlifeSite.endSession();
        window.location.href = 'index.html';
    });
});
