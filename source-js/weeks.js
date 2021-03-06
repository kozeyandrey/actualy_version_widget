function getAbsoluteRect(elem) {
    var rect = elem.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        right: rect.right + window.scrollX
    }
}

var sliderPopup;
var startHour; // hour on which widget started, handles cant step on it and past it
var startMoment;
$(window).ready(()=> {
    $('body').append('<div id="slider-popup"></div>');
    sliderPopup = $('#slider-popup');
    startHour = moment().hour();
    startMoment = moment();
    setWeekText();
});
var daytime_on = true;
var HANDLE_SIZE = 100;
export function setHandleSize(size) {
    // console.log(size);
    HANDLE_SIZE = parseInt(size);
    updateAllHandles();
    updateSliderCSS();
}
export function updateAllHandles() {
    var heightToSet;
    switch(HANDLE_SIZE) {
        case 100:
            heightToSet = 8;
            break;
        case 200:
            heightToSet = 16;
            break;
        case 300:
            heightToSet = 24;
            break;
        case 400:
            heightToSet = 32;
            break;
        default:
            console.log('incorrect HANDLE_SIZE! Defaulting to 100');
            heightToSet = 8;
    }
    $('.ui-slider-handle').css('height', heightToSet);
}

export function updateSliderCSS() {
    if (daytime_on) {
        var plus;
        switch(HANDLE_SIZE) {
            case 100:
                plus = 0;
                break;
            case 200:
                plus = 7;
                break;
            case 300:
                plus = 14;
                break;
            case 400:
                plus = 20;
                break;
        }
        $('.default-wrap').css('height', 190 + plus);
        $('.default-wrap').css('padding-top', 70 + plus);
    } else {
        var plus;
        switch(HANDLE_SIZE) {
            case 100:
                plus = 0;
                break;
            case 200:
                plus = 7;
                break;
            case 300:
                plus = 14;
                break;
            case 400:
                plus = 20;
                break;
        }
        $('.default-wrap').css('height', 190 + plus);
        $('.default-wrap').css('padding-top', plus);
    }
}
function filterValues(values, daytime_on) {
    if (daytime_on) {
        // console.log('filtering...', values);
        values = values.filter((v) => {
            if (v <= 14 && v >= 4) {
                return true;
            } else {
                return false;
            }
        })
    }
    // console.log(values);
    return values;
}
function getDefaultValue(daytime_on) {
    var value = 23 - (moment().hour() + 1);
    if (value < 0) value = 0;
    if (daytime_on) {
        if (value < 4) value = 4;
        else if (value > 14) value = 14;
    }
    // console.log('default', value);
    return value;
}
export function initSlider(selector, values) {
    var defaultValue;
    if (selector.hasClass('current-day')) {
        defaultValue = getDefaultValue(daytime_on);
    } else {
        defaultValue = daytime_on ? 14 : 23;
    }
    values = values ? filterValues(values, daytime_on) : [defaultValue];
    selector.slider({
        orientation: 'vertical',
        min: daytime_on ? 4 : 0,
        max: daytime_on ? 14 : 23,
        values: values,
        step: 1,
        animate: true,
        start: (e, ui) => {
            let v = 23 - ui.value;
            sliderPopup.text(v);
            sliderPopup.show();
            sliderPopup.css('top', getAbsoluteRect(ui.handle).top - 10);
            sliderPopup.css('left', getAbsoluteRect(ui.handle).left + 30);
        },
        slide: function (e, ui) {
            if ($(this).hasClass('current-day')) {
                if (!handleCurrentDay(ui)) return false;
            }
            var thisCoords = getAbsoluteRect(this);
            // only triggering the event if mouse is in a range of the slider
            if (!(e.pageX < thisCoords.right+10 && e.pageX > thisCoords.left-10
                && e.pageY < thisCoords.bottom+10 && e.pageY > thisCoords.top-10)) {return false;}
            let diffValues = [];
            // prevent handle overlapping
            for (let a = 0; a < ui.values.length; a++) {
                if (diffValues.indexOf(ui.values[a]) > -1) {
                    return false;
                } else {
                    diffValues.push(ui.values[a]);
                }
            }

            if (!testBigSliderOverlap(ui)) return false;

            let v = 23 - ui.value;
            sliderPopup.text(v);
            sliderPopup.css('top', getAbsoluteRect(ui.handle).top - 10);
            sliderPopup.css('left', getAbsoluteRect(ui.handle).left + 30);
        },
        stop: () => {
            sliderPopup.hide();
        },
    });
    // console('VALUES', values);
    if (values.length == 0) {
        selector.removeClass('active-slider');
    } else {
        selector.addClass('active-slider');
    }
    setDraggables();
    updateAllHandles();
}

