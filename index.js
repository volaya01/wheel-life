var onFillTriggered = false;
var areas = [];
    
areas.push(['Spirituality', 'B1B8C9', 11, 11, "Do you feel connected to a power greater than yourself?"]);
areas.push(['Healing', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 2"]);
areas.push(['Lifestyle', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 3"]);
areas.push(['Relationships', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 4"]);
areas.push(['Mental health', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 5"]);
areas.push(['Growth', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 6"]);
areas.push(['Career', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 7"]);
areas.push(['Intuition', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 8"]);
areas.push(['Gratitude', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 9"]);
areas.push(['Movement', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 10"]);
areas.push(['Creativity', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 11"]);
areas.push(['Abundance', 'B1B8C9', 11, 11, "Esto es una prueba del texto del area 12"]);

function itemHasClicked(item){
    $("#snackbar").html(item[0] + "<br>" + item[item.length - 1]);
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
            'Authorization': 'Client-ID ad2218cdbb087d7'
        }),      
        success: function(data){
            console.log(data);
        },
    });

}

var settings = { areas: areas, beginGradShift: 90};
iListeners();