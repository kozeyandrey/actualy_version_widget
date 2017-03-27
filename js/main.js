(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _weeks = require('./weeks');

$(window).ready(function () {
    var isInitiated = false;
    //  OPEN WIDGET
    {
        var display = void 0;
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
                        after: function after(ctx) {
                            if (ctx.currentSlide == ctx.last) {
                                (0, _weeks.addLastWeekSlide)($('.flexslider'));
                                console.log('last transition ended');
                            }
                        }
                    });
                    // Set Current day slider active, with one value
                    {
                        var day = moment().isoWeekday();
                        var activeElem = void 0;
                        switch (day) {
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
                        var firstSlider = $('.flex-active-slide').find(activeElem);
                        var allFirstWeekSliders = $('.flex-active-slide .default-wrap > div');
                        // console.log(allFirstWeekSliders);
                        var pastDaySliders = allFirstWeekSliders.splice(0, allFirstWeekSliders.index(firstSlider));
                        console.log('pastDaySliders', pastDaySliders);
                        pastDaySliders.forEach(function (el) {
                            // mark past days (cant move/create handles there)
                            console.log('adding past day');
                            $(el).addClass('past-day');
                        });
                        (0, _weeks.initFirstSlider)(firstSlider);
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


    $('.switch-on').click(_weeks.daytimeSliderChanges);
    $('.switch-off').click(_weeks.daytimeSliderChanges);

    // When clicking on the arrows generate week text
    function setWeekText(week) {
        var m = week ? moment().week(week) : moment();
        var monday = m.isoWeekday(1).format('DD');
        var sunday = m.isoWeekday(7).format('DD');
        var thisMonth = m.format('MM');
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
        } else {
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

    $('.add-button').click(function () {
        var allSliders = $('.flex-active-slide .default-wrap > div:not(.past-day)');
        console.log('allSliders', allSliders);
        var firstActiveSlider = allSliders[0];
        (0, _weeks.addHandle)(firstActiveSlider);
    });
    {
        var focusElem = null;
        $('.del-button').mousedown(function () {
            console.log('delete');
            console.log($(':focus'));
            $(':focus').hasClass('ui-slider-handle') ? focusElem = $(':focus') : focusElem = null;
        });
        $('.del-button').click(function () {
            if (focusElem) {
                (0, _weeks.deleteHandle)(focusElem);
            }
        });
    }
});
// TODO prevent moving handles to days and hours past current time
// TODO move white background a bit so it looks better (skype) DONE
// TODO final calculations function (dont forget about 23-value)
// TODO handle custom size???

},{"./weeks":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.initSlider = initSlider;
exports.initFirstSlider = initFirstSlider;
exports.getItems = getItems;
exports.addLastWeekSlide = addLastWeekSlide;
exports.daytimeSliderChanges = daytimeSliderChanges;
exports.addHandle = addHandle;
exports.deleteHandle = deleteHandle;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// helpful functions
Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)];
};
function getAbsoluteRect(elem) {
    var rect = elem.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        bottom: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        right: rect.right + window.scrollX
    };
}

var sliderPopup;
var currentHour; // hour on which widget started, handles cant step on it and past it
$(window).ready(function () {
    $('body').append('<div id="slider-popup"></div>');
    sliderPopup = $('#slider-popup');
    currentHour = moment().hour();
});
var daytime_on = true;

function filterValues(values, daytime_on) {
    if (daytime_on) {
        // console.log('filtering...', values);
        values = values.filter(function (v) {
            if (v <= 14 && v >= 4) {
                return true;
            } else {
                return false;
            }
        });
    }
    // console.log(values);
    return values;
}
function getDefaultValue(daytime_on) {
    var value = 23 - (moment().hour() + 1);
    if (value < 0) value = 0;
    if (daytime_on) {
        if (value < 4) value = 4;else if (value > 14) value = 14;
    }
    // console.log('default', value);
    return value;
}
function initSlider(selector, values) {
    var defaultValue = getDefaultValue(daytime_on);
    values = values ? filterValues(values, daytime_on) : [defaultValue];
    selector.slider({
        orientation: 'vertical',
        min: daytime_on ? 4 : 0,
        max: daytime_on ? 14 : 23,
        values: values,
        step: 1,
        animate: true,
        start: function start(e, ui) {
            var v = 23 - ui.value;
            sliderPopup.text(v);
            sliderPopup.show();
            sliderPopup.css('top', getAbsoluteRect(ui.handle).top - 10);
            sliderPopup.css('left', getAbsoluteRect(ui.handle).left + 30);
        },
        slide: function slide(e, ui) {
            if ($(this).hasClass('current-day')) {
                if (!handleCurrentDay(ui)) return false;
            }
            var thisCoords = getAbsoluteRect(this);
            // only triggering the event if mouse is in a range of the slider
            if (!(e.pageX < thisCoords.right + 10 && e.pageX > thisCoords.left - 10 && e.pageY < thisCoords.bottom + 10 && e.pageY > thisCoords.top - 10)) {
                return false;
            }
            var diffValues = [];
            // prevent handle overlapping
            for (var a = 0; a < ui.values.length; a++) {
                if (diffValues.indexOf(ui.values[a]) > -1) {
                    return false;
                } else {
                    diffValues.push(ui.values[a]);
                }
            }

            var v = 23 - ui.value;
            sliderPopup.text(v);
            sliderPopup.css('top', getAbsoluteRect(ui.handle).top - 10);
            sliderPopup.css('left', getAbsoluteRect(ui.handle).left + 30);
        },
        stop: function stop() {
            sliderPopup.hide();
        }
    });
    console.log('VALUES', values);
    if (values.length == 0) {
        selector.removeClass('active-slider');
    } else {
        selector.addClass('active-slider');
    }
    setDraggables();
}