function testBigSliderOverlap(ui) {
    // console.log(ui.value, ui.values);
    if (ui.values.length == 1) return true;
    var diff;
    switch(HANDLE_SIZE) {
        case 100:
            return true;
            break;
        case 200:
            diff = 2;
            break;
        case 300:
            diff = 3;
            break;
        case 400:
            diff = 4;
            break;
    }
    for (let i = 0; i < ui.values.length; i++) {
        var thisValue = ui.values[i];
        var otherValues = ui.values.slice();
        otherValues.splice(i, 1);
        // console.log(thisValue, otherValues);
        for (let a = 0; a < otherValues.length; a++) {
            let otherValue = otherValues[a];
            if (Math.abs((23 - otherValue) - (23 - thisValue)) < diff) {
                // console.log('return false on', 23 - thisValue, 23 - otherValue);
                return false;
            }
        }
    }
    return true;
}

export function initFirstSlider(selector) {
    selector.addClass('current-day');
    var defaultValue = getDefaultValue(daytime_on);
    if ((defaultValue >= 23 - startHour)) {
        // console('current day with an exception');
        var nextSlider = findNextSlider(selector, true);
        initSlider($(nextSlider));
    } else {
        initSlider(selector);
    }
}

function findNextSlider(selector, gotonext) {
    var thisWeekSliders = $('.flex-active-slide .default-wrap > div');
    var sliderIndex = thisWeekSliders.index(selector);
    // if not sunday
    var nextSlider;
    if (sliderIndex != 6) {
        nextSlider = thisWeekSliders[sliderIndex + 1];
    }
    // if sunday
    else {
        var activeSlide = $('.flex-active-slide')[0];
        var nextSlide = activeSlide.nextElementSibling;
        nextSlider = $(nextSlide).find('.monday');
        if (gotonext) goToNextSlide();
    }
    return nextSlider;

}

function goToNextSlide() {
    $('.flex-next').trigger('click');
}

function handleCurrentDay(ui) {
    return (ui.value < 23 - startHour);
}

function setDraggables() {
    $('.ui-slider-handle').off('mousedown');
    $('.ui-slider-handle').on('mousedown', function(e) {
        // console.log('mousedown', this);
        var targetHandle = this;
        $(targetHandle).focus(); // fix incorrect focus bug
        // console(targetHandle);
        var targetSlider = $(this).parent()[0];
        var handleIndex = $(targetSlider).find('.ui-slider-handle').index(targetHandle);
        var sliderIndex = $('.flex-active-slide .scale-item .default-wrap > div').index($(targetSlider));
        var clone = $(this).clone().addClass('handle-clone');
        clone.css('width', $(targetHandle).width()).css('height', $(targetHandle).height());
        clone.css('border-radius', '10%');
        moveAt(e);
        $('body').append(clone);
        // console('sliderIndex', sliderIndex);
        function initWrapEvents() {
            $('.flex-active-slide .scale-item .default-wrap').each((i, el) => {
                if (i !== sliderIndex) {
                    // console.log('attaching event', el);
                    $(el).mouseup(function(e) {
                        var newSlider = $(e.currentTarget).find('div');

                        applyDragAndDrop(e, targetSlider, newSlider, handleIndex);


                    })
                }
            });
        }
        function clearWrapEvents() {
            $('.flex-active-slide .scale-item .default-wrap').off('mouseup');
        }

        initWrapEvents();

        function moveAt(e) {
            $(targetHandle).focus(); // fix incorrect focus bug
            var thisCoords = getAbsoluteRect(targetSlider);
            if (e.pageX < thisCoords.right+10 && e.pageX > thisCoords.left-10
                && e.pageY < thisCoords.bottom+10 && e.pageY > thisCoords.top-10) {
                clone.css('display', 'none');
            } else {
                clone.css('display', 'initial');
                clone.css('left', e.pageX - clone.width()/2);
                clone.css('top', e.pageY - clone.height()/2);
            }


        }
        $('body').mousemove(function(e) {
            // console.log('mousemove');
            moveAt(e);
        });

        $('body').mouseup(function(e) {
            // console.log('mouseup');
            $('body').off('mousemove');
            $('body').off('mouseup');
            clone.remove();
            clearWrapEvents();
        });



    })
}

