import {initSlider, initFirstSlider, getItems, addLastWeekSlide,
        daytimeSliderChanges, addHandle, deleteHandle,
        updateAllHandles, setHandleSize} from './weeks';

$(window).ready(function () {
    $('#handle-size-select').on('change', function(){
        console.log('event');
        console.log(this.value);
        setHandleSize(this.value);
    });


    var isInitiated = false;

//  OPEN WIDGET
    {
        let display;
        $('.on-btn').click(function () {
            display = document.getElementById('box').style.display;
            if (display == 'none') {
                document.getElementById('box').style.display = 'block';

                if (!isInitiated) {
                    isInitiated = true;
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
                                console.log('last transition ended');
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
                        let firstSlider = $('.flex-active-slide').find(activeElem);
                        let allFirstWeekSliders = $('.flex-active-slide .default-wrap > div');
                        // console.log(allFirstWeekSliders);
                        let pastDaySliders = allFirstWeekSliders.splice(0, allFirstWeekSliders.index(firstSlider));
                        console.log('pastDaySliders',pastDaySliders);
                        pastDaySliders.forEach(el => {
                            // mark past days (cant move/create handles there)
                            console.log('adding past day');
                            $(el).addClass('past-day');
                        });
                        initFirstSlider(firstSlider);


                    }
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


// When clicking on the arrows generate week text
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

    $('.add-button').click(() => {
        var allSliders = $('.flex-active-slide .default-wrap > div:not(.past-day)');
        console.log('allSliders', allSliders);
        var firstActiveSlider = allSliders[0];
        addHandle(firstActiveSlider);
    });
    {
        let focusElem = null;
        $('.del-button').mousedown(() => {
            console.log('delete');
            console.log($(':focus'));
            $(':focus').hasClass('ui-slider-handle') ? focusElem = $(':focus') : focusElem = null;
        });
        $('.del-button').click(() => {
            if (focusElem) {
                deleteHandle(focusElem);
            }
        });
    }
});
// TODO prevent moving handles to days and hours past current time DONE
// TODO move white background a bit so it looks better (skype) DONE
// TODO final calculations function (dont forget about 23-value)
// TODO handle custom size???

