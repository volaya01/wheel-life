var areas = [];
    
areas.push(['Spirituality', 'B1B8C9', 11, 11, "Do you feel connected to a power greater than yourself?"]);
areas.push(['Healing', 'B1B8C9', 11, 11, "Lorem Ipsum"]);
areas.push(['Lifestyle', 'B1B8C9', 11, 11, "Lorem Ipsum"]);
areas.push(['Relationships', 'B1B8C9', 11, 11, "Lorem Ipsum"]);
areas.push(['Mental health', 'B1B8C9', 11, 11, "Lorem Ipsum"]);
areas.push(['Growth', 'B1B8C9', 11, 11, "Lorem Ipsum"]);
areas.push(['Career', 'B1B8C9', 11, 11, "Lorem Ipsum"]);
areas.push(['Intuition', 'B1B8C9', 11, 11, "Lorem Ipsum"]);
areas.push(['Gratitude', 'B1B8C9', 11, 11, "Lorem Ipsum"]);
areas.push(['Movement', 'B1B8C9', 11, 11, "Lorem Ipsum"]);
areas.push(['Creativity', 'B1B8C9', 11, 11, "Lorem Ipsum"]);
areas.push(['Abundance', 'B1B8C9', 11, 11, "Lorem Ipsum"]);

var settings = { areas: areas, beginGradShift: 90 };

function itemHasClicked(item){
    $("#snackbar").html(item[0] + "<br>" + item[item.length - 1]);
    $("#snackbar").addClass("show");

    setTimeout(function(){ 
        $("#snackbar").removeClass("show");
    }, 3000);
}

function iListeners(){
    $("#whatsapp").on("click", function(e){
        sendImageToIMGUR("whatsapp");
    });

    $("#facebook").on("click", function(e){
        sendImageToIMGUR("facebook");
    });
}

function sendImageToIMGUR(red){
    var base64 = wheelLife.canvas.toDataURL();
    base64.replace("data:image/png;base64,", "");

    $.ajax({
        type: "POST",
        url: "https://api.imgur.com/3/image",
        data: {
            image: base64
        },
        headers: new Headers({
            'Content-Type': 'text/plain',
            'Authorization': 'Client-ID ad2218cdbb087d7'
        }),      
        success: function(data){
            if(data.data.status == 200){
                var imageURL = data.data.link;

                if(red == "whatsapp")
                    window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(imageURL),'sharer','toolbar=0,status=0,width=626,height=436');
                else
                    window.open('https://www.facebook.com/sharer.php?u='+encodeURIComponent(imageURL)+'&t='+encodeURIComponent("Wheel Life"),'sharer','toolbar=0,status=0,width=626,height=436');
            }
        },
    });

}

iListeners();