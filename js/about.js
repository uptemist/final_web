$(function () {
    'use strict';

    var facts = [
        'An octopus has three hearts: two pump blood through the gills and one through the rest of the body.',
        'Snow leopards cannot roar. They communicate with chuffs, growls and long yowls instead.',
        'The saiga antelope of the Kazakh steppe has a large, flexible nose that filters dust in summer and warms cold air in winter.',
        'A group of flamingos is called a flamboyance.',
        'Sea otters often hold paws while they sleep so they do not drift apart.',
        'Asian elephants can recognise themselves in a mirror, a sign of self-awareness shared by very few animals.'
    ];

    var index = 0;
    var $fact = $('#factText');
    var $counter = $('#factCounter');

    $('#nextFact').on('click', function () {
        if ($fact.is(':animated')) {
            return;
        }

        index = (index + 1) % facts.length;
        $counter.text('Fact ' + (index + 1) + ' of ' + facts.length);

        $fact.fadeOut(200, function () {
            $fact.text(facts[index]).fadeIn(250);
        });
    });
});
