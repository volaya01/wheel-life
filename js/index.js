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
    base64 = base64.replace("data:image/png;base64,", "");
    var url= "https://api.imgur.com/3/image";
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Client-ID ad2218cdbb087d7");
    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        const jsonRes = JSON.parse(this.response);
        var imageURL = jsonRes['data']['link'];
        if(red == "whatsapp")
            window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(imageURL),'sharer','toolbar=0,status=0,width=626,height=436');
        else
             window.open('https://www.facebook.com/sharer.php?u='+encodeURIComponent(imageURL)+'&t='+encodeURIComponent("Wheel Life"),'sharer','toolbar=0,status=0,width=626,height=436');
        }
    };

    xhr.send(base64);
}

iListeners();