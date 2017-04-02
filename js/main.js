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
                        (0, _weeks.initFirstSlider)(firstSlider);

                        var allFirstWeekSliders = $('.flex-active-slide .default-wrap > div');
                        // console.log(allFirstWeekSliders);
                        var pastDaySliders = allFirstWeekSliders.splice(0, allFirstWeekSliders.index(firstSlider));
                        pastDaySliders.forEach(function (el) {
                            // mark past days (cant move/create handles there)
                            $(el).addClass('past-day');
                        });
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
        var thisWeekSliders = $('.flex-active-slide .default-wrap > div');
        var sliderIndex = thisWeekSliders.index(selector);
        var nextSlider = thisWeekSliders[sliderIndex + 1];
        console.log($(nextSlider).hasClass('active-slider'));
        initSlider($(nextSlider));
    } else {
        initSlider(selector);
    }
    selector.addClass('current-day');
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
            var thisWeekSliders = $('.flex-active-slide .default-wrap > div');
            var sliderIndex = thisWeekSliders.index(selector);
            var nextSlider = thisWeekSliders[sliderIndex + 1];
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF93ZWVrcyA9IHJlcXVpcmUoJy4vd2Vla3MnKTtcblxuJCh3aW5kb3cpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaXNJbml0aWF0ZWQgPSBmYWxzZTtcbiAgICAvLyAgT1BFTiBXSURHRVRcbiAgICB7XG4gICAgICAgIHZhciBkaXNwbGF5ID0gdm9pZCAwO1xuICAgICAgICAkKCcub24tYnRuJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib3gnKS5zdHlsZS5kaXNwbGF5O1xuICAgICAgICAgICAgaWYgKGRpc3BsYXkgPT0gJ25vbmUnKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JveCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICBpc0luaXRpYXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICQoJy5mbGV4c2xpZGVyJykuZmxleHNsaWRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246ICdzbGlkZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNob3c6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbE5hdjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sc0NvbnRhaW5lcjogJCgnLmN1c3RvbS1jb250cm9scy1jb250YWluZXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbURpcmVjdGlvbk5hdjogJCgnLmN1c3RvbS1uYXZpZ2F0aW9uIGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleWJvYXJkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkxvb3A6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhZnRlcjogZnVuY3Rpb24gYWZ0ZXIoY3R4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN0eC5jdXJyZW50U2xpZGUgPT0gY3R4Lmxhc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKDAsIF93ZWVrcy5hZGRMYXN0V2Vla1NsaWRlKSgkKCcuZmxleHNsaWRlcicpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xhc3QgdHJhbnNpdGlvbiBlbmRlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCBDdXJyZW50IGRheSBzbGlkZXIgYWN0aXZlLCB3aXRoIG9uZSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF5ID0gbW9tZW50KCkuaXNvV2Vla2RheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFjdGl2ZUVsZW0gPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGRheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlRWxlbSA9ICcubW9uZGF5JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbGVtID0gJy50dWVzZGF5JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbGVtID0gJy53ZWRuZXNkYXknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZUVsZW0gPSAnLnRodXJzZGF5JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbGVtID0gJy5mcmlkYXknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZUVsZW0gPSAnLnNhdHVyZGF5JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbGVtID0gJy5zdW5kYXknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaXJzdFNsaWRlciA9ICQoJy5mbGV4LWFjdGl2ZS1zbGlkZScpLmZpbmQoYWN0aXZlRWxlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAoMCwgX3dlZWtzLmluaXRGaXJzdFNsaWRlcikoZmlyc3RTbGlkZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWxsRmlyc3RXZWVrU2xpZGVycyA9ICQoJy5mbGV4LWFjdGl2ZS1zbGlkZSAuZGVmYXVsdC13cmFwID4gZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhhbGxGaXJzdFdlZWtTbGlkZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXN0RGF5U2xpZGVycyA9IGFsbEZpcnN0V2Vla1NsaWRlcnMuc3BsaWNlKDAsIGFsbEZpcnN0V2Vla1NsaWRlcnMuaW5kZXgoZmlyc3RTbGlkZXIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhc3REYXlTbGlkZXJzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFyayBwYXN0IGRheXMgKGNhbnQgbW92ZS9jcmVhdGUgaGFuZGxlcyB0aGVyZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGVsKS5hZGRDbGFzcygncGFzdC1kYXknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChkaXNwbGF5ID09ICdibG9jaycpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm94Jykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIENMT1NFUyBXSURHRVRcbiAgICAkKCcuY2xvc2UtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm94Jykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9KTtcblxuICAgIC8vIERBWVRJTUUgT05MWSBPRkYgT1IgT05cblxuXG4gICAgJCgnLnN3aXRjaC1vbicpLmNsaWNrKF93ZWVrcy5kYXl0aW1lU2xpZGVyQ2hhbmdlcyk7XG4gICAgJCgnLnN3aXRjaC1vZmYnKS5jbGljayhfd2Vla3MuZGF5dGltZVNsaWRlckNoYW5nZXMpO1xuXG4gICAgLy8gV2hlbiBjbGlja2luZyBvbiB0aGUgYXJyb3dzIGdlbmVyYXRlIHdlZWsgdGV4dFxuICAgIGZ1bmN0aW9uIHNldFdlZWtUZXh0KHdlZWspIHtcbiAgICAgICAgdmFyIG0gPSB3ZWVrID8gbW9tZW50KCkud2Vlayh3ZWVrKSA6IG1vbWVudCgpO1xuICAgICAgICB2YXIgbW9uZGF5ID0gbS5pc29XZWVrZGF5KDEpLmZvcm1hdCgnREQnKTtcbiAgICAgICAgdmFyIHN1bmRheSA9IG0uaXNvV2Vla2RheSg3KS5mb3JtYXQoJ0REJyk7XG4gICAgICAgIHZhciB0aGlzTW9udGggPSBtLmZvcm1hdCgnTU0nKTtcbiAgICAgICAgJCgnLml0ZW0td2VlaycpLmh0bWwoJ1dlZWsgJyArIG1vbmRheSArICctJyArIHN1bmRheSArICcuJyArIHRoaXNNb250aCk7XG4gICAgfVxuXG4gICAgdmFyIHRoaXNXZWVrID0gbW9tZW50KCkud2VlaygpO1xuICAgIHZhciB3ZWVrID0gbW9tZW50KCkud2VlaygpO1xuICAgIHNldFdlZWtUZXh0KHdlZWspO1xuICAgIGlmICh3ZWVrID09IHRoaXNXZWVrKSB7XG4gICAgICAgICQoJy5mbGV4LXByZXYnKS5oaWRlKCk7XG4gICAgICAgICQoJy5mbGV4LXByZXYtYmxvY2snKS5zaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJCgnLmZsZXgtcHJldi1ibG9jaycpLmhpZGUoKTtcbiAgICAgICAgJCgnLmZsZXgtcHJldicpLnNob3coKTtcbiAgICB9XG5cbiAgICAkKCcuZmxleC1uZXh0JykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCcuZmxleC1wcmV2Jykuc2hvdygpO1xuICAgICAgICAkKCcuZmxleC1wcmV2LWJsb2NrJykuaGlkZSgpO1xuXG4gICAgICAgIGlmICh3ZWVrID09IHRoaXNXZWVrKSB7XG4gICAgICAgICAgICB3ZWVrID0gdGhpc1dlZWsgKyAxO1xuICAgICAgICB9IGVsc2UgaWYgKHdlZWsgPT0gcHJldldlZWspIHtcbiAgICAgICAgICAgIHdlZWsgPSBwcmV2V2VlayArIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3ZWVrID0gd2VlayArIDE7XG4gICAgICAgIH1cbiAgICAgICAgc2V0V2Vla1RleHQod2Vlayk7XG4gICAgfSk7XG5cbiAgICB2YXIgdGhlV2VlayA9IHdlZWs7XG4gICAgdmFyIHByZXZXZWVrO1xuICAgICQoJy5mbGV4LXByZXYnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh3ZWVrID09IHRoaXNXZWVrKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3ZWVrID0gd2VlayAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgdGhlV2VlayA9IHdlZWs7XG4gICAgICAgIGlmICh0aGVXZWVrID09IHRoaXNXZWVrKSB7XG4gICAgICAgICAgICAkKCcuZmxleC1wcmV2JykuaGlkZSgpO1xuICAgICAgICAgICAgJCgnLmZsZXgtcHJldi1ibG9jaycpLnNob3coKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoJy5mbGV4LXByZXYnKS5zaG93KCk7XG4gICAgICAgICAgICAkKCcuZmxleC1wcmV2LWJsb2NrJykuaGlkZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0V2Vla1RleHQod2Vlayk7XG5cbiAgICAgICAgcHJldldlZWsgPSB3ZWVrO1xuICAgIH0pO1xuXG4gICAgLy8gQUREIEFORCBERUwgQlVUVE9OXG5cbiAgICAkKCcuYWRkLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFsbFNsaWRlcnMgPSAkKCcuZmxleC1hY3RpdmUtc2xpZGUgLmRlZmF1bHQtd3JhcCA+IGRpdjpub3QoLnBhc3QtZGF5KScpO1xuICAgICAgICBjb25zb2xlLmxvZygnYWxsU2xpZGVycycsIGFsbFNsaWRlcnMpO1xuICAgICAgICB2YXIgZmlyc3RBY3RpdmVTbGlkZXIgPSBhbGxTbGlkZXJzWzBdO1xuICAgICAgICAoMCwgX3dlZWtzLmFkZEhhbmRsZSkoZmlyc3RBY3RpdmVTbGlkZXIpO1xuICAgIH0pO1xuICAgIHtcbiAgICAgICAgdmFyIGZvY3VzRWxlbSA9IG51bGw7XG4gICAgICAgICQoJy5kZWwtYnV0dG9uJykubW91c2Vkb3duKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZWxldGUnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCQoJzpmb2N1cycpKTtcbiAgICAgICAgICAgICQoJzpmb2N1cycpLmhhc0NsYXNzKCd1aS1zbGlkZXItaGFuZGxlJykgPyBmb2N1c0VsZW0gPSAkKCc6Zm9jdXMnKSA6IGZvY3VzRWxlbSA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCcuZGVsLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChmb2N1c0VsZW0pIHtcbiAgICAgICAgICAgICAgICAoMCwgX3dlZWtzLmRlbGV0ZUhhbmRsZSkoZm9jdXNFbGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG4vLyBUT0RPIHByZXZlbnQgbW92aW5nIGhhbmRsZXMgdG8gZGF5cyBhbmQgaG91cnMgcGFzdCBjdXJyZW50IHRpbWVcbi8vIFRPRE8gbW92ZSB3aGl0ZSBiYWNrZ3JvdW5kIGEgYml0IHNvIGl0IGxvb2tzIGJldHRlciAoc2t5cGUpIERPTkVcbi8vIFRPRE8gZmluYWwgY2FsY3VsYXRpb25zIGZ1bmN0aW9uIChkb250IGZvcmdldCBhYm91dCAyMy12YWx1ZSlcbi8vIFRPRE8gaGFuZGxlIGN1c3RvbSBzaXplPz8/XG5cbn0se1wiLi93ZWVrc1wiOjJ9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5pbml0U2xpZGVyID0gaW5pdFNsaWRlcjtcbmV4cG9ydHMuaW5pdEZpcnN0U2xpZGVyID0gaW5pdEZpcnN0U2xpZGVyO1xuZXhwb3J0cy5nZXRJdGVtcyA9IGdldEl0ZW1zO1xuZXhwb3J0cy5hZGRMYXN0V2Vla1NsaWRlID0gYWRkTGFzdFdlZWtTbGlkZTtcbmV4cG9ydHMuZGF5dGltZVNsaWRlckNoYW5nZXMgPSBkYXl0aW1lU2xpZGVyQ2hhbmdlcztcbmV4cG9ydHMuYWRkSGFuZGxlID0gYWRkSGFuZGxlO1xuZXhwb3J0cy5kZWxldGVIYW5kbGUgPSBkZWxldGVIYW5kbGU7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG4vLyBoZWxwZnVsIGZ1bmN0aW9uc1xuQXJyYXkucHJvdG90eXBlLnJhbmRvbUVsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5sZW5ndGgpXTtcbn07XG5mdW5jdGlvbiBnZXRBYnNvbHV0ZVJlY3QoZWxlbSkge1xuICAgIHZhciByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4ge1xuICAgICAgICB0b3A6IHJlY3QudG9wICsgd2luZG93LnNjcm9sbFksXG4gICAgICAgIGJvdHRvbTogcmVjdC5ib3R0b20gKyB3aW5kb3cuc2Nyb2xsWSxcbiAgICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgd2luZG93LnNjcm9sbFgsXG4gICAgICAgIHJpZ2h0OiByZWN0LnJpZ2h0ICsgd2luZG93LnNjcm9sbFhcbiAgICB9O1xufVxuXG52YXIgc2xpZGVyUG9wdXA7XG52YXIgY3VycmVudEhvdXI7IC8vIGhvdXIgb24gd2hpY2ggd2lkZ2V0IHN0YXJ0ZWQsIGhhbmRsZXMgY2FudCBzdGVwIG9uIGl0IGFuZCBwYXN0IGl0XG4kKHdpbmRvdykucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgICQoJ2JvZHknKS5hcHBlbmQoJzxkaXYgaWQ9XCJzbGlkZXItcG9wdXBcIj48L2Rpdj4nKTtcbiAgICBzbGlkZXJQb3B1cCA9ICQoJyNzbGlkZXItcG9wdXAnKTtcbiAgICBjdXJyZW50SG91ciA9IG1vbWVudCgpLmhvdXIoKTtcbn0pO1xudmFyIGRheXRpbWVfb24gPSB0cnVlO1xuXG5mdW5jdGlvbiBmaWx0ZXJWYWx1ZXModmFsdWVzLCBkYXl0aW1lX29uKSB7XG4gICAgaWYgKGRheXRpbWVfb24pIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2ZpbHRlcmluZy4uLicsIHZhbHVlcyk7XG4gICAgICAgIHZhbHVlcyA9IHZhbHVlcy5maWx0ZXIoZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIGlmICh2IDw9IDE0ICYmIHYgPj0gNCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyh2YWx1ZXMpO1xuICAgIHJldHVybiB2YWx1ZXM7XG59XG5mdW5jdGlvbiBnZXREZWZhdWx0VmFsdWUoZGF5dGltZV9vbikge1xuICAgIHZhciB2YWx1ZSA9IDIzIC0gKG1vbWVudCgpLmhvdXIoKSArIDEpO1xuICAgIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMDtcbiAgICBpZiAoZGF5dGltZV9vbikge1xuICAgICAgICBpZiAodmFsdWUgPCA0KSB2YWx1ZSA9IDQ7ZWxzZSBpZiAodmFsdWUgPiAxNCkgdmFsdWUgPSAxNDtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coJ2RlZmF1bHQnLCB2YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gaW5pdFNsaWRlcihzZWxlY3RvciwgdmFsdWVzKSB7XG4gICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGdldERlZmF1bHRWYWx1ZShkYXl0aW1lX29uKTtcbiAgICB2YWx1ZXMgPSB2YWx1ZXMgPyBmaWx0ZXJWYWx1ZXModmFsdWVzLCBkYXl0aW1lX29uKSA6IFtkZWZhdWx0VmFsdWVdO1xuICAgIHNlbGVjdG9yLnNsaWRlcih7XG4gICAgICAgIG9yaWVudGF0aW9uOiAndmVydGljYWwnLFxuICAgICAgICBtaW46IGRheXRpbWVfb24gPyA0IDogMCxcbiAgICAgICAgbWF4OiBkYXl0aW1lX29uID8gMTQgOiAyMyxcbiAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgIHN0ZXA6IDEsXG4gICAgICAgIGFuaW1hdGU6IHRydWUsXG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbiBzdGFydChlLCB1aSkge1xuICAgICAgICAgICAgdmFyIHYgPSAyMyAtIHVpLnZhbHVlO1xuICAgICAgICAgICAgc2xpZGVyUG9wdXAudGV4dCh2KTtcbiAgICAgICAgICAgIHNsaWRlclBvcHVwLnNob3coKTtcbiAgICAgICAgICAgIHNsaWRlclBvcHVwLmNzcygndG9wJywgZ2V0QWJzb2x1dGVSZWN0KHVpLmhhbmRsZSkudG9wIC0gMTApO1xuICAgICAgICAgICAgc2xpZGVyUG9wdXAuY3NzKCdsZWZ0JywgZ2V0QWJzb2x1dGVSZWN0KHVpLmhhbmRsZSkubGVmdCArIDMwKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2xpZGU6IGZ1bmN0aW9uIHNsaWRlKGUsIHVpKSB7XG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY3VycmVudC1kYXknKSkge1xuICAgICAgICAgICAgICAgIGlmICghaGFuZGxlQ3VycmVudERheSh1aSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0aGlzQ29vcmRzID0gZ2V0QWJzb2x1dGVSZWN0KHRoaXMpO1xuICAgICAgICAgICAgLy8gb25seSB0cmlnZ2VyaW5nIHRoZSBldmVudCBpZiBtb3VzZSBpcyBpbiBhIHJhbmdlIG9mIHRoZSBzbGlkZXJcbiAgICAgICAgICAgIGlmICghKGUucGFnZVggPCB0aGlzQ29vcmRzLnJpZ2h0ICsgMTAgJiYgZS5wYWdlWCA+IHRoaXNDb29yZHMubGVmdCAtIDEwICYmIGUucGFnZVkgPCB0aGlzQ29vcmRzLmJvdHRvbSArIDEwICYmIGUucGFnZVkgPiB0aGlzQ29vcmRzLnRvcCAtIDEwKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkaWZmVmFsdWVzID0gW107XG4gICAgICAgICAgICAvLyBwcmV2ZW50IGhhbmRsZSBvdmVybGFwcGluZ1xuICAgICAgICAgICAgZm9yICh2YXIgYSA9IDA7IGEgPCB1aS52YWx1ZXMubGVuZ3RoOyBhKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZGlmZlZhbHVlcy5pbmRleE9mKHVpLnZhbHVlc1thXSkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGlmZlZhbHVlcy5wdXNoKHVpLnZhbHVlc1thXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdiA9IDIzIC0gdWkudmFsdWU7XG4gICAgICAgICAgICBzbGlkZXJQb3B1cC50ZXh0KHYpO1xuICAgICAgICAgICAgc2xpZGVyUG9wdXAuY3NzKCd0b3AnLCBnZXRBYnNvbHV0ZVJlY3QodWkuaGFuZGxlKS50b3AgLSAxMCk7XG4gICAgICAgICAgICBzbGlkZXJQb3B1cC5jc3MoJ2xlZnQnLCBnZXRBYnNvbHV0ZVJlY3QodWkuaGFuZGxlKS5sZWZ0ICsgMzApO1xuICAgICAgICB9LFxuICAgICAgICBzdG9wOiBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgICAgICAgc2xpZGVyUG9wdXAuaGlkZSgpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coJ1ZBTFVFUycsIHZhbHVlcyk7XG4gICAgaWYgKHZhbHVlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBzZWxlY3Rvci5yZW1vdmVDbGFzcygnYWN0aXZlLXNsaWRlcicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCdhY3RpdmUtc2xpZGVyJyk7XG4gICAgfVxuICAgIHNldERyYWdnYWJsZXMoKTtcbn1cblxuZnVuY3Rpb24gaW5pdEZpcnN0U2xpZGVyKHNlbGVjdG9yKSB7XG4gICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGdldERlZmF1bHRWYWx1ZShkYXl0aW1lX29uKTtcbiAgICBpZiAoZGVmYXVsdFZhbHVlID49IDIzIC0gY3VycmVudEhvdXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2N1cnJlbnQgZGF5IHdpdGggYW4gZXhjZXB0aW9uJyk7XG4gICAgICAgIHZhciB0aGlzV2Vla1NsaWRlcnMgPSAkKCcuZmxleC1hY3RpdmUtc2xpZGUgLmRlZmF1bHQtd3JhcCA+IGRpdicpO1xuICAgICAgICB2YXIgc2xpZGVySW5kZXggPSB0aGlzV2Vla1NsaWRlcnMuaW5kZXgoc2VsZWN0b3IpO1xuICAgICAgICB2YXIgbmV4dFNsaWRlciA9IHRoaXNXZWVrU2xpZGVyc1tzbGlkZXJJbmRleCArIDFdO1xuICAgICAgICBjb25zb2xlLmxvZygkKG5leHRTbGlkZXIpLmhhc0NsYXNzKCdhY3RpdmUtc2xpZGVyJykpO1xuICAgICAgICBpbml0U2xpZGVyKCQobmV4dFNsaWRlcikpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGluaXRTbGlkZXIoc2VsZWN0b3IpO1xuICAgIH1cbiAgICBzZWxlY3Rvci5hZGRDbGFzcygnY3VycmVudC1kYXknKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlQ3VycmVudERheSh1aSkge1xuICAgIHJldHVybiB1aS52YWx1ZSA8IDIzIC0gY3VycmVudEhvdXI7XG59XG5mdW5jdGlvbiBzZXREcmFnZ2FibGVzKCkge1xuICAgICQoJy51aS1zbGlkZXItaGFuZGxlJykub2ZmKCdtb3VzZWRvd24nKTtcbiAgICAkKCcudWktc2xpZGVyLWhhbmRsZScpLm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnbW91c2Vkb3duJywgdGhpcyk7XG4gICAgICAgIHZhciB0YXJnZXRIYW5kbGUgPSB0aGlzO1xuICAgICAgICAkKHRhcmdldEhhbmRsZSkuZm9jdXMoKTsgLy8gZml4IGluY29ycmVjdCBmb2N1cyBidWdcbiAgICAgICAgY29uc29sZS5sb2codGFyZ2V0SGFuZGxlKTtcbiAgICAgICAgdmFyIHRhcmdldFNsaWRlciA9ICQodGhpcykucGFyZW50KClbMF07XG4gICAgICAgIHZhciBoYW5kbGVJbmRleCA9ICQodGFyZ2V0U2xpZGVyKS5maW5kKCcudWktc2xpZGVyLWhhbmRsZScpLmluZGV4KHRhcmdldEhhbmRsZSk7XG4gICAgICAgIHZhciBzbGlkZXJJbmRleCA9ICQoJy5mbGV4LWFjdGl2ZS1zbGlkZSAuc2NhbGUtaXRlbSAuZGVmYXVsdC13cmFwID4gZGl2JykuaW5kZXgoJCh0YXJnZXRTbGlkZXIpKTtcbiAgICAgICAgdmFyIGNsb25lID0gJCh0aGlzKS5jbG9uZSgpLmFkZENsYXNzKCdoYW5kbGUtY2xvbmUnKTtcbiAgICAgICAgY2xvbmUuY3NzKCd3aWR0aCcsICcyNXB4JykuY3NzKCdoZWlnaHQnLCAnOXB4Jyk7XG4gICAgICAgIG1vdmVBdChlKTtcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZChjbG9uZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzbGlkZXJJbmRleCcsIHNsaWRlckluZGV4KTtcbiAgICAgICAgZnVuY3Rpb24gaW5pdFdyYXBFdmVudHMoKSB7XG4gICAgICAgICAgICAkKCcuZmxleC1hY3RpdmUtc2xpZGUgLnNjYWxlLWl0ZW0gLmRlZmF1bHQtd3JhcCcpLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgIT09IHNsaWRlckluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdhdHRhY2hpbmcgZXZlbnQnLCBlbCk7XG4gICAgICAgICAgICAgICAgICAgICQoZWwpLm1vdXNldXAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdTbGlkZXIgPSAkKGUuY3VycmVudFRhcmdldCkuZmluZCgnZGl2Jyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5RHJhZ0FuZERyb3AoZSwgdGFyZ2V0U2xpZGVyLCBuZXdTbGlkZXIsIGhhbmRsZUluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gY2xlYXJXcmFwRXZlbnRzKCkge1xuICAgICAgICAgICAgJCgnLmZsZXgtYWN0aXZlLXNsaWRlIC5zY2FsZS1pdGVtIC5kZWZhdWx0LXdyYXAnKS5vZmYoJ21vdXNldXAnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGluaXRXcmFwRXZlbnRzKCk7XG4gICAgICAgIGNsb25lLm1vdXNldXAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Nsb25lIG1vdXNldXAnLCBlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gbW92ZUF0KGUpIHtcbiAgICAgICAgICAgICQodGFyZ2V0SGFuZGxlKS5mb2N1cygpOyAvLyBmaXggaW5jb3JyZWN0IGZvY3VzIGJ1Z1xuICAgICAgICAgICAgdmFyIHRoaXNDb29yZHMgPSBnZXRBYnNvbHV0ZVJlY3QodGFyZ2V0U2xpZGVyKTtcbiAgICAgICAgICAgIGlmIChlLnBhZ2VYIDwgdGhpc0Nvb3Jkcy5yaWdodCArIDEwICYmIGUucGFnZVggPiB0aGlzQ29vcmRzLmxlZnQgLSAxMCAmJiBlLnBhZ2VZIDwgdGhpc0Nvb3Jkcy5ib3R0b20gKyAxMCAmJiBlLnBhZ2VZID4gdGhpc0Nvb3Jkcy50b3AgLSAxMCkge1xuICAgICAgICAgICAgICAgIGNsb25lLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNsb25lLmNzcygnZGlzcGxheScsICdpbml0aWFsJyk7XG4gICAgICAgICAgICAgICAgY2xvbmUuY3NzKCdsZWZ0JywgZS5wYWdlWCAtIGNsb25lLndpZHRoKCkgLyAyKTtcbiAgICAgICAgICAgICAgICBjbG9uZS5jc3MoJ3RvcCcsIGUucGFnZVkgLSBjbG9uZS5oZWlnaHQoKSAvIDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgICQoJ2JvZHknKS5tb3VzZW1vdmUoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb3VzZW1vdmUnKTtcbiAgICAgICAgICAgIG1vdmVBdChlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnYm9keScpLm1vdXNldXAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb3VzZXVwJyk7XG4gICAgICAgICAgICAkKCdib2R5Jykub2ZmKCdtb3VzZW1vdmUnKTtcbiAgICAgICAgICAgICQoJ2JvZHknKS5vZmYoJ21vdXNldXAnKTtcbiAgICAgICAgICAgIGNsb25lLnJlbW92ZSgpO1xuICAgICAgICAgICAgY2xlYXJXcmFwRXZlbnRzKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBhcHBseURyYWdBbmREcm9wKGUsIHRhcmdldFNsaWRlciwgbmV3U2xpZGVyLCBoYW5kbGVJbmRleCkge1xuICAgIGlmIChuZXdTbGlkZXIuaGFzQ2xhc3MoJ3Bhc3QtZGF5JykpIHJldHVybjtcbiAgICBpZiAobmV3U2xpZGVyLmhhc0NsYXNzKCdjdXJyZW50LWRheScpKSB7XG4gICAgICAgIHZhciBkZWZhdWx0VmFsdWUgPSBnZXREZWZhdWx0VmFsdWUoZGF5dGltZV9vbik7XG4gICAgICAgIGlmIChkZWZhdWx0VmFsdWUgPj0gMjMgLSBjdXJyZW50SG91cikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKGUpO1xuICAgIHZhciBvbGRTbGlkZXJWYWx1ZXMgPSAkKHRhcmdldFNsaWRlcikuc2xpZGVyKCd2YWx1ZXMnKTtcbiAgICBvbGRTbGlkZXJWYWx1ZXMuc3BsaWNlKGhhbmRsZUluZGV4LCAxKTtcbiAgICB2YXIgd2FzQWRkZWQgPSBhZGRIYW5kbGUobmV3U2xpZGVyKTtcbiAgICAvLyBpZiBzbGlkZXIgYWN0dWFsbHkgZGlkbnQgdXBkYXRlIChub3QgZW5vdWdoIHBsYWNlKSwgZG8gbm90aGluZ1xuICAgIGlmICh3YXNBZGRlZCkge1xuICAgICAgICAkKHRhcmdldFNsaWRlcikuc2xpZGVyKCdkZXN0cm95Jyk7XG4gICAgICAgIGluaXRTbGlkZXIoJCh0YXJnZXRTbGlkZXIpLCBvbGRTbGlkZXJWYWx1ZXMpO1xuICAgIH1cbiAgICBzbGlkZXJQb3B1cC5oaWRlKCk7XG59XG5cbmZ1bmN0aW9uIGdldEl0ZW1zKCkge1xuICAgIHJldHVybiAkKCcuZmxleHNsaWRlciAuc2xpZGVzIC5pdGVtOm5vdCguY2xvbmUpJyk7XG59XG5cbmZ1bmN0aW9uIGFkZExhc3RXZWVrU2xpZGUoc2VsZWN0b3IpIHtcbiAgICB2YXIgY3R4ID0gc2VsZWN0b3IuZGF0YSgnZmxleHNsaWRlcicpO1xuXG4gICAgdmFyIHRlbXBsYXRlID0gJCgnPGxpIGNsYXNzPVwiaXRlbVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIml0ZW0td2Vla1wiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2NhbGUtd3JhcHBlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cImxpc3Qtc2NhbGUtd3JhcFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJ0aW1lcy13cmFwLWxlZnRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lLW1pblwiPjAwPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGltZS1tYXhcIj4yNDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJzY2FsZS1pdGVtXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF5XCI+TW9uPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkLXRpbWVzLWxlZnRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC13cmFwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXNsaWRlciBtb25kYXlcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJzY2FsZS1pdGVtXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF5XCI+VHVlPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC13cmFwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtc2xpZGVyICB0dWVzZGF5XCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwic2NhbGUtaXRlbVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRheVwiPldlZDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtd3JhcFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXNsaWRlciB3ZWRuZXNkYXlcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJzY2FsZS1pdGVtXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF5XCI+VGg8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC13cmFwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtc2xpZGVyIHRodXJzZGF5XCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwic2NhbGUtaXRlbVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRheVwiPkZyPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC13cmFwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtc2xpZGVyICBmcmlkYXlcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJzY2FsZS1pdGVtXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF5XCI+U2F0PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC13cmFwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtc2xpZGVyICBzYXR1cmRheVwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInNjYWxlLWl0ZW1cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXlcIj5TdW48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZGQtdGltZXMtcmlnaHRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC13cmFwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXNsaWRlciAgc3VuZGF5XCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwidGltZXMtd3JhcC1yaWdodFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpbWUtbWluXCI+MDA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lLW1heFwiPjI0PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC91bD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPicpO1xuICAgIGN0eC5hZGRTbGlkZSh0ZW1wbGF0ZSk7XG59XG5cbmZ1bmN0aW9uIGRheXRpbWVTbGlkZXJDaGFuZ2VzKCkge1xuICAgIGlmIChkYXl0aW1lX29uKSB7XG4gICAgICAgICQoJy5zd2l0Y2gtb24nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5zd2l0Y2gtb2ZmJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcuZGVmYXVsdC13cmFwJykuYWRkQ2xhc3MoJ3NsaWRlLXdyYXAnKTtcbiAgICAgICAgJCgnLmRlZmF1bHQtc2xpZGVyJykuYWRkQ2xhc3MoJ3NsaWRlcicpO1xuICAgICAgICAkKCcuc2xpZGVyJykucmVtb3ZlQ2xhc3MoJ2RlZmF1bHQtc2xpZGVyJyk7XG5cbiAgICAgICAgJCgnLnNsaWRlcicpLnNsaWRlcih7XG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDIzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRheXRpbWVfb24gPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGRheXRpbWVfb24gPT0gZmFsc2UpIHtcbiAgICAgICAgJCgnLnN3aXRjaC1vZmYnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5zd2l0Y2gtb24nKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5zbGlkZS13cmFwJykuYWRkQ2xhc3MoJ2RlZmF1bHQtd3JhcCcpO1xuICAgICAgICAkKCcuZGVmYXVsdC13cmFwJykucmVtb3ZlQ2xhc3MoJ3NsaWRlLXdyYXAnKTtcbiAgICAgICAgJCgnLnNsaWRlcicpLmFkZENsYXNzKCdkZWZhdWx0LXNsaWRlcicpO1xuICAgICAgICAkKCcuZGVmYXVsdC1zbGlkZXInKS5yZW1vdmVDbGFzcygnc2xpZGVyJyk7XG5cbiAgICAgICAgZGF5dGltZV9vbiA9IHRydWU7XG4gICAgICAgICQoJy5kZWZhdWx0LXNsaWRlci5hY3RpdmUtc2xpZGVyJykuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSAkKGVsKS5zbGlkZXIoJ3ZhbHVlcycpO1xuICAgICAgICAgICAgJChlbCkuc2xpZGVyKCdkZXN0cm95Jyk7XG4gICAgICAgICAgICBpbml0U2xpZGVyKCQoZWwpLCB2YWx1ZXMpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFkZEhhbmRsZShzZWxlY3Rvcikge1xuICAgIHZhciAkc2xpZGVyID0gJChzZWxlY3Rvcik7XG4gICAgY29uc29sZS5sb2coJHNsaWRlcik7XG4gICAgdmFyIHBvc3NpYmxlQXJyID0gW107XG4gICAgLy8gYSBsaXN0IG9mIHBvc3NpYmxlIGhhbmRsZSB2YWx1ZXMgd2hpY2ggY2FuIGJlIGFkZGVkXG4gICAgaWYgKGRheXRpbWVfb24pIHBvc3NpYmxlQXJyID0gWzQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNF07ZWxzZSB7XG4gICAgICAgIHBvc3NpYmxlQXJyID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShuZXcgQXJyYXkoMjQpLmtleXMoKSkpO1xuICAgIH1cbiAgICBpZiAoISRzbGlkZXIuaGFzQ2xhc3MoJ2FjdGl2ZS1zbGlkZXInKSkge1xuICAgICAgICB2YXIgZGVmYXVsdFZhbHVlID0gZ2V0RGVmYXVsdFZhbHVlKGRheXRpbWVfb24pO1xuICAgICAgICBpZiAoJHNsaWRlci5oYXNDbGFzcygnY3VycmVudC1kYXknKSAmJiBkZWZhdWx0VmFsdWUgPj0gMjMgLSBjdXJyZW50SG91cikge1xuICAgICAgICAgICAgdmFyIHRoaXNXZWVrU2xpZGVycyA9ICQoJy5mbGV4LWFjdGl2ZS1zbGlkZSAuZGVmYXVsdC13cmFwID4gZGl2Jyk7XG4gICAgICAgICAgICB2YXIgc2xpZGVySW5kZXggPSB0aGlzV2Vla1NsaWRlcnMuaW5kZXgoc2VsZWN0b3IpO1xuICAgICAgICAgICAgdmFyIG5leHRTbGlkZXIgPSB0aGlzV2Vla1NsaWRlcnNbc2xpZGVySW5kZXggKyAxXTtcbiAgICAgICAgICAgIGFkZEhhbmRsZShuZXh0U2xpZGVyKTtcbiAgICAgICAgICAgICQobmV4dFNsaWRlcikuYWRkQ2xhc3MoJ2FjdGl2ZS1zbGlkZXInKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluaXRTbGlkZXIoJHNsaWRlcik7XG4gICAgICAgICAgICAkc2xpZGVyLmFkZENsYXNzKCdhY3RpdmUtc2xpZGVyJyk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdmFsdWVzID0gJHNsaWRlci5zbGlkZXIoJ3ZhbHVlcycpO1xuICAgICAgICB2YXIgcG9zc2libGVOZXdWYWx1ZSA9IHZhbHVlc1t2YWx1ZXMubGVuZ3RoIC0gMV0gLSA0O1xuICAgICAgICBpZiAodmFsdWVzLmluZGV4T2YocG9zc2libGVOZXdWYWx1ZSkgPT09IC0xICYmIHBvc3NpYmxlQXJyLmluZGV4T2YocG9zc2libGVOZXdWYWx1ZSkgIT09IC0xKSB7XG4gICAgICAgICAgICB2YWx1ZXMucHVzaChwb3NzaWJsZU5ld1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICgkc2xpZGVyLmhhc0NsYXNzKCdjdXJyZW50LWRheScpKSB7XG4gICAgICAgICAgICAgICAgcG9zc2libGVBcnIgPSBwb3NzaWJsZUFyci5maWx0ZXIoZnVuY3Rpb24gKG51bSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVtID49IDIzIC0gY3VycmVudEhvdXIpIHJldHVybiBmYWxzZTtlbHNlIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9zc2libGVBcnIgPSBwb3NzaWJsZUFyci5maWx0ZXIoZnVuY3Rpb24gKG51bSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZXMuaW5kZXhPZihudW0pID09IC0xO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncG9zc2libGUgcmFuZG9tIHZhbHVlcycsIHBvc3NpYmxlQXJyKTtcbiAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IHBvc3NpYmxlQXJyLnJhbmRvbUVsZW1lbnQoKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyYW5kb20gbmV3IHZhbHVlJywgbmV3VmFsdWUpO1xuICAgICAgICAgICAgaWYgKG5ld1ZhbHVlICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIGZhbHNlIGlmIG5vIHBsYWNlIHRvIGFkZFxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAkc2xpZGVyLnNsaWRlcignZGVzdHJveScpO1xuICAgICAgICBpbml0U2xpZGVyKCRzbGlkZXIsIHZhbHVlcyk7XG4gICAgfVxuICAgICRzbGlkZXIuZmluZCgnLnVpLXNsaWRlci1oYW5kbGU6bGFzdCcpLmZvY3VzKCk7XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGRlbGV0ZUhhbmRsZShoYW5kbGUpIHtcbiAgICBjb25zb2xlLmxvZyhoYW5kbGUpO1xuICAgIHZhciAkc2xpZGVyID0gaGFuZGxlLnBhcmVudCgpO1xuICAgIHZhciBoYW5kbGVJbmRleCA9ICRzbGlkZXIuZmluZCgnLnVpLXNsaWRlci1oYW5kbGUnKS5pbmRleChoYW5kbGUpO1xuICAgIHZhciB2YWx1ZXMgPSAkc2xpZGVyLnNsaWRlcigndmFsdWVzJyk7XG4gICAgY29uc29sZS5sb2coJ29sZCB2YWx1ZXMnLCB2YWx1ZXMpO1xuICAgIGNvbnNvbGUubG9nKGhhbmRsZUluZGV4KTtcbiAgICB2YWx1ZXMuc3BsaWNlKGhhbmRsZUluZGV4LCAxKTtcbiAgICBjb25zb2xlLmxvZygnbmV3IHZhbHVlcycsIHZhbHVlcyk7XG4gICAgJHNsaWRlci5zbGlkZXIoJ2Rlc3Ryb3knKTtcbiAgICBpbml0U2xpZGVyKCRzbGlkZXIsIHZhbHVlcyk7XG59XG5cbn0se31dfSx7fSxbMV0pO1xuIl0sImZpbGUiOiJtYWluLmpzIn0=
