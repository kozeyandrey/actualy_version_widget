
$(window).ready(function () {
    var animation = true;
    // Current day active-slider
    {
        let day = moment().day();
        let activeElem;
        switch(day) {
            case 1:
                activeElem = $('.monday');
                break;
            case 2:
                activeElem = $('.tuesday');
                break;
            case 3:
                activeElem = $('.wednesday');
                break;
            case 4:
                activeElem = $('.thursday');
                break;
            case 5:
                activeElem = $('.friday');
                break;
            case 6:
                activeElem = $('.saturday');
                break;
            case 7:
                activeElem = $('.sunday');
                break;
        }
        activeElem.addClass('active-slider');
    }


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
                    animationLoop: animation
                });


            } else if (display == 'block') {
                document.getElementById('box').style.display = 'none';
            }
        });
    }


// CLOSES WIDGET

    $('.close-button').click(function () {
        document.getElementById('box').style.display = 'none';
    });

// SELECTOR

// DAYTIME ONLY OFF OR ON

    let daytime_on = true;

    function daytimeSliderChanges() {
        if (daytime_on) {
            $('.switch-on').removeClass('active');
            $('.switch-off').addClass('active');
            $('.default-wrap').addClass('slide-wrap');
            $('.default-slider').addClass('slider');
            $('.slider').removeClass('default-slider');


            $('.slider').slider({
                min: 0,
                max: 23
            });

            daytime_on = false;
        } else if (daytime_on == false) {
            $('.switch-off').removeClass('active');
            $('.switch-on').addClass('active');
            $('.slide-wrap').addClass('default-wrap');
            $('.default-wrap').removeClass('slide-wrap');
            $('.slider').addClass('default-slider');
            $('.default-slider').removeClass('slider');

            $('.default-slider').slider({
                min: 4,
                max: 14
            });

            daytime_on = true;
        }
    }

    $('.switch-on').click(daytimeSliderChanges);
    $('.switch-off').click(daytimeSliderChanges);

// SLIDERS INIT
    {
        // initiating popup
        $('body').append('<div id="slider-popup">000</div>');
        let popup = $('#slider-popup');
        console.log(popup);
        $('.default-slider').slider({
            orientation: 'vertical',
            min: 4,
            max: 14,
            step: 1,
            animate: true,
            start: (e, ui) => {
                console.log('start');
                // console.log(e);
                let v = 23 - ui.value;
                popup.text(v);
                let handler = $($(e.target).find('.ui-slider-handle'));
                popup.show();
                popup.css('top', handler.offset().top - 20);
                popup.css('left', handler.offset().left + 30);
            },
            slide: function (e, ui) {
                let v = 23 - ui.value;
                popup.text(v);
                let handler = $($(e.target).find('.ui-slider-handle'));

                popup.css('top', handler.offset().top - 20);
                popup.css('left', handler.offset().left + 30);
                $(".contentSlider").html(v + ' hour');
            },
            stop: () => {
                console.log('stop');
                popup.hide();
            },
        });
    }

// When clicking on the arrows generate weeks
    var m = moment();
    var monday = m.day(1).format('DD');
    var sunday = m.day(7).format('DD');
    var thisMonth = m.format('MM');
    $('.item-week').html('Week ' + monday + '-' + sunday + '.' + thisMonth);


    var thisWeek = moment().week();
    var week = moment().week();

    if (week == thisWeek) {
        $('.flex-prev').css('display', 'none');
        $('.flex-prev-block').css('display', 'block');
    } else {
        $('.flex-prev-block').css('display', 'none');
        $('.flex-prev').css('display', 'block');
    }

    $('.flex-next').click(function () {
        $('.flex-prev').css('display', 'block');
        $('.flex-prev-block').css('display', 'none');
        if (week == thisWeek) {
            week = thisWeek + 1;
        } else if (week == prevWeek) {
            week = prevWeek + 1;
        }
        else {
            week = week + 1;
        }
        var mom = moment().week(week);
        var monday = mom.day(1).format('DD');
        var sunday = mom.day(7).format('DD');
        var thisMonth = mom.format('MM');
        $('.item-week').html('Week ' + monday + '-' + sunday + '.' + thisMonth);
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
            $('.flex-prev').css('display', 'none');
            $('.flex-prev-block').css('display', 'block');
        } else {
            $('.flex-prev').css('display', 'block');
            $('.flex-prev-block').css('display', 'none');
        }

        var mom = moment().week(week);
        var monday = mom.day(1).format('DD');
        var sunday = mom.day(7).format('DD');
        var thisMonth = mom.format('MM');
        $('.item-week').html('Week ' + monday + '-' + sunday + '.' + thisMonth);

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

    //var createSlider = function ($slider, values) {
    // $slider.slider({
    //  min: 4,
    // max: 14,
    //  step: 1,
    //  values: values
    //});
    // };
    // var values = [10, 14, 15],
    // $slider = $('.wednesday');
    //createSlider($slider, values);
    // destroy slider
    //$slider.slider('destroy');
    // add new value (simplyfied of course)
    //values = [10, 14, 17, 19];
    // create new slider again with new values
    //createSlider($slider, values);
});
