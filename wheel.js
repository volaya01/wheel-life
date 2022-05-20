var settings = (typeof settings == 'undefined' ? [] : settings);
var areas = (typeof areas == 'undefined' ? [] : areas);
var tempImgName = (typeof tempImgName == 'undefined' ? Math.random() : tempImgName);

window.addEventListener('load', function() {

    wheelLife = getWheelLifeInstance(settings);
    wheelLife.draw('wheel-life');

    function windowOnResize()
    {
        wheelLife.resize();

        // Перерисовываем
        wheelLife.reDrawAll();
    }

    var resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(windowOnResize, 50);
    });


    $('#button-download-wheel a').click(function(){
        return wheelLife.downloadImage();
    });

    $('#button-clear-areas').click(function(){
        for (var i = 0; i < areas.length; i++) {
            areas[i][2] = 11;
            areas[i][3] = 11;
        }

        // Перерисовываем
        wheelLife.reDrawAll();

        $(this).hide();
        $('#wheel-life-result').hide();
        $('#button-download-wheel').hide();

        return false;
    });

    $('#share-switch').change(function(){

        if ($(this).attr('checked') == 'checked') {
            $(this).removeAttr('checked');
            $(this).parent().find('.text-off').show();
            $(this).parent().find('.text-on').hide();

            shareUrl = shareUrlDefault;
        } else {
            $(this).attr('checked', 'checked');
            $(this).parent().find('.text-off').hide();
            $(this).parent().find('.text-on').show();

            // Сохраняем картинку на сервер
            if (! $(this).attr('data-wheel-saved')) {
                wheelLife.saveImage();
                $(this).attr('data-wheel-saved', 'true');
            }

            shareUrl = location.protocol + '//' + location.hostname + '/tool/wheel_life?img_id=' + tempImgName;
        }
    });
});



/**
 * @param settings
 */