function initFirstSlider(selector) {
    var defaultValue = getDefaultValue(daytime_on);
    if (defaultValue >= 23 - currentHour) {
        console.log('current day with an exception');
        var nextSlider = findNextSlider(selector, true);
        initSlider($(nextSlider));
    } else {
        initSlider(selector);
    }
    selector.addClass('current-day');
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

function handleCurrentDay(ui) {
    return ui.value < 23 - currentHour;
}
function setDraggables() {
    $('.ui-slider-handle').off('mousedown');
    $('.ui-slider-handle').on('mousedown', function (e) {
        // console.log('mousedown', this);
        var targetHandle = this;
        $(targetHandle).focus(); // fix incorrect focus bug
        console.log(targetHandle);
        var targetSlider = $(this).parent()[0];
        var handleIndex = $(targetSlider).find('.ui-slider-handle').index(targetHandle);
        var sliderIndex = $('.flex-active-slide .scale-item .default-wrap > div').index($(targetSlider));
        var clone = $(this).clone().addClass('handle-clone');
        clone.css('width', '25px').css('height', '9px');
        moveAt(e);
        $('body').append(clone);
        console.log('sliderIndex', sliderIndex);
        function initWrapEvents() {
            $('.flex-active-slide .scale-item .default-wrap').each(function (i, el) {
                if (i !== sliderIndex) {
                    // console.log('attaching event', el);
                    $(el).mouseup(function (e) {
                        var newSlider = $(e.currentTarget).find('div');

                        applyDragAndDrop(e, targetSlider, newSlider, handleIndex);
                    });
                }
            });
        }
        function clearWrapEvents() {
            $('.flex-active-slide .scale-item .default-wrap').off('mouseup');
        }

        initWrapEvents();
        clone.mouseup(function () {
            console.log('clone mouseup', e);
        });

        function moveAt(e) {
            $(targetHandle).focus(); // fix incorrect focus bug
            var thisCoords = getAbsoluteRect(targetSlider);
            if (e.pageX < thisCoords.right + 10 && e.pageX > thisCoords.left - 10 && e.pageY < thisCoords.bottom + 10 && e.pageY > thisCoords.top - 10) {
                clone.css('display', 'none');
            } else {
                clone.css('display', 'initial');
                clone.css('left', e.pageX - clone.width() / 2);
                clone.css('top', e.pageY - clone.height() / 2);
            }
        }
        $('body').mousemove(function (e) {
            // console.log('mousemove');
            moveAt(e);
        });

        $('body').mouseup(function (e) {
            // console.log('mouseup');
            $('body').off('mousemove');
            $('body').off('mouseup');
            clone.remove();
            clearWrapEvents();
        });
    });
}

function applyDragAndDrop(e, targetSlider, newSlider, handleIndex) {
    if (newSlider.hasClass('past-day')) return;
    if (newSlider.hasClass('current-day')) {
        var defaultValue = getDefaultValue(daytime_on);
        if (defaultValue >= 23 - currentHour) {
            return;
        }
    }
    console.log(e);
    var oldSliderValues = $(targetSlider).slider('values');
    oldSliderValues.splice(handleIndex, 1);
    var wasAdded = addHandle(newSlider);
    // if slider actually didnt update (not enough place), do nothing
    if (wasAdded) {
        $(targetSlider).slider('destroy');
        initSlider($(targetSlider), oldSliderValues);
    }
    sliderPopup.hide();
}

function getItems() {
    return $('.flexslider .slides .item:not(.clone)');
}

function addLastWeekSlide(selector) {
    var ctx = selector.data('flexslider');

    var template = $('<li class="item">\n                                <div class="item-week">\n                                </div>\n                                <div class="scale-wrapper">\n                                    <ul class="list-scale-wrap">\n                                        <li class="times-wrap-left">\n                                            <div class="time-min">00</div>\n                                            <div class="time-max">24</div>\n                                        </li>\n                                        <li class="scale-item">\n                                            <div class="day">Mon</div>\n                                            <div class="add-times-left">\n                                                <div class="default-wrap">\n                                                    <div class="default-slider monday"></div>\n                                                </div>\n                                            </div>\n                                        </li>\n                                        <li class="scale-item">\n                                            <div class="day">Tue</div>\n                                            <div class="default-wrap">\n                                                <div class="default-slider  tuesday"></div>\n                                            </div>\n                                        </li>\n                                        <li class="scale-item">\n                                            <div class="day">Wed</div>\n                                            <div class="default-wrap">\n                                                <div class="default-slider wednesday"></div>\n                                            </div>\n                                        </li>\n                                        <li class="scale-item">\n                                            <div class="day">Th</div>\n                                            <div></div>\n                                            <div class="default-wrap">\n                                                <div class="default-slider thursday"></div>\n                                            </div>\n                                        </li>\n                                        <li class="scale-item">\n                                            <div class="day">Fr</div>\n                                            <div class="default-wrap">\n                                                <div class="default-slider  friday"></div>\n                                            </div>\n                                        </li>\n                                        <li class="scale-item">\n                                            <div class="day">Sat</div>\n                                            <div class="default-wrap">\n                                                <div class="default-slider  saturday"></div>\n                                            </div>\n                                        </li>\n                                        <li class="scale-item">\n                                            <div class="day">Sun</div>\n                                            <div class="add-times-right">\n                                                <div class="default-wrap">\n                                                    <div class="default-slider  sunday"></div>\n                                                </div>\n                                            </div>\n                                        </li>\n                                        <li class="times-wrap-right">\n                                            <div class="time-min">00</div>\n                                            <div class="time-max">24</div>\n                                        </li>\n                                    </ul>\n                                </div>\n                            </li>');
    ctx.addSlide(template);
}

function goToNextSlide() {
    $('.flex-next').trigger('click');
}

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

        daytime_on = true;
        $('.default-slider.active-slider').each(function (i, el) {
            var values = $(el).slider('values');
            $(el).slider('destroy');
            initSlider($(el), values);
        });
    }
}

function addHandle(selector) {
    var $slider = $(selector);
    console.log($slider);
    var possibleArr = [];
    // a list of possible handle values which can be added
    if (daytime_on) possibleArr = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];else {
        possibleArr = [].concat(_toConsumableArray(new Array(24).keys()));
    }
    if (!$slider.hasClass('active-slider')) {
        var defaultValue = getDefaultValue(daytime_on);
        if ($slider.hasClass('current-day') && defaultValue >= 23 - currentHour) {
            var nextSlider = findNextSlider(selector, false);
            // if next slider is on another flexSlide
            if ($('.flex-active-slide .default-wrap > div').index(nextSlider) == -1) {
                // console.log('fix!');
                return;
            }
            addHandle(nextSlider);
            $(nextSlider).addClass('active-slider');
        } else {
            initSlider($slider);
            $slider.addClass('active-slider');
        }
    } else {
        var values = $slider.slider('values');
        var possibleNewValue = values[values.length - 1] - 4;
        if (values.indexOf(possibleNewValue) === -1 && possibleArr.indexOf(possibleNewValue) !== -1) {
            values.push(possibleNewValue);
        } else {
            if ($slider.hasClass('current-day')) {
                possibleArr = possibleArr.filter(function (num) {
                    if (num >= 23 - currentHour) return false;else return true;
                });
            }
            possibleArr = possibleArr.filter(function (num) {
                return values.indexOf(num) == -1;
            });
            // console.log('possible random values', possibleArr);
            var newValue = possibleArr.randomElement();
            // console.log('random new value', newValue);
            if (newValue != undefined) {
                values.push(newValue);
            } else {
                // return false if no place to add
                return false;
            }
        }
        $slider.slider('destroy');
        initSlider($slider, values);
    }
    $slider.find('.ui-slider-handle:last').focus();
    return true;
}

