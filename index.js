var areas = [];
    
areas.push(['Salud', 'B1B8C9', 11, 11]);
areas.push(['Dinero', 'B1B8C9', 11, 11]);
areas.push(['Comunicación', 'B1B8C9', 11, 11]);
areas.push(['Trabajo', 'B1B8C9', 11, 11]);
areas.push(['Autoconocimiento', 'B1B8C9', 11, 11]);
areas.push(['Salud', 'B1B8C9', 11, 11]);
areas.push(['Dinero', 'B1B8C9', 11, 11]);
areas.push(['Comunicación', 'B1B8C9', 11, 11]);
areas.push(['Trabajo', 'B1B8C9', 11, 11]);
areas.push(['Autoconocimiento', 'B1B8C9', 11, 11]);
areas.push(['Trabajo', 'B1B8C9', 11, 11]);
areas.push(['Autoconocimiento', 'B1B8C9', 11, 11]);

// Чтобы при обновлении не показывалось сообщение
var alreadyFilledMessage = '';
setTimeout(function () {
    alreadyFilledMessage = 'Анализ уже готов.';
}, 5000);


var onFillTriggered = false;

function onFillCircle(areas)
{
    // Запретим перестраивать колесо жизни
    if (onFillTriggered) {
        if (alreadyFilledMessage) {
            sticker({ note: alreadyFilledMessage});
            alreadyFilledMessage = ''; // Чтобы не видеть больше
        }
        if (!LOCAL) return false;
    }

    var options = [], values = [];

    for (var i = 0; i < areas.length; i++) {
        options.push(i + 1);
        values.push(areas[i][2]);
    }

    $.post('/lifemap_callback/update_options', { area: 'areas', options: options, values: values, type: 'lifemapWheel'}, function(response) {

        if (response != 'OK') {
            sticker({ note: response});

            return false;
        }
    });

    if (!onFillTriggered) {
        localEvent('user', 'lifemap-wheel-filled', '', '0', 1);
    }
    onFillTriggered = true;

    var wheel = [
        values[3] + 'a-job',
        values[0] + 'a-health',
        values[1] + 'b-money',
        values[2] + 'c-communication',
        values[4] + 'd-self_knowledge'
    ];

    wheel = [ values[1] + 'a-money', values[2] + 'b-communication', values[3] + 'a-job', values[4] + 'b-self_knowledge'];


    // wheel = wheel.sort();
    if (parseInt(wheel[1].substr(0, 1)) > parseInt(wheel[0].substr(0, 1))) {
        var temp = wheel[1];
        wheel[1] = wheel[0];
        wheel[0] = temp;
    }

    // $('#wheel-plan li').remove();
    $('#wheel-plan li:not(.stick)').remove();


    $.each(wheel, function(index){
        var sphereName = wheel[index].substr(wheel[index].indexOf('-') + 1);

        $('#wheel-plan').append('<li>'
            + (index == 0 ? 'Второй разберём сферу – ' : '')
            + (index == 1 ? 'Затем – ' : '')
            + (index == 2 ? 'Далее – ' : '')
            + (index == 3 ? 'И на последок – ' : '')

            // + (index == 0 ? 'Сначала разберём сферу – ' : '')
            // + (index == 1 ? 'Второй разберём сферу – ' : '')
            // + (index == 2 ? 'Затем – ' : '')
            // + (index == 3 ? 'Далее – ' : '')
            // + (index == 4 ? 'И на последок – ' : '')
            + $('#wheel-' + sphereName).html()
            + '</li>');
    });

    $('.tool-is').show();

    scrollToBottom($('.wheel-life-container'), 250);
}

var settings = { areas: areas, display: 'star', beginGradShift: 90, onFill: onFillCircle};