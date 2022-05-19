var areas = [];
    
areas.push(['Area 1', 'B1B8C9', 11, 11]);
areas.push(['Area 2', 'B1B8C9', 11, 11]);
areas.push(['Area 3', 'B1B8C9', 11, 11]);
areas.push(['Area 4', 'B1B8C9', 11, 11]);
areas.push(['Area 5', 'B1B8C9', 11, 11]);
areas.push(['Area 6', 'B1B8C9', 11, 11]);
areas.push(['Area 7', 'B1B8C9', 11, 11]);
areas.push(['Area 8', 'B1B8C9', 11, 11]);
areas.push(['Area 9', 'B1B8C9', 11, 11]);
areas.push(['Area 10', 'B1B8C9', 11, 11]);
areas.push(['Area 11', 'B1B8C9', 11, 11]);
areas.push(['Area 12', 'B1B8C9', 11, 11]);

// Чтобы при обновлении не показывалось сообщение
var alreadyFilledMessage = '';
setTimeout(function () {
    alreadyFilledMessage = 'Анализ уже готов.';
}, 5000);


var onFillTriggered = false;
function onFillCircle(areas) {
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

    $('#wheel-plan li:not(.stick)').remove();

    $('.tool-is').show();

    console.log(areas);
}

function itemHasClicked(item){
    console.log(item);
}

var settings = { areas: areas, display: 'star', beginGradShift: 90, onFill: onFillCircle};