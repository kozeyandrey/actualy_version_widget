import {initSlider, getItems, addLastWeekSlide,
        daytimeSliderChanges} from './weeks';
$(window).ready(function () {
    var daytime_on = true;
    $('body').append('<div id="slider-popup"></div>');
    var sliderPopup = $('#slider-popup');




//  OPEN WIDGET
    {
        let display;
        $('.on-btn').click(function () {
            display = document.getElementById('box').style.display;
            if (display == 'none') {
                document.getElementById('box').style.display = 'block';

                $('.flexslider').flexslider({
                    animation: 'slide',
                    slideshow: false,
                    controlNav: false,
                    controlsContainer: $('.custom-controls-container'),
                    customDirectionNav: $('.custom-navigation a'),
                    keyboard: false,
                    animationLoop: true,
                    after: (ctx) => {
                        if (ctx.currentSlide == ctx.last) {
                            addLastWeekSlide($('.flexslider'));
                            console.log('last transition ended?');
                        }
                    }
                });

                // Set Current day slider active, with one value
                {
                    let day = moment().isoWeekday();
                    let activeElem;
                    switch(day) {
                        case 1:
                            activeElem = '.monday';
                            break;
                        case 2:
                            activeElem = '.tuesday';
                            break;
                        case 3:
                            activeElem = '.wednesday';
                            break;
                        case 4:
                            activeElem = '.thursday';
                            break;
                        case 5:
                            activeElem = '.friday';
                            break;
                        case 6:
                            activeElem = '.saturday';
                            break;
                        case 7:
                            activeElem = '.sunday';
                            break;
                    }
                    initSlider($('.flex-active-slide').find(activeElem), daytime_on, sliderPopup);
                    $('.flex-active-slide').find(activeElem).addClass('active-slider');
                }




            } else if (display == 'block') {
                document.getElementById('box').style.display = 'none';
            }
        });
    }
// CLOSES WIDGET
    $('.close-button').click(function () {
        document.getElementById('box').style.display = 'none';
    });

// DAYTIME ONLY OFF OR ON


    $('.switch-on').click(daytimeSliderChanges);
    $('.switch-off').click(daytimeSliderChanges);


// When clicking on the arrows generate weeks
    function setWeekText(week) {
        let m = week ? moment().week(week) : moment();
        let monday = m.isoWeekday(1).format('DD');
        let sunday = m.isoWeekday(7).format('DD');
        let thisMonth = m.format('MM');
        $('.item-week').html('Week ' + monday + '-' + sunday + '.' + thisMonth);
    }



    var thisWeek = moment().week();
    var week = moment().week();
    setWeekText(week);
    if (week == thisWeek) {
        $('.flex-prev').hide();
        $('.flex-prev-block').show();
    } else {
        $('.flex-prev-block').hide();
        $('.flex-prev').show();
    }

    $('.flex-next').click(function () {
        $('.flex-prev').show();
        $('.flex-prev-block').hide();

        let slideIndex = getItems().index($('.flex-active-slide'));
        console.log(slideIndex);
        if (week == thisWeek) {
            week = thisWeek + 1;
        } else if (week == prevWeek) {
            week = prevWeek + 1;
        }
        else {
            week = week + 1;
        }
        setWeekText(week);
    });

    var theWeek = week;
    var prevWeek;
    $('.flex-prev').click(function () {
        if (week == thisWeek) {
            return false;
        } else {
            week = week - 1;
        }
        theWeek = week;
        if (theWeek == thisWeek) {
            $('.flex-prev').hide();
            $('.flex-prev-block').show();
        } else {
            $('.flex-prev').show();
            $('.flex-prev-block').hide();
        }

        setWeekText(week);

        prevWeek = week;
    });


// ADD AND DEL BUTTON
    $('.default-wrap').click(function () {
        $('.wednesday').addClass('twoHandles');
        $(this).click(function () {
            $('.wednesday').slider({
                values: [13, 14, 15]
            });
        });
    });


});

// TODO new week generating
// TODO choosing a slider makes it a diff. color, delete button deletes it
// TODO add button - add a new slider to monday