function applyDragAndDrop(e, targetSlider, newSlider, handleIndex) {
    if (newSlider.hasClass('past-day')) return;
    if (newSlider.hasClass('current-day')) {
        var defaultValue = getDefaultValue(daytime_on);
        if (defaultValue >= 23 - startHour) {
            return;
        }
    }
    // console.log(e);
    var oldSliderValues = $(targetSlider).slider('values');
    oldSliderValues.splice(handleIndex, 1);
    var wasAdded = addHandle(newSlider, true);
    // if slider actually didnt update (not enough place), do nothing
    if (wasAdded) {
        $(targetSlider).slider('destroy');
        initSlider($(targetSlider), oldSliderValues);
    }
    sliderPopup.hide();


}

export function getItems() {
    return $('.flexslider .slides .item:not(.clone)');
}

export function addLastWeekSlide(selector) {
    var ctx = selector.data('flexslider');

    var template = $(`<li class="item">
                                <div class="item-week">
                                </div>
                                <div class="scale-wrapper">
                                    <ul class="list-scale-wrap">
                                        <li class="times-wrap-left">
                                            <div class="time-min">00</div>
                                            <div class="time-max">24</div>
                                        </li>
                                        <li class="scale-item">
                                            <div class="day">Mon</div>
                                            <div class="add-times-left">
                                                <div class="default-wrap">
                                                    <div class="default-slider monday"></div>
                                                </div>
                                            </div>
                                        </li>
                                        <li class="scale-item">
                                            <div class="day">Tue</div>
                                            <div class="default-wrap">
                                                <div class="default-slider  tuesday"></div>
                                            </div>
                                        </li>
                                        <li class="scale-item">
                                            <div class="day">Wed</div>
                                            <div class="default-wrap">
                                                <div class="default-slider wednesday"></div>
                                            </div>
                                        </li>
                                        <li class="scale-item">
                                            <div class="day">Th</div>
                                            <div></div>
                                            <div class="default-wrap">
                                                <div class="default-slider thursday"></div>
                                            </div>
                                        </li>
                                        <li class="scale-item">
                                            <div class="day">Fr</div>
                                            <div class="default-wrap">
                                                <div class="default-slider  friday"></div>
                                            </div>
                                        </li>
                                        <li class="scale-item">
                                            <div class="day">Sat</div>
                                            <div class="default-wrap">
                                                <div class="default-slider  saturday"></div>
                                            </div>
                                        </li>
                                        <li class="scale-item">
                                            <div class="day">Sun</div>
                                            <div class="add-times-right">
                                                <div class="default-wrap">
                                                    <div class="default-slider  sunday"></div>
                                                </div>
                                            </div>
                                        </li>
                                        <li class="times-wrap-right">
                                            <div class="time-min">00</div>
                                            <div class="time-max">24</div>
                                        </li>
                                    </ul>
                                </div>
                            </li>`);
    ctx.addSlide(template);
    updateSliderCSS();
}

export function daytimeSliderChanges() {
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

        daytime_on = true;
        $('.default-slider.active-slider').each((i, el) => {
            let values = $(el).slider('values');
            $(el).slider('destroy');
            initSlider($(el), values);

        });

    }
    updateSliderCSS();
}