function deleteHandle(handle) {
    console.log(handle);
    var $slider = handle.parent();
    var handleIndex = $slider.find('.ui-slider-handle').index(handle);
    var values = $slider.slider('values');
    console.log('old values', values);
    console.log(handleIndex);
    values.splice(handleIndex, 1);
    console.log('new values', values);
    $slider.slider('destroy');
    initSlider($slider, values);
}

},{}]},{},[1]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF93ZWVrcyA9IHJlcXVpcmUoJy4vd2Vla3MnKTtcblxuJCh3aW5kb3cpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaXNJbml0aWF0ZWQgPSBmYWxzZTtcbiAgICAvLyAgT1BFTiBXSURHRVRcbiAgICB7XG4gICAgICAgIHZhciBkaXNwbGF5ID0gdm9pZCAwO1xuICAgICAgICAkKCcub24tYnRuJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib3gnKS5zdHlsZS5kaXNwbGF5O1xuICAgICAgICAgICAgaWYgKGRpc3BsYXkgPT0gJ25vbmUnKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JveCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICBpc0luaXRpYXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICQoJy5mbGV4c2xpZGVyJykuZmxleHNsaWRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246ICdzbGlkZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNob3c6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbE5hdjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sc0NvbnRhaW5lcjogJCgnLmN1c3RvbS1jb250cm9scy1jb250YWluZXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbURpcmVjdGlvbk5hdjogJCgnLmN1c3RvbS1uYXZpZ2F0aW9uIGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleWJvYXJkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkxvb3A6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhZnRlcjogZnVuY3Rpb24gYWZ0ZXIoY3R4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN0eC5jdXJyZW50U2xpZGUgPT0gY3R4Lmxhc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKDAsIF93ZWVrcy5hZGRMYXN0V2Vla1NsaWRlKSgkKCcuZmxleHNsaWRlcicpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xhc3QgdHJhbnNpdGlvbiBlbmRlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCBDdXJyZW50IGRheSBzbGlkZXIgYWN0aXZlLCB3aXRoIG9uZSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF5ID0gbW9tZW50KCkuaXNvV2Vla2RheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFjdGl2ZUVsZW0gPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGRheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlRWxlbSA9ICcubW9uZGF5JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbGVtID0gJy50dWVzZGF5JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbGVtID0gJy53ZWRuZXNkYXknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZUVsZW0gPSAnLnRodXJzZGF5JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbGVtID0gJy5mcmlkYXknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZUVsZW0gPSAnLnNhdHVyZGF5JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbGVtID0gJy5zdW5kYXknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaXJzdFNsaWRlciA9ICQoJy5mbGV4LWFjdGl2ZS1zbGlkZScpLmZpbmQoYWN0aXZlRWxlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWxsRmlyc3RXZWVrU2xpZGVycyA9ICQoJy5mbGV4LWFjdGl2ZS1zbGlkZSAuZGVmYXVsdC13cmFwID4gZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhhbGxGaXJzdFdlZWtTbGlkZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXN0RGF5U2xpZGVycyA9IGFsbEZpcnN0V2Vla1NsaWRlcnMuc3BsaWNlKDAsIGFsbEZpcnN0V2Vla1NsaWRlcnMuaW5kZXgoZmlyc3RTbGlkZXIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwYXN0RGF5U2xpZGVycycsIHBhc3REYXlTbGlkZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhc3REYXlTbGlkZXJzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFyayBwYXN0IGRheXMgKGNhbnQgbW92ZS9jcmVhdGUgaGFuZGxlcyB0aGVyZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYWRkaW5nIHBhc3QgZGF5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChlbCkuYWRkQ2xhc3MoJ3Bhc3QtZGF5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICgwLCBfd2Vla3MuaW5pdEZpcnN0U2xpZGVyKShmaXJzdFNsaWRlcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRpc3BsYXkgPT0gJ2Jsb2NrJykge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib3gnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gQ0xPU0VTIFdJREdFVFxuICAgICQoJy5jbG9zZS1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib3gnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH0pO1xuXG4gICAgLy8gREFZVElNRSBPTkxZIE9GRiBPUiBPTlxuXG5cbiAgICAkKCcuc3dpdGNoLW9uJykuY2xpY2soX3dlZWtzLmRheXRpbWVTbGlkZXJDaGFuZ2VzKTtcbiAgICAkKCcuc3dpdGNoLW9mZicpLmNsaWNrKF93ZWVrcy5kYXl0aW1lU2xpZGVyQ2hhbmdlcyk7XG5cbiAgICAvLyBXaGVuIGNsaWNraW5nIG9uIHRoZSBhcnJvd3MgZ2VuZXJhdGUgd2VlayB0ZXh0XG4gICAgZnVuY3Rpb24gc2V0V2Vla1RleHQod2Vlaykge1xuICAgICAgICB2YXIgbSA9IHdlZWsgPyBtb21lbnQoKS53ZWVrKHdlZWspIDogbW9tZW50KCk7XG4gICAgICAgIHZhciBtb25kYXkgPSBtLmlzb1dlZWtkYXkoMSkuZm9ybWF0KCdERCcpO1xuICAgICAgICB2YXIgc3VuZGF5ID0gbS5pc29XZWVrZGF5KDcpLmZvcm1hdCgnREQnKTtcbiAgICAgICAgdmFyIHRoaXNNb250aCA9IG0uZm9ybWF0KCdNTScpO1xuICAgICAgICAkKCcuaXRlbS13ZWVrJykuaHRtbCgnV2VlayAnICsgbW9uZGF5ICsgJy0nICsgc3VuZGF5ICsgJy4nICsgdGhpc01vbnRoKTtcbiAgICB9XG5cbiAgICB2YXIgdGhpc1dlZWsgPSBtb21lbnQoKS53ZWVrKCk7XG4gICAgdmFyIHdlZWsgPSBtb21lbnQoKS53ZWVrKCk7XG4gICAgc2V0V2Vla1RleHQod2Vlayk7XG4gICAgaWYgKHdlZWsgPT0gdGhpc1dlZWspIHtcbiAgICAgICAgJCgnLmZsZXgtcHJldicpLmhpZGUoKTtcbiAgICAgICAgJCgnLmZsZXgtcHJldi1ibG9jaycpLnNob3coKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAkKCcuZmxleC1wcmV2LWJsb2NrJykuaGlkZSgpO1xuICAgICAgICAkKCcuZmxleC1wcmV2Jykuc2hvdygpO1xuICAgIH1cblxuICAgICQoJy5mbGV4LW5leHQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJy5mbGV4LXByZXYnKS5zaG93KCk7XG4gICAgICAgICQoJy5mbGV4LXByZXYtYmxvY2snKS5oaWRlKCk7XG5cbiAgICAgICAgaWYgKHdlZWsgPT0gdGhpc1dlZWspIHtcbiAgICAgICAgICAgIHdlZWsgPSB0aGlzV2VlayArIDE7XG4gICAgICAgIH0gZWxzZSBpZiAod2VlayA9PSBwcmV2V2Vlaykge1xuICAgICAgICAgICAgd2VlayA9IHByZXZXZWVrICsgMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdlZWsgPSB3ZWVrICsgMTtcbiAgICAgICAgfVxuICAgICAgICBzZXRXZWVrVGV4dCh3ZWVrKTtcbiAgICB9KTtcblxuICAgIHZhciB0aGVXZWVrID0gd2VlaztcbiAgICB2YXIgcHJldldlZWs7XG4gICAgJCgnLmZsZXgtcHJldicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHdlZWsgPT0gdGhpc1dlZWspIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdlZWsgPSB3ZWVrIC0gMTtcbiAgICAgICAgfVxuICAgICAgICB0aGVXZWVrID0gd2VlaztcbiAgICAgICAgaWYgKHRoZVdlZWsgPT0gdGhpc1dlZWspIHtcbiAgICAgICAgICAgICQoJy5mbGV4LXByZXYnKS5oaWRlKCk7XG4gICAgICAgICAgICAkKCcuZmxleC1wcmV2LWJsb2NrJykuc2hvdygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnLmZsZXgtcHJldicpLnNob3coKTtcbiAgICAgICAgICAgICQoJy5mbGV4LXByZXYtYmxvY2snKS5oaWRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRXZWVrVGV4dCh3ZWVrKTtcblxuICAgICAgICBwcmV2V2VlayA9IHdlZWs7XG4gICAgfSk7XG5cbiAgICAvLyBBREQgQU5EIERFTCBCVVRUT05cblxuICAgICQoJy5hZGQtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYWxsU2xpZGVycyA9ICQoJy5mbGV4LWFjdGl2ZS1zbGlkZSAuZGVmYXVsdC13cmFwID4gZGl2Om5vdCgucGFzdC1kYXkpJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdhbGxTbGlkZXJzJywgYWxsU2xpZGVycyk7XG4gICAgICAgIHZhciBmaXJzdEFjdGl2ZVNsaWRlciA9IGFsbFNsaWRlcnNbMF07XG4gICAgICAgICgwLCBfd2Vla3MuYWRkSGFuZGxlKShmaXJzdEFjdGl2ZVNsaWRlcik7XG4gICAgfSk7XG4gICAge1xuICAgICAgICB2YXIgZm9jdXNFbGVtID0gbnVsbDtcbiAgICAgICAgJCgnLmRlbC1idXR0b24nKS5tb3VzZWRvd24oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RlbGV0ZScpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJCgnOmZvY3VzJykpO1xuICAgICAgICAgICAgJCgnOmZvY3VzJykuaGFzQ2xhc3MoJ3VpLXNsaWRlci1oYW5kbGUnKSA/IGZvY3VzRWxlbSA9ICQoJzpmb2N1cycpIDogZm9jdXNFbGVtID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJy5kZWwtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGZvY3VzRWxlbSkge1xuICAgICAgICAgICAgICAgICgwLCBfd2Vla3MuZGVsZXRlSGFuZGxlKShmb2N1c0VsZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcbi8vIFRPRE8gcHJldmVudCBtb3ZpbmcgaGFuZGxlcyB0byBkYXlzIGFuZCBob3VycyBwYXN0IGN1cnJlbnQgdGltZVxuLy8gVE9ETyBtb3ZlIHdoaXRlIGJhY2tncm91bmQgYSBiaXQgc28gaXQgbG9va3MgYmV0dGVyIChza3lwZSkgRE9ORVxuLy8gVE9ETyBmaW5hbCBjYWxjdWxhdGlvbnMgZnVuY3Rpb24gKGRvbnQgZm9yZ2V0IGFib3V0IDIzLXZhbHVlKVxuLy8gVE9ETyBoYW5kbGUgY3VzdG9tIHNpemU/Pz9cblxufSx7XCIuL3dlZWtzXCI6Mn1dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmluaXRTbGlkZXIgPSBpbml0U2xpZGVyO1xuZXhwb3J0cy5pbml0Rmlyc3RTbGlkZXIgPSBpbml0Rmlyc3RTbGlkZXI7XG5leHBvcnRzLmdldEl0ZW1zID0gZ2V0SXRlbXM7XG5leHBvcnRzLmFkZExhc3RXZWVrU2xpZGUgPSBhZGRMYXN0V2Vla1NsaWRlO1xuZXhwb3J0cy5kYXl0aW1lU2xpZGVyQ2hhbmdlcyA9IGRheXRpbWVTbGlkZXJDaGFuZ2VzO1xuZXhwb3J0cy5hZGRIYW5kbGUgPSBhZGRIYW5kbGU7XG5leHBvcnRzLmRlbGV0ZUhhbmRsZSA9IGRlbGV0ZUhhbmRsZTtcblxuZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbi8vIGhlbHBmdWwgZnVuY3Rpb25zXG5BcnJheS5wcm90b3R5cGUucmFuZG9tRWxlbWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLmxlbmd0aCldO1xufTtcbmZ1bmN0aW9uIGdldEFic29sdXRlUmVjdChlbGVtKSB7XG4gICAgdmFyIHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHRvcDogcmVjdC50b3AgKyB3aW5kb3cuc2Nyb2xsWSxcbiAgICAgICAgYm90dG9tOiByZWN0LmJvdHRvbSArIHdpbmRvdy5zY3JvbGxZLFxuICAgICAgICBsZWZ0OiByZWN0LmxlZnQgKyB3aW5kb3cuc2Nyb2xsWCxcbiAgICAgICAgcmlnaHQ6IHJlY3QucmlnaHQgKyB3aW5kb3cuc2Nyb2xsWFxuICAgIH07XG59XG5cbnZhciBzbGlkZXJQb3B1cDtcbnZhciBjdXJyZW50SG91cjsgLy8gaG91ciBvbiB3aGljaCB3aWRnZXQgc3RhcnRlZCwgaGFuZGxlcyBjYW50IHN0ZXAgb24gaXQgYW5kIHBhc3QgaXRcbiQod2luZG93KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgJCgnYm9keScpLmFwcGVuZCgnPGRpdiBpZD1cInNsaWRlci1wb3B1cFwiPjwvZGl2PicpO1xuICAgIHNsaWRlclBvcHVwID0gJCgnI3NsaWRlci1wb3B1cCcpO1xuICAgIGN1cnJlbnRIb3VyID0gbW9tZW50KCkuaG91cigpO1xufSk7XG52YXIgZGF5dGltZV9vbiA9IHRydWU7XG5cbmZ1bmN0aW9uIGZpbHRlclZhbHVlcyh2YWx1ZXMsIGRheXRpbWVfb24pIHtcbiAgICBpZiAoZGF5dGltZV9vbikge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnZmlsdGVyaW5nLi4uJywgdmFsdWVzKTtcbiAgICAgICAgdmFsdWVzID0gdmFsdWVzLmZpbHRlcihmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgaWYgKHYgPD0gMTQgJiYgdiA+PSA0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKHZhbHVlcyk7XG4gICAgcmV0dXJuIHZhbHVlcztcbn1cbmZ1bmN0aW9uIGdldERlZmF1bHRWYWx1ZShkYXl0aW1lX29uKSB7XG4gICAgdmFyIHZhbHVlID0gMjMgLSAobW9tZW50KCkuaG91cigpICsgMSk7XG4gICAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAwO1xuICAgIGlmIChkYXl0aW1lX29uKSB7XG4gICAgICAgIGlmICh2YWx1ZSA8IDQpIHZhbHVlID0gNDtlbHNlIGlmICh2YWx1ZSA+IDE0KSB2YWx1ZSA9IDE0O1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZygnZGVmYXVsdCcsIHZhbHVlKTtcbiAgICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiBpbml0U2xpZGVyKHNlbGVjdG9yLCB2YWx1ZXMpIHtcbiAgICB2YXIgZGVmYXVsdFZhbHVlID0gZ2V0RGVmYXVsdFZhbHVlKGRheXRpbWVfb24pO1xuICAgIHZhbHVlcyA9IHZhbHVlcyA/IGZpbHRlclZhbHVlcyh2YWx1ZXMsIGRheXRpbWVfb24pIDogW2RlZmF1bHRWYWx1ZV07XG4gICAgc2VsZWN0b3Iuc2xpZGVyKHtcbiAgICAgICAgb3JpZW50YXRpb246ICd2ZXJ0aWNhbCcsXG4gICAgICAgIG1pbjogZGF5dGltZV9vbiA/IDQgOiAwLFxuICAgICAgICBtYXg6IGRheXRpbWVfb24gPyAxNCA6IDIzLFxuICAgICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgICAgc3RlcDogMSxcbiAgICAgICAgYW5pbWF0ZTogdHJ1ZSxcbiAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KGUsIHVpKSB7XG4gICAgICAgICAgICB2YXIgdiA9IDIzIC0gdWkudmFsdWU7XG4gICAgICAgICAgICBzbGlkZXJQb3B1cC50ZXh0KHYpO1xuICAgICAgICAgICAgc2xpZGVyUG9wdXAuc2hvdygpO1xuICAgICAgICAgICAgc2xpZGVyUG9wdXAuY3NzKCd0b3AnLCBnZXRBYnNvbHV0ZVJlY3QodWkuaGFuZGxlKS50b3AgLSAxMCk7XG4gICAgICAgICAgICBzbGlkZXJQb3B1cC5jc3MoJ2xlZnQnLCBnZXRBYnNvbHV0ZVJlY3QodWkuaGFuZGxlKS5sZWZ0ICsgMzApO1xuICAgICAgICB9LFxuICAgICAgICBzbGlkZTogZnVuY3Rpb24gc2xpZGUoZSwgdWkpIHtcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdjdXJyZW50LWRheScpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFoYW5kbGVDdXJyZW50RGF5KHVpKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHRoaXNDb29yZHMgPSBnZXRBYnNvbHV0ZVJlY3QodGhpcyk7XG4gICAgICAgICAgICAvLyBvbmx5IHRyaWdnZXJpbmcgdGhlIGV2ZW50IGlmIG1vdXNlIGlzIGluIGEgcmFuZ2Ugb2YgdGhlIHNsaWRlclxuICAgICAgICAgICAgaWYgKCEoZS5wYWdlWCA8IHRoaXNDb29yZHMucmlnaHQgKyAxMCAmJiBlLnBhZ2VYID4gdGhpc0Nvb3Jkcy5sZWZ0IC0gMTAgJiYgZS5wYWdlWSA8IHRoaXNDb29yZHMuYm90dG9tICsgMTAgJiYgZS5wYWdlWSA+IHRoaXNDb29yZHMudG9wIC0gMTApKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRpZmZWYWx1ZXMgPSBbXTtcbiAgICAgICAgICAgIC8vIHByZXZlbnQgaGFuZGxlIG92ZXJsYXBwaW5nXG4gICAgICAgICAgICBmb3IgKHZhciBhID0gMDsgYSA8IHVpLnZhbHVlcy5sZW5ndGg7IGErKykge1xuICAgICAgICAgICAgICAgIGlmIChkaWZmVmFsdWVzLmluZGV4T2YodWkudmFsdWVzW2FdKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkaWZmVmFsdWVzLnB1c2godWkudmFsdWVzW2FdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB2ID0gMjMgLSB1aS52YWx1ZTtcbiAgICAgICAgICAgIHNsaWRlclBvcHVwLnRleHQodik7XG4gICAgICAgICAgICBzbGlkZXJQb3B1cC5jc3MoJ3RvcCcsIGdldEFic29sdXRlUmVjdCh1aS5oYW5kbGUpLnRvcCAtIDEwKTtcbiAgICAgICAgICAgIHNsaWRlclBvcHVwLmNzcygnbGVmdCcsIGdldEFic29sdXRlUmVjdCh1aS5oYW5kbGUpLmxlZnQgKyAzMCk7XG4gICAgICAgIH0sXG4gICAgICAgIHN0b3A6IGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgICAgICBzbGlkZXJQb3B1cC5oaWRlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZygnVkFMVUVTJywgdmFsdWVzKTtcbiAgICBpZiAodmFsdWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCdhY3RpdmUtc2xpZGVyJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZWN0b3IuYWRkQ2xhc3MoJ2FjdGl2ZS1zbGlkZXInKTtcbiAgICB9XG4gICAgc2V0RHJhZ2dhYmxlcygpO1xufVxuXG5mdW5jdGlvbiBpbml0Rmlyc3RTbGlkZXIoc2VsZWN0b3IpIHtcbiAgICB2YXIgZGVmYXVsdFZhbHVlID0gZ2V0RGVmYXVsdFZhbHVlKGRheXRpbWVfb24pO1xuICAgIGlmIChkZWZhdWx0VmFsdWUgPj0gMjMgLSBjdXJyZW50SG91cikge1xuICAgICAgICBjb25zb2xlLmxvZygnY3VycmVudCBkYXkgd2l0aCBhbiBleGNlcHRpb24nKTtcbiAgICAgICAgdmFyIG5leHRTbGlkZXIgPSBmaW5kTmV4dFNsaWRlcihzZWxlY3RvciwgdHJ1ZSk7XG4gICAgICAgIGluaXRTbGlkZXIoJChuZXh0U2xpZGVyKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaW5pdFNsaWRlcihzZWxlY3Rvcik7XG4gICAgfVxuICAgIHNlbGVjdG9yLmFkZENsYXNzKCdjdXJyZW50LWRheScpO1xufVxuXG5mdW5jdGlvbiBmaW5kTmV4dFNsaWRlcihzZWxlY3RvciwgZ290b25leHQpIHtcbiAgICB2YXIgdGhpc1dlZWtTbGlkZXJzID0gJCgnLmZsZXgtYWN0aXZlLXNsaWRlIC5kZWZhdWx0LXdyYXAgPiBkaXYnKTtcbiAgICB2YXIgc2xpZGVySW5kZXggPSB0aGlzV2Vla1NsaWRlcnMuaW5kZXgoc2VsZWN0b3IpO1xuICAgIC8vIGlmIG5vdCBzdW5kYXlcbiAgICB2YXIgbmV4dFNsaWRlcjtcbiAgICBpZiAoc2xpZGVySW5kZXggIT0gNikge1xuICAgICAgICBuZXh0U2xpZGVyID0gdGhpc1dlZWtTbGlkZXJzW3NsaWRlckluZGV4ICsgMV07XG4gICAgfVxuICAgIC8vIGlmIHN1bmRheVxuICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGFjdGl2ZVNsaWRlID0gJCgnLmZsZXgtYWN0aXZlLXNsaWRlJylbMF07XG4gICAgICAgICAgICB2YXIgbmV4dFNsaWRlID0gYWN0aXZlU2xpZGUubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgICAgICAgbmV4dFNsaWRlciA9ICQobmV4dFNsaWRlKS5maW5kKCcubW9uZGF5Jyk7XG4gICAgICAgICAgICBpZiAoZ290b25leHQpIGdvVG9OZXh0U2xpZGUoKTtcbiAgICAgICAgfVxuICAgIHJldHVybiBuZXh0U2xpZGVyO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVDdXJyZW50RGF5KHVpKSB7XG4gICAgcmV0dXJuIHVpLnZhbHVlIDwgMjMgLSBjdXJyZW50SG91cjtcbn1cbmZ1bmN0aW9uIHNldERyYWdnYWJsZXMoKSB7XG4gICAgJCgnLnVpLXNsaWRlci1oYW5kbGUnKS5vZmYoJ21vdXNlZG93bicpO1xuICAgICQoJy51aS1zbGlkZXItaGFuZGxlJykub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb3VzZWRvd24nLCB0aGlzKTtcbiAgICAgICAgdmFyIHRhcmdldEhhbmRsZSA9IHRoaXM7XG4gICAgICAgICQodGFyZ2V0SGFuZGxlKS5mb2N1cygpOyAvLyBmaXggaW5jb3JyZWN0IGZvY3VzIGJ1Z1xuICAgICAgICBjb25zb2xlLmxvZyh0YXJnZXRIYW5kbGUpO1xuICAgICAgICB2YXIgdGFyZ2V0U2xpZGVyID0gJCh0aGlzKS5wYXJlbnQoKVswXTtcbiAgICAgICAgdmFyIGhhbmRsZUluZGV4ID0gJCh0YXJnZXRTbGlkZXIpLmZpbmQoJy51aS1zbGlkZXItaGFuZGxlJykuaW5kZXgodGFyZ2V0SGFuZGxlKTtcbiAgICAgICAgdmFyIHNsaWRlckluZGV4ID0gJCgnLmZsZXgtYWN0aXZlLXNsaWRlIC5zY2FsZS1pdGVtIC5kZWZhdWx0LXdyYXAgPiBkaXYnKS5pbmRleCgkKHRhcmdldFNsaWRlcikpO1xuICAgICAgICB2YXIgY2xvbmUgPSAkKHRoaXMpLmNsb25lKCkuYWRkQ2xhc3MoJ2hhbmRsZS1jbG9uZScpO1xuICAgICAgICBjbG9uZS5jc3MoJ3dpZHRoJywgJzI1cHgnKS5jc3MoJ2hlaWdodCcsICc5cHgnKTtcbiAgICAgICAgbW92ZUF0KGUpO1xuICAgICAgICAkKCdib2R5JykuYXBwZW5kKGNsb25lKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3NsaWRlckluZGV4Jywgc2xpZGVySW5kZXgpO1xuICAgICAgICBmdW5jdGlvbiBpbml0V3JhcEV2ZW50cygpIHtcbiAgICAgICAgICAgICQoJy5mbGV4LWFjdGl2ZS1zbGlkZSAuc2NhbGUtaXRlbSAuZGVmYXVsdC13cmFwJykuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSAhPT0gc2xpZGVySW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2F0dGFjaGluZyBldmVudCcsIGVsKTtcbiAgICAgICAgICAgICAgICAgICAgJChlbCkubW91c2V1cChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1NsaWRlciA9ICQoZS5jdXJyZW50VGFyZ2V0KS5maW5kKCdkaXYnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlEcmFnQW5kRHJvcChlLCB0YXJnZXRTbGlkZXIsIG5ld1NsaWRlciwgaGFuZGxlSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBjbGVhcldyYXBFdmVudHMoKSB7XG4gICAgICAgICAgICAkKCcuZmxleC1hY3RpdmUtc2xpZGUgLnNjYWxlLWl0ZW0gLmRlZmF1bHQtd3JhcCcpLm9mZignbW91c2V1cCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5pdFdyYXBFdmVudHMoKTtcbiAgICAgICAgY2xvbmUubW91c2V1cChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2xvbmUgbW91c2V1cCcsIGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiBtb3ZlQXQoZSkge1xuICAgICAgICAgICAgJCh0YXJnZXRIYW5kbGUpLmZvY3VzKCk7IC8vIGZpeCBpbmNvcnJlY3QgZm9jdXMgYnVnXG4gICAgICAgICAgICB2YXIgdGhpc0Nvb3JkcyA9IGdldEFic29sdXRlUmVjdCh0YXJnZXRTbGlkZXIpO1xuICAgICAgICAgICAgaWYgKGUucGFnZVggPCB0aGlzQ29vcmRzLnJpZ2h0ICsgMTAgJiYgZS5wYWdlWCA+IHRoaXNDb29yZHMubGVmdCAtIDEwICYmIGUucGFnZVkgPCB0aGlzQ29vcmRzLmJvdHRvbSArIDEwICYmIGUucGFnZVkgPiB0aGlzQ29vcmRzLnRvcCAtIDEwKSB7XG4gICAgICAgICAgICAgICAgY2xvbmUuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2xvbmUuY3NzKCdkaXNwbGF5JywgJ2luaXRpYWwnKTtcbiAgICAgICAgICAgICAgICBjbG9uZS5jc3MoJ2xlZnQnLCBlLnBhZ2VYIC0gY2xvbmUud2lkdGgoKSAvIDIpO1xuICAgICAgICAgICAgICAgIGNsb25lLmNzcygndG9wJywgZS5wYWdlWSAtIGNsb25lLmhlaWdodCgpIC8gMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgJCgnYm9keScpLm1vdXNlbW92ZShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ21vdXNlbW92ZScpO1xuICAgICAgICAgICAgbW92ZUF0KGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkKCdib2R5JykubW91c2V1cChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ21vdXNldXAnKTtcbiAgICAgICAgICAgICQoJ2JvZHknKS5vZmYoJ21vdXNlbW92ZScpO1xuICAgICAgICAgICAgJCgnYm9keScpLm9mZignbW91c2V1cCcpO1xuICAgICAgICAgICAgY2xvbmUucmVtb3ZlKCk7XG4gICAgICAgICAgICBjbGVhcldyYXBFdmVudHMoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5RHJhZ0FuZERyb3AoZSwgdGFyZ2V0U2xpZGVyLCBuZXdTbGlkZXIsIGhhbmRsZUluZGV4KSB7XG4gICAgaWYgKG5ld1NsaWRlci5oYXNDbGFzcygncGFzdC1kYXknKSkgcmV0dXJuO1xuICAgIGlmIChuZXdTbGlkZXIuaGFzQ2xhc3MoJ2N1cnJlbnQtZGF5JykpIHtcbiAgICAgICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGdldERlZmF1bHRWYWx1ZShkYXl0aW1lX29uKTtcbiAgICAgICAgaWYgKGRlZmF1bHRWYWx1ZSA+PSAyMyAtIGN1cnJlbnRIb3VyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2coZSk7XG4gICAgdmFyIG9sZFNsaWRlclZhbHVlcyA9ICQodGFyZ2V0U2xpZGVyKS5zbGlkZXIoJ3ZhbHVlcycpO1xuICAgIG9sZFNsaWRlclZhbHVlcy5zcGxpY2UoaGFuZGxlSW5kZXgsIDEpO1xuICAgIHZhciB3YXNBZGRlZCA9IGFkZEhhbmRsZShuZXdTbGlkZXIpO1xuICAgIC8vIGlmIHNsaWRlciBhY3R1YWxseSBkaWRudCB1cGRhdGUgKG5vdCBlbm91Z2ggcGxhY2UpLCBkbyBub3RoaW5nXG4gICAgaWYgKHdhc0FkZGVkKSB7XG4gICAgICAgICQodGFyZ2V0U2xpZGVyKS5zbGlkZXIoJ2Rlc3Ryb3knKTtcbiAgICAgICAgaW5pdFNsaWRlcigkKHRhcmdldFNsaWRlciksIG9sZFNsaWRlclZhbHVlcyk7XG4gICAgfVxuICAgIHNsaWRlclBvcHVwLmhpZGUoKTtcbn1cblxuZnVuY3Rpb24gZ2V0SXRlbXMoKSB7XG4gICAgcmV0dXJuICQoJy5mbGV4c2xpZGVyIC5zbGlkZXMgLml0ZW06bm90KC5jbG9uZSknKTtcbn1cblxuZnVuY3Rpb24gYWRkTGFzdFdlZWtTbGlkZShzZWxlY3Rvcikge1xuICAgIHZhciBjdHggPSBzZWxlY3Rvci5kYXRhKCdmbGV4c2xpZGVyJyk7XG5cbiAgICB2YXIgdGVtcGxhdGUgPSAkKCc8bGkgY2xhc3M9XCJpdGVtXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbS13ZWVrXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzY2FsZS13cmFwcGVyXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwibGlzdC1zY2FsZS13cmFwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInRpbWVzLXdyYXAtbGVmdFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpbWUtbWluXCI+MDA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lLW1heFwiPjI0PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInNjYWxlLWl0ZW1cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXlcIj5Nb248L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZGQtdGltZXMtbGVmdFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXdyYXBcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtc2xpZGVyIG1vbmRheVwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInNjYWxlLWl0ZW1cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXlcIj5UdWU8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXdyYXBcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC1zbGlkZXIgIHR1ZXNkYXlcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJzY2FsZS1pdGVtXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF5XCI+V2VkPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC13cmFwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtc2xpZGVyIHdlZG5lc2RheVwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInNjYWxlLWl0ZW1cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXlcIj5UaDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXdyYXBcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC1zbGlkZXIgdGh1cnNkYXlcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJzY2FsZS1pdGVtXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF5XCI+RnI8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXdyYXBcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC1zbGlkZXIgIGZyaWRheVwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInNjYWxlLWl0ZW1cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXlcIj5TYXQ8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXdyYXBcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC1zbGlkZXIgIHNhdHVyZGF5XCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwic2NhbGUtaXRlbVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRheVwiPlN1bjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFkZC10aW1lcy1yaWdodFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXdyYXBcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtc2xpZGVyICBzdW5kYXlcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJ0aW1lcy13cmFwLXJpZ2h0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGltZS1taW5cIj4wMDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpbWUtbWF4XCI+MjQ8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3VsPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+Jyk7XG4gICAgY3R4LmFkZFNsaWRlKHRlbXBsYXRlKTtcbn1cblxuZnVuY3Rpb24gZ29Ub05leHRTbGlkZSgpIHtcbiAgICAkKCcuZmxleC1uZXh0JykudHJpZ2dlcignY2xpY2snKTtcbn1cblxuZnVuY3Rpb24gZGF5dGltZVNsaWRlckNoYW5nZXMoKSB7XG4gICAgaWYgKGRheXRpbWVfb24pIHtcbiAgICAgICAgJCgnLnN3aXRjaC1vbicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgJCgnLnN3aXRjaC1vZmYnKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5kZWZhdWx0LXdyYXAnKS5hZGRDbGFzcygnc2xpZGUtd3JhcCcpO1xuICAgICAgICAkKCcuZGVmYXVsdC1zbGlkZXInKS5hZGRDbGFzcygnc2xpZGVyJyk7XG4gICAgICAgICQoJy5zbGlkZXInKS5yZW1vdmVDbGFzcygnZGVmYXVsdC1zbGlkZXInKTtcblxuICAgICAgICAkKCcuc2xpZGVyJykuc2xpZGVyKHtcbiAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgIG1heDogMjNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGF5dGltZV9vbiA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoZGF5dGltZV9vbiA9PSBmYWxzZSkge1xuICAgICAgICAkKCcuc3dpdGNoLW9mZicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgJCgnLnN3aXRjaC1vbicpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgJCgnLnNsaWRlLXdyYXAnKS5hZGRDbGFzcygnZGVmYXVsdC13cmFwJyk7XG4gICAgICAgICQoJy5kZWZhdWx0LXdyYXAnKS5yZW1vdmVDbGFzcygnc2xpZGUtd3JhcCcpO1xuICAgICAgICAkKCcuc2xpZGVyJykuYWRkQ2xhc3MoJ2RlZmF1bHQtc2xpZGVyJyk7XG4gICAgICAgICQoJy5kZWZhdWx0LXNsaWRlcicpLnJlbW92ZUNsYXNzKCdzbGlkZXInKTtcblxuICAgICAgICBkYXl0aW1lX29uID0gdHJ1ZTtcbiAgICAgICAgJCgnLmRlZmF1bHQtc2xpZGVyLmFjdGl2ZS1zbGlkZXInKS5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgICAgdmFyIHZhbHVlcyA9ICQoZWwpLnNsaWRlcigndmFsdWVzJyk7XG4gICAgICAgICAgICAkKGVsKS5zbGlkZXIoJ2Rlc3Ryb3knKTtcbiAgICAgICAgICAgIGluaXRTbGlkZXIoJChlbCksIHZhbHVlcyk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gYWRkSGFuZGxlKHNlbGVjdG9yKSB7XG4gICAgdmFyICRzbGlkZXIgPSAkKHNlbGVjdG9yKTtcbiAgICBjb25zb2xlLmxvZygkc2xpZGVyKTtcbiAgICB2YXIgcG9zc2libGVBcnIgPSBbXTtcbiAgICAvLyBhIGxpc3Qgb2YgcG9zc2libGUgaGFuZGxlIHZhbHVlcyB3aGljaCBjYW4gYmUgYWRkZWRcbiAgICBpZiAoZGF5dGltZV9vbikgcG9zc2libGVBcnIgPSBbNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0XTtlbHNlIHtcbiAgICAgICAgcG9zc2libGVBcnIgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KG5ldyBBcnJheSgyNCkua2V5cygpKSk7XG4gICAgfVxuICAgIGlmICghJHNsaWRlci5oYXNDbGFzcygnYWN0aXZlLXNsaWRlcicpKSB7XG4gICAgICAgIHZhciBkZWZhdWx0VmFsdWUgPSBnZXREZWZhdWx0VmFsdWUoZGF5dGltZV9vbik7XG4gICAgICAgIGlmICgkc2xpZGVyLmhhc0NsYXNzKCdjdXJyZW50LWRheScpICYmIGRlZmF1bHRWYWx1ZSA+PSAyMyAtIGN1cnJlbnRIb3VyKSB7XG4gICAgICAgICAgICB2YXIgbmV4dFNsaWRlciA9IGZpbmROZXh0U2xpZGVyKHNlbGVjdG9yLCBmYWxzZSk7XG4gICAgICAgICAgICAvLyBpZiBuZXh0IHNsaWRlciBpcyBvbiBhbm90aGVyIGZsZXhTbGlkZVxuICAgICAgICAgICAgaWYgKCQoJy5mbGV4LWFjdGl2ZS1zbGlkZSAuZGVmYXVsdC13cmFwID4gZGl2JykuaW5kZXgobmV4dFNsaWRlcikgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnZml4IScpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZEhhbmRsZShuZXh0U2xpZGVyKTtcbiAgICAgICAgICAgICQobmV4dFNsaWRlcikuYWRkQ2xhc3MoJ2FjdGl2ZS1zbGlkZXInKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluaXRTbGlkZXIoJHNsaWRlcik7XG4gICAgICAgICAgICAkc2xpZGVyLmFkZENsYXNzKCdhY3RpdmUtc2xpZGVyJyk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdmFsdWVzID0gJHNsaWRlci5zbGlkZXIoJ3ZhbHVlcycpO1xuICAgICAgICB2YXIgcG9zc2libGVOZXdWYWx1ZSA9IHZhbHVlc1t2YWx1ZXMubGVuZ3RoIC0gMV0gLSA0O1xuICAgICAgICBpZiAodmFsdWVzLmluZGV4T2YocG9zc2libGVOZXdWYWx1ZSkgPT09IC0xICYmIHBvc3NpYmxlQXJyLmluZGV4T2YocG9zc2libGVOZXdWYWx1ZSkgIT09IC0xKSB7XG4gICAgICAgICAgICB2YWx1ZXMucHVzaChwb3NzaWJsZU5ld1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICgkc2xpZGVyLmhhc0NsYXNzKCdjdXJyZW50LWRheScpKSB7XG4gICAgICAgICAgICAgICAgcG9zc2libGVBcnIgPSBwb3NzaWJsZUFyci5maWx0ZXIoZnVuY3Rpb24gKG51bSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVtID49IDIzIC0gY3VycmVudEhvdXIpIHJldHVybiBmYWxzZTtlbHNlIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9zc2libGVBcnIgPSBwb3NzaWJsZUFyci5maWx0ZXIoZnVuY3Rpb24gKG51bSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZXMuaW5kZXhPZihudW0pID09IC0xO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncG9zc2libGUgcmFuZG9tIHZhbHVlcycsIHBvc3NpYmxlQXJyKTtcbiAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IHBvc3NpYmxlQXJyLnJhbmRvbUVsZW1lbnQoKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyYW5kb20gbmV3IHZhbHVlJywgbmV3VmFsdWUpO1xuICAgICAgICAgICAgaWYgKG5ld1ZhbHVlICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIGZhbHNlIGlmIG5vIHBsYWNlIHRvIGFkZFxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAkc2xpZGVyLnNsaWRlcignZGVzdHJveScpO1xuICAgICAgICBpbml0U2xpZGVyKCRzbGlkZXIsIHZhbHVlcyk7XG4gICAgfVxuICAgICRzbGlkZXIuZmluZCgnLnVpLXNsaWRlci1oYW5kbGU6bGFzdCcpLmZvY3VzKCk7XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGRlbGV0ZUhhbmRsZShoYW5kbGUpIHtcbiAgICBjb25zb2xlLmxvZyhoYW5kbGUpO1xuICAgIHZhciAkc2xpZGVyID0gaGFuZGxlLnBhcmVudCgpO1xuICAgIHZhciBoYW5kbGVJbmRleCA9ICRzbGlkZXIuZmluZCgnLnVpLXNsaWRlci1oYW5kbGUnKS5pbmRleChoYW5kbGUpO1xuICAgIHZhciB2YWx1ZXMgPSAkc2xpZGVyLnNsaWRlcigndmFsdWVzJyk7XG4gICAgY29uc29sZS5sb2coJ29sZCB2YWx1ZXMnLCB2YWx1ZXMpO1xuICAgIGNvbnNvbGUubG9nKGhhbmRsZUluZGV4KTtcbiAgICB2YWx1ZXMuc3BsaWNlKGhhbmRsZUluZGV4LCAxKTtcbiAgICBjb25zb2xlLmxvZygnbmV3IHZhbHVlcycsIHZhbHVlcyk7XG4gICAgJHNsaWRlci5zbGlkZXIoJ2Rlc3Ryb3knKTtcbiAgICBpbml0U2xpZGVyKCRzbGlkZXIsIHZhbHVlcyk7XG59XG5cbn0se31dfSx7fSxbMV0pO1xuIl0sImZpbGUiOiJtYWluLmpzIn0=
