import {initSlider, initFirstSlider, getItems, addLastWeekSlide,
        daytimeSliderChanges, addHandle, deleteHandle,
        calculateAllHandles, setHandleSize, setWeekText} from './weeks';

$(window).ready(function () {
    $('#handle-size-select').on('change', function(){
        setHandleSize(this.value);
    });
    $('#calculate-all').on('click', ()=> {
        calculateAllHandles();
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
                            }
                            setWeekText(ctx.currentSlide);
                            if (ctx.currentSlide == 0) {
                                $('.flex-prev').hide();
                                $('.flex-prev-block').show();
                            } else {
                                $('.flex-prev').show();
                                $('.flex-prev-block').hide();
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
                        let pastDaySliders = allFirstWeekSliders.splice(0, allFirstWeekSliders.index(firstSlider));
                        pastDaySliders.forEach(el => {
                            // mark past days (cant move/create handles there)
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

    $('.flex-prev').hide();
    $('.flex-prev-block').show();



    


// ADD AND DEL BUTTON

    $('.add-button').click(() => {
        var allSliders = $('.flex-active-slide .default-wrap > div:not(.past-day)');
        var firstActiveSlider = allSliders[0];
        addHandle(firstActiveSlider);
    });
    {
        let focusElem = null;
        $('.del-button').mousedown(() => {
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
// TODO final calculations function (dont forget about 23-value) bug
// week text displays incorrectly if slides are skipped too fast
// TODO handle custom size??? DONE