export function addHandle(selector, isFromDrag) {
    var $slider = $(selector);
    // console.log($slider);
    var possibleArr = [];
    // a list of possible handle values which can be added
    if (daytime_on) possibleArr = [4,5,6,7,8,9,10,11,12,13,14];
    else {
        possibleArr = [...new Array(24).keys()];
    }
    if (!$slider.hasClass('active-slider')) {
        var defaultValue = getDefaultValue(daytime_on);
        if ($slider.hasClass('current-day') && (defaultValue >= 23 - startHour)) {
            var nextSlider = findNextSlider(selector, false);
            // if next slider is on another flexSlide
            if ($('.flex-active-slide .default-wrap > div').index(nextSlider) == -1) {
                // console.log('fix!');
                return;
            }
            addHandle(nextSlider);
            $(nextSlider).addClass('active-slider');
        }
        else {
            initSlider($slider);
            $slider.addClass('active-slider');
        }
        return true;
    } else {
        var values = $slider.slider('values');
        if ($slider.hasClass('current-day')) {
            possibleArr = possibleArr.filter((num) => {
                if (num >= 23 - startHour) return false;
                else return true;
            })
        }
        possibleArr = possibleArr.filter((num) => {
            return values.indexOf(num) == -1;
        });

        let newValue;
        for (let i = 0; i < possibleArr.length; i++) {
            let newV = possibleArr[i];
            let newVs = values.slice();
            newVs.push(newV);
            let test = testBigSliderOverlap({'values': newVs});
            if (test) {
                newValue = newV;
            }
        }
        // console.log('random new value', newValue);
        if (newValue != undefined) {
            values.push(newValue);
            $slider.slider('destroy');
            initSlider($slider, values);
            $slider.find('.ui-slider-handle:last').focus();
            return true;
        } else  {
            if (isFromDrag) {
                return false;
            }
            else {
                let nextSlider = findNextSlider(selector, false);
                if ($('.flex-active-slide .default-wrap > div').index(nextSlider) == -1) {
                    return false;
                } else {addHandle(nextSlider);}

            }
        }
    }
}

export function deleteHandle(handle) {
    // console.log(handle);
    var $slider = handle.parent();
    var handleIndex = $slider.find('.ui-slider-handle').index(handle);
    var values = $slider.slider('values');
    // consol('old values', values);
    // consol(handleIndex);
    values.splice(handleIndex, 1);
    // consol('new values', values);
    $slider.slider('destroy');
    initSlider($slider, values);
}

export function setWeekText(slideIndex) {
    let startM = startMoment.clone();
    let m = slideIndex ? startM.add(slideIndex, 'w') : startM;
    let monday = m.isoWeekday(1).format('DD');
    let sunday = m.isoWeekday(7).format('DD');
    let thisMonth = m.format('MM');
    $('.item-week').html('Week ' + monday + '-' + sunday + '.' + thisMonth);
}


export function calculateAllHandles() {
    var calculatedMoments = []; // final array
    console.log('calculating moments...');
    var allFlexSlides = $('.flexslider .slides .item:not(.clone)');
    allFlexSlides.each((i, slide) => {
        let week = startMoment.week() + i;
        var allWeekSliders = $(slide).find('.default-wrap > div');
        allWeekSliders.each((i, slider) => {
            let day = 1 + i;
            if ($(slider).hasClass('active-slider')) {
                let values = $(slider).slider('values');
                let hours = values.map(el => 23 - el);
                hours.forEach(hour => {
                    calculatedMoments.push(
                        moment().year(startMoment.year()).month(startMoment.month())
                            .week(week).day(day).hour(hour).minute(0).second(0)
                    )
                })
            }
        })
    });
    // additional validating, incase handles went to past days/hours
    calculatedMoments = calculatedMoments.filter(mom => {
        let cantGoPast = startMoment.clone().hour(startHour+1).minute(0).second(0);
        return (mom.unix() >= cantGoPast.unix());
    });

    var inConsole = calculatedMoments.map(mom => {
        return mom.format('LLL');
    });

    console.log(inConsole);
    console.log('object returned -> ', calculatedMoments);
}