function getWheelLifeInstance(settings)
{
    /**
     *
     */    
    var wheelLife = {
        canvas: false,
        ctx: false,
        isDrawSimple: false,
        display: 'normal',
        areas: [],
        onFill: function(areas) {  },
        onFillTriggered: false,
        areaGradWidth: 45,
        areaLevelWidth: 0,
        currentAreaLevel: -1,  // Уровень в сфере [1-10]     -1=вне сферы    0 приравнивается 1
        widthInit: 0,
        heightInit: 0,
        lastClientWidth: 0,
        width: 0,
        height: 0,
        circleRadius: 0,
        todayStr: '',
        images: [],
        imagesToLoad: 0,
        scaleCoefX: 2,
        scaleCoefY: 2,
        isZvezdaKovaleva: false, // Рисуем звезду благополучия Ковалёва
        beginGradShift: false,
        demoInterval: null,
        demoFrameNum: 0,
        demoFramesInterval: null,
        areaNamesFormat: 'circle',
        textShadowColor: '#808285',
        isForTemplate: false,
        templateVariant: 1,

        draw: function (canvasId) {
            wheelLife.prepare(canvasId);

            if (! wheelLife.isDrawSimple) {
                $(wheelLife.canvas).bind('mousemove', wheelLife.onMouseMove);
                $(wheelLife.canvas).bind('click touchstart touchmove', wheelLife.onMouseMove);
            }
        },

        prepare: function (canvasId) {
            wheelLife.canvas = document.getElementById(canvasId);
            wheelLife.ctx = wheelLife.canvas.getContext('2d');

            wheelLife.widthInit = $(wheelLife.canvas).width();
            wheelLife.heightInit = $(wheelLife.canvas).height();

            wheelLife.resize();

            if (!wheelLife.areas.length) {
                sticker({note: 'Добавьте сферы жизни. <a href="/tool/life_areas" target="_blank" class="button tiny s3d no-margin">Добавить</a>'});
                wheelLife.areas.push(['Empty', '444', 11, 11]);
            }

            wheelLife.areaGradWidth = 360 / wheelLife.areas.length;

            // Текущая дата
            var today = new Date();
            wheelLife.todayStr = today.getDate() + '.' + (today.getMonth() + 1 < 10 ? '0' : '') + (today.getMonth() + 1) + '.' + today.getFullYear();

            // Preload all images
            wheelLife.imagesToLoad++;
            wheelLife.imagesToLoad++;
            wheelLife.preloadImage('logo', '/img/main/logo/50.png');
            wheelLife.preloadImage('pointer', '/img/pic/pointer.png');

            if (wheelLife.scaleCoefX > 2.4) {
                // Отодвигаем боковые кнопки на телефоне
                $('#button-download-wheel').css('top', '1px').css('right', '2px');
                $('#button-download-wheel a').css('padding', '5px').css('font-size', '11px');
                $('#button-clear-areas').css('top', '1px').css('left', '7px').css('font-size', '11px');
            }

            
        },

        preloadImage: function(name, url) {
            var img = new Image();
            img.src = url;
            img.onload = wheelLife.onAllImagesLoaded();
            wheelLife.images[name] = img;
        },

        reDrawAll: function() {
            // Перерисовываем

            wheelLife.drawTemplate();
            wheelLife.onMouseMove({offsetX: -1, offsetY: -1, type: 'click'}); // Simulate click
        },

        onAllImagesLoaded: function () {
            wheelLife.imagesToLoad--;

            // Прорисовываем первый раз экран
            if (wheelLife.imagesToLoad < 1) {
                wheelLife.reDrawAll();
            }
        },

         getOffsetPosition: function(evt, parent) {
            var position = {
                x: (evt.originalEvent && 'touches' in evt.originalEvent) ? evt.originalEvent.touches[0].pageX : evt.clientX,
                y: (evt.originalEvent && 'touches' in evt.originalEvent) ? evt.originalEvent.touches[0].pageY : evt.clientY
            };

            while(parent.offsetParent){
                position.x -= parent.offsetLeft - parent.scrollLeft;
                position.y -= parent.offsetTop - parent.scrollTop;

                parent = parent.offsetParent;
            }

            return position;
        },

        drawTemplate: function()
        {
            // Рисуем всё кроме самого колеса
            wheelLife.ctx.save();

            // Чистим всё
            wheelLife.setBackgroundStyle();
            if (wheelLife.isForTemplate) wheelLife.ctx.fillStyle = 'rgba(0,0,0,0)';
            wheelLife.ctx.rect(0, 0, wheelLife.width, wheelLife.height);
            wheelLife.ctx.fill();


            // Reset current transformation matrix to the identity matrix
            wheelLife.ctx.setTransform(1, 0, 0, 1, 0, 0);
            wheelLife.ctx.scale(2, 2);
            wheelLife.ctx.translate(wheelLife.width / 2, wheelLife.height / 2);

            // Draw areas names

            if (wheelLife.areaNamesFormat == 'linear')
            {
                var fontSize = 15;
                var textMargin = 11;
                if (wheelLife.scaleCoefX > 2.1) {
                    fontSize = 13;
                }
                if (wheelLife.scaleCoefX > 4) {
                    textMargin = 4;
                }
                if (wheelLife.display == 'square' && wheelLife.scaleCoefX > 2.1) {
                    fontSize = 13;
                }
                if (wheelLife.display == 'square' && wheelLife.scaleCoefX <= 2.1) {
                    fontSize = 22;
                }

                wheelLife.ctx.textBaseline = "center";
                wheelLife.ctx.shadowColor = "#000000";
                wheelLife.ctx.shadowOffsetX = 1;
                wheelLife.ctx.shadowOffsetY = 1;
                wheelLife.ctx.shadowBlur = 0;
            }

            // Сколько сфер уже задано
            var countAreaClicked = 0;


            // Обходим список всех сфер
            for (var i = 0; i < wheelLife.areas.length; i++) {

                if (wheelLife.areas[i][2] < 11) countAreaClicked++; // Значение задано

                var gradBegin = i * wheelLife.areaGradWidth + wheelLife.areaGradWidth / 2 - 180;
                if (wheelLife.isZvezdaKovaleva || wheelLife.beginGradShift == 'star') gradBegin -= wheelLife.areaGradWidth / 2 - 90;
                if (wheelLife.beginGradShift != 'star' && wheelLife.beginGradShift) gradBegin += parseInt(wheelLife.beginGradShift);

                var areaName = wheelLife.areas[i][0];

                wheelLife.ctx.fillStyle = '#' + wheelLife.areas[i][1];

                if (wheelLife.areaNamesFormat == 'linear') {
                    if (gradBegin < 90 && gradBegin > -90) {
                        wheelLife.ctx.textAlign = "left";
                    } else {
                        wheelLife.ctx.textAlign = "right";
                    }

                    var textX = Math.cos(gradBegin * Math.PI / 180) * (wheelLife.circleRadius + textMargin);
                    var textY = Math.sin(gradBegin * Math.PI / 180) * (wheelLife.circleRadius + textMargin);

                    // Если тект отображается вне видимого экрана
                    if (textY > wheelLife.height / 2 - 3) {
                        textX += (textX > 0 ? 12 : -12);
                        textY = wheelLife.height / 2 - 3;
                    }
                    if (textY < -wheelLife.height / 2 + 12) {
                        textX += (textX > 0 ? 12 : -12);
                        textY = -wheelLife.height / 2 + 12;
                    }

                    var splitIndex = wheelLife.findIndexForSplit(areaName);

                    var fontSizeCurrent = fontSize;

                    if (areaName.length > splitIndex) fontSizeCurrent -= 2; // Для длинных строк, уменьшаем шрифт

                    wheelLife.ctx.font = fontSizeCurrent + 'px Helvetica, verdana';

                    // Белая тень сверху, если попадает поверх колеса сектора
                    wheelLife.ctx.shadowColor = "#faebd7";
                    wheelLife.ctx.shadowOffsetX = -1;
                    wheelLife.ctx.shadowOffsetY = -1;
                    wheelLife.ctx.fillText(areaName.substr(0, splitIndex).trim(), textX, textY);
                    wheelLife.ctx.shadowColor = "#000000";
                    wheelLife.ctx.shadowOffsetX = 1;
                    wheelLife.ctx.shadowOffsetY = 1;
                    wheelLife.ctx.fillText(areaName.substr(0, splitIndex).trim(), textX, textY);


                    if (areaName.length > splitIndex) {
                        // Вторая строка
                        wheelLife.ctx.shadowColor = "#faebd7";
                        wheelLife.ctx.shadowOffsetX = -1;
                        wheelLife.ctx.shadowOffsetY = -1;
                        wheelLife.ctx.fillText(areaName.substr(splitIndex, 50).trim(), textX, textY + fontSize + 2);
                        wheelLife.ctx.shadowColor = "#000000";
                        wheelLife.ctx.shadowOffsetX = 1;
                        wheelLife.ctx.shadowOffsetY = 1;
                        wheelLife.ctx.fillText(areaName.substr(splitIndex, 50).trim(), textX, textY + fontSize + 2);
                    }
                }

                if (wheelLife.areaNamesFormat == 'circle') {

                    var arcPath = [];

                    // Длина дуги на которой будет расположен текст
                    var arcLength = Math.PI * (wheelLife.circleRadius + 13) * wheelLife.areaGradWidth / 180;
                    var gradBeginPath = i * wheelLife.areaGradWidth - 180;
                    if (wheelLife.isZvezdaKovaleva || wheelLife.beginGradShift == 'star') gradBeginPath -= wheelLife.areaGradWidth / 2 - 90; //  || wheelLife.areas.length == 4
                    if (wheelLife.beginGradShift != 'star' && wheelLife.beginGradShift) gradBeginPath += parseInt(wheelLife.beginGradShift);

                    for (var j = gradBeginPath; j <= gradBeginPath + wheelLife.areaGradWidth; j++) {
                        // break;
                        if (j < -480) break;
                        if (j > 480) break;
                        var aX = Math.round(Math.cos(j * Math.PI / 180) * (wheelLife.circleRadius + 13) * 10) / 10;
                        var aY = Math.round(Math.sin(j * Math.PI / 180) * (wheelLife.circleRadius + 13) * 10) / 10;
                        
                        arcPath.push(aX);
                        arcPath.push(aY);
                        j = j + 2;
                    }
                    var arcReverse = [];
                    if (gradBeginPath >= 0 && gradBeginPath < 180 && !(gradBeginPath > 150 && wheelLife.areaGradWidth > 60)) {
                        for (var k = 0; k < arcPath.length - 1; k++) {
                            arcReverse.unshift(arcPath[k], arcPath[k + 1]);
                            k++;
                        }
                        arcPath = arcReverse;
                    }

                    // Render text
                    wheelLife.ctx.textAlign = "center";
                    wheelLife.ctx.textBaseline = "middle";
                    wheelLife.ctx.shadowColor = 'rgba(0,0,0,0)';
                    wheelLife.ctx.strokeStyle = 'rgba(0,0,0,0)';
                    wheelLife.ctx.shadowColor = wheelLife.textShadowColor;
                    wheelLife.ctx.shadowOffsetX = 1;
                    wheelLife.ctx.shadowOffsetY = 1;

                    var arcFontSize = 25;
                    if (areaName.length >= 10) arcFontSize = 22;
                    if (areaName.length >= 15 && areas.length > 5) arcFontSize = 16;
                    if (areaName.length >= 30 && areas.length > 5) arcFontSize = 12;
                    wheelLife.ctx.font = arcFontSize + "px oswald, COPPERPLATE, verdana";

                    for (var l = 1; l < 20; l++) {
                        // Уменьшаем шрифт, чтобы он помещался
                        if (wheelLife.ctx.measureText(areaName).width > arcLength / 1.15) {
                            arcFontSize -= 1;
                            wheelLife.ctx.font = arcFontSize + "px oswald, COPPERPLATE, verdana";
                        } else {
                            break;
                        }
                    }
                }
            }

            wheelLife.ctx.restore();

            wheelLife.ctx.save();

            if (countAreaClicked == wheelLife.areas.length && ! wheelLife.isDrawSimple && wheelLife.display == 'normal' && !wheelLife.isForTemplate) {
                // Рисуем дату и логотип, только после завершения выбора сфер

                // Не выводим на мелких экранах
                // Draw logo (resized for better quality) & site name
                var domain = document.domain;
                if (LOCAL) domain = 'goal-life.com';
                domain = domain.charAt(0).toUpperCase() + domain.slice(1);

                wheelLife.ctx.font = '14px oswald, COPPERPLATE, verdana';
                wheelLife.ctx.textAlign = 'right';
                wheelLife.ctx.fillStyle = '#999';
                wheelLife.ctx.fillText(domain, wheelLife.width - 13, wheelLife.height - 13);

                // logo
                try {
                    if (typeof wheelLife.images['logo'] != 'undefined') {
                        wheelLife.ctx.drawImage(wheelLife.images['logo'], wheelLife.width - wheelLife.ctx.measureText(domain).width - 38, wheelLife.height - 29, 50 / 2.5, 50 / 2.5);
                    }
                } catch (e) {
                    logMsg('wheel', e.toString());
                }

                // Скрываем logo
                var logoElement = $('#wheel-logo');
                if (logoElement.length) logoElement.hide();

                // Draw date
                wheelLife.ctx.textAlign = 'left';
                wheelLife.ctx.font = '10px oswald, COPPERPLATE, verdana';
                wheelLife.ctx.fillStyle = '#ccc';
                wheelLife.ctx.fillText(wheelLife.todayStr, 13, wheelLife.height - 13);
            }

            wheelLife.ctx.restore();
        },

        onMouseMove: function (e)
        {
            if (e.type != 'mousemove' && e.type != 'demo') {

                if (e.type != 'click' && 'originalEvent' in e) {

                    var pos = wheelLife.getOffsetPosition(e, wheelLife.canvas);
                    e.offsetX = pos.x;
                    e.offsetY = pos.y;
                }
            }

            if (!('offsetX' in e) || typeof(e.offsetX) == 'undefined') {

                var pos = wheelLife.getOffsetPosition(e, wheelLife.canvas);
                e.offsetX = pos.x;
                e.offsetY = pos.y;
            }

            var isClicked = false;
            if (' click touchstart touchmove'.indexOf(e.type) > 0) isClicked = true;

            var currentArea = 0; // В какой сфере сейчас мышка
            var countAreaClicked = 0;
            wheelLife.currentAreaLevel = -1;

            if (e.type == 'mousemove' && wheelLife.demoFrameNum > 0) {
                // Останавливаем текущий цикл демо
                clearInterval(wheelLife.demoFramesInterval);
                wheelLife.demoFrameNum = 0;
            }

            // Чистим область колеса
            wheelLife.ctx.save();
            wheelLife.ctx.beginPath();
            wheelLife.ctx.fillStyle = '#000';
            wheelLife.ctx.globalCompositeOperation = 'destination-out';
            wheelLife.ctx.arc(wheelLife.width / 2, wheelLife.height / 2, wheelLife.circleRadius, 0, 2 * Math.PI);
            wheelLife.ctx.fill();
            wheelLife.ctx.restore();


            var x = e.offsetX - wheelLife.width / 2;
            var y = wheelLife.height / 2 - e.offsetY;

            // Draw areas
            for (var i = 0; i < wheelLife.areas.length; i++) {
                // half doughnut
                wheelLife.ctx.beginPath();
                var gradBegin = i * wheelLife.areaGradWidth - 180;
                if (wheelLife.isZvezdaKovaleva || wheelLife.beginGradShift == 'star') gradBegin -= wheelLife.areaGradWidth/2 - 90; //  || wheelLife.areas.length == 4
                if (wheelLife.beginGradShift != 'star' && wheelLife.beginGradShift) gradBegin += parseInt(wheelLife.beginGradShift);

                var radBegin = gradBegin * Math.PI / 180;
                var radEnd = (gradBegin + wheelLife.areaGradWidth) * Math.PI / 180;

                var areaLevel = wheelLife.areas[i][2];
                if (areaLevel > 10) areaLevel = 10;
                var currentRadius = areaLevel * wheelLife.areaLevelWidth;

                if (wheelLife.isMouseInThatSector(gradBegin, x, y, i + 1)) {
                    currentArea = i + 1;
                    currentRadius = wheelLife.currentAreaLevel * wheelLife.areaLevelWidth;

                    if (isClicked) {
                        wheelLife.areas[i][2] = wheelLife.currentAreaLevel;

                        // Stop demo play
                        clearInterval(wheelLife.demoInterval);
                    }
                }

                // Сколько сфер задано
                if (wheelLife.areas[i][2] < 11) countAreaClicked++; // Значение задано


                // Fill area background
                wheelLife.ctx.beginPath();
                wheelLife.ctx.arc(wheelLife.width / 2, wheelLife.height / 2, wheelLife.circleRadius, radBegin, radEnd, false); // outer (filled)
                wheelLife.ctx.arc(wheelLife.width / 2, wheelLife.height / 2, 0, radBegin, radEnd, true); // outer (unfills it)
                // Верняя левая точка, чтобы замкнуть линию
                wheelLife.ctx.lineTo(wheelLife.width / 2 + wheelLife.circleRadius * Math.cos(radBegin), wheelLife.height / 2 + wheelLife.circleRadius * Math.sin(radBegin));

                wheelLife.ctx.save();


                if (!wheelLife.isZvezdaKovaleva) {
                    wheelLife.ctx.fillStyle = '#' + wheelLife.areas[i][1];

                    wheelLife.ctx.globalAlpha = 0.3;
                    if (wheelLife.isForTemplate) wheelLife.ctx.globalAlpha = 0.5;
                    if (wheelLife.isForTemplate && wheelLife.templateVariant == 2) wheelLife.ctx.globalAlpha = 0;

                    wheelLife.ctx.globalCompositeOperation = 'destination-over';
                    wheelLife.ctx.fill();
                    wheelLife.ctx.globalCompositeOperation = 'source-over';
                }

                wheelLife.ctx.globalAlpha = 1;
                wheelLife.ctx.lineWidth = 3;
                wheelLife.ctx.strokeStyle = '#f2f8fc';
                wheelLife.ctx.stroke();

                wheelLife.ctx.beginPath();


                // Fill area
                wheelLife.ctx.globalAlpha = 1;
                wheelLife.ctx.arc(wheelLife.width / 2, wheelLife.height / 2, currentRadius, radBegin, radEnd, false); // outer (filled)
                wheelLife.ctx.arc(wheelLife.width / 2, wheelLife.height / 2, 0, radBegin, radEnd, true); // outer (unfills it)

                // Верняя левая точка, чтобы замкнуть линию
                wheelLife.ctx.lineTo(wheelLife.width / 2 + wheelLife.circleRadius * Math.cos(radBegin), wheelLife.height / 2 + wheelLife.circleRadius * Math.sin(radBegin));

                try {
                    var grd = wheelLife.ctx.createRadialGradient(wheelLife.width / 2, wheelLife.height / 2, wheelLife.circleRadius / 1.5, wheelLife.width / 2, wheelLife.height / 2, wheelLife.circleRadius * 2.5);
                    grd.addColorStop(0, '#' + wheelLife.areas[i][1]);
                    grd.addColorStop(1, 'white');
                    wheelLife.ctx.fillStyle = grd;
                } catch (e) {
                    wheelLife.ctx.fillStyle = '#' + wheelLife.areas[i][1];
                }

                if (!wheelLife.isForTemplate) wheelLife.ctx.fill();

                wheelLife.ctx.lineWidth = 3;
                wheelLife.ctx.strokeStyle = '#f2f8fc';
                if (wheelLife.isForTemplate && wheelLife.templateVariant == 2) wheelLife.ctx.strokeStyle = '#555';
                wheelLife.ctx.stroke();

                wheelLife.ctx.restore();
            }

            if (wheelLife.isForTemplate) for (i = 1; i <= 10; i++) {
                // Рисуем круги делений на колесе, для шаблонов
                wheelLife.ctx.save();
                wheelLife.ctx.beginPath();
                wheelLife.ctx.strokeStyle = '#f2f8fc';
                if (wheelLife.templateVariant == 2) wheelLife.ctx.strokeStyle = '#555';
                wheelLife.ctx.lineWidth = 0.4;
                if (i == 5) wheelLife.ctx.lineWidth = 2;
                wheelLife.ctx.arc(wheelLife.width / 2, wheelLife.height / 2, wheelLife.circleRadius / 10 * i, 0, 2 * Math.PI);
                wheelLife.ctx.stroke();

                if (wheelLife.templateVariant == 2) {
                    wheelLife.ctx.font = '10px oswald, COPPERPLATE, verdana';
                    wheelLife.ctx.textAlign = 'right';
                    wheelLife.ctx.fillStyle = '#777';
                    wheelLife.ctx.fillText(i, wheelLife.width / 2 + i * wheelLife.circleRadius / 10 - 3, wheelLife.height / 2 - 3);
                }
                wheelLife.ctx.restore();
            }


            // Draw star
            if (wheelLife.isZvezdaKovaleva) {
                // Рисуем Здвезду
                wheelLife.ctx.save();
                wheelLife.ctx.beginPath();
                wheelLife.ctx.globalAlpha = 0.75;
                wheelLife.ctx.fillStyle = '#fff';

                var gradBegin2 = 0;
                for (i = 0; i < wheelLife.areas.length + 1; i++) {
                    gradBegin2 = i * wheelLife.areaGradWidth*2 - 90;
                    wheelLife.ctx.lineTo(Math.cos(gradBegin2 * Math.PI / 180) * (wheelLife.circleRadius) + wheelLife.width / 2 - 1, Math.sin(gradBegin2 * Math.PI / 180) * (wheelLife.circleRadius) + wheelLife.height / 2 - 1);
                }
                wheelLife.ctx.fill();
                wheelLife.ctx.restore();
            }

            wheelLife.ctx.save();


            // Reset current transformation matrix to the identity matrix
            wheelLife.ctx.setTransform(1, 0, 0, 1, 0, 0);
            wheelLife.ctx.scale(2, 2);

            wheelLife.ctx.translate(wheelLife.width / 2, wheelLife.height / 2);

            // Цифровое значение выбранных секторов
            for (i = 0; i < wheelLife.areas.length; i++)
            {
                areaLevel = wheelLife.areas[i][2];
                if (areaLevel < 11) {
                    if (areaLevel > 10) areaLevel = 10;
                    wheelLife.ctx.save();

                    gradBegin = i * wheelLife.areaGradWidth + wheelLife.areaGradWidth / 2 - 180;
                    if (wheelLife.isZvezdaKovaleva || wheelLife.beginGradShift == 'star') gradBegin -= wheelLife.areaGradWidth / 2 - 90;
                    if (wheelLife.beginGradShift != 'star' && wheelLife.beginGradShift) gradBegin += parseInt(wheelLife.beginGradShift);

                    wheelLife.ctx.fillStyle = '#fff';
                    wheelLife.ctx.font = '12px verdana';
                    wheelLife.ctx.globalAlpha = 0.5;
                    if (wheelLife.isZvezdaKovaleva) wheelLife.ctx.globalAlpha = 0.9;

                    if (wheelLife.display == 'square'){
                        wheelLife.ctx.font = '19px verdana';
                        wheelLife.ctx.globalAlpha = 0.7;
                    }
                    if (wheelLife.display == 'star'){
                        wheelLife.ctx.font = '14px verdana';
                        wheelLife.ctx.globalAlpha = 0.7;
                    }
                    wheelLife.ctx.shadowColor = "rgba(0, 0, 0, 0)";
                    var textAreaLevel = areaLevel - 1;
                    if (textAreaLevel < 2) textAreaLevel = areaLevel + 1;
                    wheelLife.ctx.fillText(areaLevel, Math.cos(gradBegin * Math.PI / 180) * (textAreaLevel * wheelLife.areaLevelWidth), Math.sin(gradBegin * Math.PI / 180) * (textAreaLevel * wheelLife.areaLevelWidth));
                    wheelLife.ctx.restore();
                }
            }

            wheelLife.ctx.restore();

            // Чистим область колеса
            wheelLife.ctx.beginPath();
            wheelLife.setBackgroundStyle();
            wheelLife.ctx.arc(wheelLife.width / 2, wheelLife.height / 2, wheelLife.circleRadius, 0, 2 * Math.PI);
            wheelLife.ctx.globalCompositeOperation = 'destination-over';
            wheelLife.ctx.fill();
            wheelLife.ctx.globalCompositeOperation = 'source-over';

            // Draw demo pointer
            if (e.type == 'demo' && wheelLife.demoFrameNum > 0) {
                try {
                    wheelLife.ctx.drawImage(wheelLife.images['pointer'], e.offsetX, e.offsetY);
                } catch (e) {
                    // Stop demo play
                    clearInterval(wheelLife.demoInterval);
                }
            }


            if (currentArea > 0) {
                $(wheelLife.canvas).css('cursor', 'pointer');
            } else {
                $(wheelLife.canvas).css('cursor', 'default');
            }

            if (countAreaClicked) {
                var hint = $('.wheel-life-hint');
                if (hint.length) hint.hide();
            }

            // Все сферы выбраны - показываем результат
            if (countAreaClicked == wheelLife.areas.length && isClicked) {
                wheelLife.result();

                wheelLife.drawTemplate();
                wheelLife.onMouseMove({offsetX: -1, offsetY: -1, type: 'mousemove'}); // Simulate click
            }

            if(isClicked && typeof itemHasClicked === "function"){
                var item = areas[currentArea -1];
                if(item != undefined)
                    itemHasClicked(item);
            }
        },
        isMouseInThatSector: function (gradBegin, x, y, area) {
            // Начало сектора - в самом верху
            gradBegin += 90;
            // Конец сектора
            var gradEnd = Math.round(gradBegin + wheelLife.areaGradWidth);
            // Текущий радиус круга, на котором находится курсор
            var currentRadius = Math.sqrt(Math.pow(x - 0, 2) + Math.pow(y - 0, 2));
            if (currentRadius < 0) currentRadius = 0;

            // Текущий угол в котором находится курсор
            var currentGrad = Math.round(Math.asin(x / currentRadius) / Math.PI * 180);

            // Поправки на 0-360 градусов
            if (y < 0 && x > 0) currentGrad = 180 - currentGrad;
            if (y < 0 && x < 0) currentGrad = 180 - currentGrad;
            if (x < 0 && y > 0) currentGrad = 360 + currentGrad;
            if (gradBegin < 0 && x < 0 && y > 0) currentGrad = currentGrad - 360; // Когда первая сфера смещена против часовой. Для звезды Ковалёва.

            // Курсор не попадает в текущий сектор или радиус мышки больше чем круг
            if (currentGrad < gradBegin || currentGrad >= gradEnd || currentRadius > wheelLife.circleRadius) {
                return false;
            }

            wheelLife.currentAreaLevel = 10 - Math.floor((wheelLife.circleRadius - currentRadius) / wheelLife.areaLevelWidth);
            if (wheelLife.currentAreaLevel == 0) wheelLife.currentAreaLevel = 1;

            return true;
        },
        downloadImage: function () {
            var dataURL = wheelLife.canvas.toDataURL();

            var link = document.createElement('a');
            link.download = 'wheel-life-' + wheelLife.todayStr.replace(/\./, '-').replace(/\./, '-') + '.png';
            link.href = dataURL;
            link.click();

            return false;
        },
        saveImage: function () {
            var dataURL = wheelLife.canvas.toDataURL();

            $.post('/tool/wheel_life_save',
                { image_data: dataURL},
                function () {
                    $('#wheel-life-result .share .text-on span').hide();
                }
            );
        },
        demo: function () {
            if (wheelLife.demoFramesInterval) {
                // already play demo -- если окно потеряет фокус, то браузер начнет быстро прорисовывать аннимацию накладывая несколько
                return false;
            }
            wheelLife.demoFrameNum = 0;
            wheelLife.demoFramesInterval = setInterval(wheelLife.demoFrame, 30);
        },
        demoFrame: function () {
            wheelLife.demoFrameNum += 1;
            var frame = wheelLife.demoFrameNum;
            if (frame > 30) frame = 61 - wheelLife.demoFrameNum;

            // За пределами колеса нет перерисовки – не позволяем тупа попасть
            var initX = wheelLife.width / 2;
            if (wheelLife.scaleCoefX >= 2.5) initX -= wheelLife.circleRadius / 2;

            // Simulate mouse move
            wheelLife.onMouseMove({
                offsetX: initX + wheelLife.circleRadius / 4 + frame * (wheelLife.circleRadius < 100 ? 1.2 : 3),
                offsetY: wheelLife.height / 2 + (wheelLife.demoFrameNum > 30 ? 20 : -20),
                type: 'demo'
            });

            if (wheelLife.demoFrameNum > 60) {
                // Stop demo current play
                clearInterval(wheelLife.demoFramesInterval);
                wheelLife.demoFramesInterval = null;
                wheelLife.demoFrameNum = 0;

                wheelLife.reDrawAll();
            }
        },
        result: function () {

            // log('result');
            //localEvent('wheel-life', 'result', 'show', 1, 1);
            $('#wheel-life-result').show().removeClass('hide');
            $('#wheel-life-hint').hide();

            wheelLife.onFillTriggered = true;
            wheelLife.onFill(wheelLife.areas);

            // Stop demo play
            clearInterval(wheelLife.demoInterval);
            clearInterval(wheelLife.demoFramesInterval);


            if (wheelLife.display == 'square') {
                return false;
            }

            $('#wheel-life-result .result').show();
            $('#button-download-wheel').show();
            $('#button-clear-areas').show();
            
            return false;
        },
        resize: function () {
            // Сжимаем отображаемый вид, чтобы улучшить качество - это такой трюк

            if (wheelLife.lastClientWidth == document.body.clientWidth) {
                // Изменилась только высота на телефоне, скорее всего появилась навигационная строка вверху или внизу (не нужно перерисовывать)
                return false;
            }
            wheelLife.lastClientWidth = document.body.clientWidth;

            // Изменяем высоту на мелких экранах, чтобы колесо было больше
            var smallCoef = 1;
            if (document.body.clientWidth < 600) smallCoef = 1.3;
            if (document.body.clientWidth < 500) smallCoef = 1.5;
            if (document.body.clientWidth < 400) {
                wheelLife.areaNamesFormat = 'circle';
                smallCoef = 1.8;
            }

            if (document.body.clientWidth < wheelLife.widthInit) {
                // Для меньших экранов - делаем зум
                var marginWidth = 10; // По 5px отступа
                $(wheelLife.canvas).css('width', document.body.clientWidth - marginWidth);
                var height = wheelLife.heightInit * (document.body.clientWidth - marginWidth) / wheelLife.widthInit * smallCoef;
                $(wheelLife.canvas).css('height', height);
            }

            $(wheelLife.canvas).attr('width', $(wheelLife.canvas).width() * 2);
            $(wheelLife.canvas).attr('height', $(wheelLife.canvas).height() * 2);

            wheelLife.scaleCoefX = parseFloat(wheelLife.widthInit / $(wheelLife.canvas).width());
            wheelLife.scaleCoefY = parseFloat(wheelLife.heightInit / $(wheelLife.canvas).height());
            wheelLife.ctx.setTransform(1, 0, 0, 1, 0, 0);
            wheelLife.ctx.scale(2, 2);

            // Константы для колеса
            wheelLife.width = $(wheelLife.canvas).width();
            wheelLife.height = $(wheelLife.canvas).height();

            wheelLife.circleRadius = Math.round(wheelLife.height / 2) - 30;
            wheelLife.areaLevelWidth = wheelLife.circleRadius / 10;
        },

        findIndexForSplit: function(str)
        {
            var begin = 25;
            var end = 35;
            var index = 0, res = [];
            if (str.length <= begin) return str.length;

            while ((index = str.indexOf(' ', index + 1)) > 0) {
                if (index >= 25 && index <= 35) res.push(index);
            }
            while ((index = str.indexOf('/', index + 1)) > 0) {
                if (index >= 25 && index <= 35) res.push(index);
            }
            if (res.length == 0) res.push(Math.round((begin + end) / 2));

            return res[0];
        },

        setBackgroundStyle: function()
        {
            try {
                var grd = wheelLife.ctx.createRadialGradient(0, 0, wheelLife.height, wheelLife.width, wheelLife.height, wheelLife.height);
                grd.addColorStop(0, '#FAFAF2');
                grd.addColorStop(1, '#F2F8FD');
                wheelLife.ctx.fillStyle = grd;
            } catch (e) {
                wheelLife.ctx.fillStyle = '#FAFAF2';
            }
            if (wheelLife.isForTemplate && wheelLife.templateVariant == 2) wheelLife.ctx.fillStyle = 'white';

        }
    };

    if ('isDrawSimple' in settings) wheelLife.isDrawSimple = settings['isDrawSimple'];
    wheelLife.areas = settings['areas'];
    if ('display' in settings) wheelLife.display = settings['display'];

    if (('areaNamesFormat' in settings && settings['areaNamesFormat'] == 'linear') || typeof CanvasRenderingContext2D.prototype.textPath == 'undefined') {
        wheelLife.areaNamesFormat = 'linear';
    }

    if ('onFill' in settings && typeof(settings['onFill']) == 'function') wheelLife.onFill = settings['onFill'];
    if ('beginGradShift' in settings) wheelLife.beginGradShift = settings['beginGradShift'];
    if ('isZvezdaKovaleva' in settings) wheelLife.isZvezdaKovaleva = settings['isZvezdaKovaleva'];

    return wheelLife;
}