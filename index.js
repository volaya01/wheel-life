var areas = [];
    
areas.push(['Area 1', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 1"]);
areas.push(['Area 2', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 2"]);
areas.push(['Area 3', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 3"]);
areas.push(['Area 4', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 4"]);
areas.push(['Area 5', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 5"]);
areas.push(['Area 6', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 6"]);
areas.push(['Area 7', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 7"]);
areas.push(['Area 8', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 8"]);
areas.push(['Area 9', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 9"]);
areas.push(['Area 10', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 10"]);
areas.push(['Area 11', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 11"]);
areas.push(['Area 12', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 12"]);

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
            alreadyFilledMessage = ''; // Чтобы не видеть больше
        }
        
        return false;
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
    $("#snackbar").text(item[item.length - 1]);
    $("#snackbar").addClass("show");

    setTimeout(function(){ 
        $("#snackbar").removeClass("show");
    }, 3000);
}

function iListeners(){
    $("#whatsapp").on("click", function(e){
        var imageURL = wheelLife.canvas.toDataURL();
        window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(imageURL));
    });

    $("#facebook").on("click", function(e){
        var imageURL = wheelLife.canvas.toDataURL();
        sendImageToIMGUR(imageURL);
        //window.open('https://www.facebook.com/sharer.php?u='+encodeURIComponent(imageURL)+'&t='+encodeURIComponent("Title"),'sharer','toolbar=0,status=0,width=626,height=436');
    });
}

function sendImageToIMGUR(base64){
    $.ajax({
        type: "POST",
        url: "https://thingproxy.freeboard.io/fetch/https://api.imgur.com/3/image",
        data: {
            image: base64.replace("data:image/png;base64,", "")
        },
        headers: new Headers({
            'Content-Type': 'text/plain',
            'Authorization': 'Client-ID f0e05600765dc59'
        }),      
        success: function(data){
            console.log(data);
        },
    });

}

var settings = { areas: areas, display: 'star', beginGradShift: 90, onFill: onFillCircle};
iListeners();