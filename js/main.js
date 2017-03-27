(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _weeks = require('./weeks');

$(window).ready(function () {
    $('#handle-size-select').on('change', function () {
        (0, _weeks.setHandleSize)(this.value);
    });
    $('#calculate-all').on('click', function () {
        (0, _weeks.calculateAllHandles)();
    });

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
                        var pastDaySliders = allFirstWeekSliders.splice(0, allFirstWeekSliders.index(firstSlider));
                        pastDaySliders.forEach(function (el) {
                            // mark past days (cant move/create handles there)
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
// TODO prevent moving handles to days and hours past current time DONE
// TODO move white background a bit so it looks better (skype) DONE
// TODO final calculations function (dont forget about 23-value) bug
// week text displays incorrectly if slides are skipped too fast
// TODO handle custom size??? DONE

},{"./weeks":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setHandleSize = setHandleSize;
exports.updateAllHandles = updateAllHandles;
exports.initSlider = initSlider;
exports.initFirstSlider = initFirstSlider;
exports.getItems = getItems;
exports.addLastWeekSlide = addLastWeekSlide;
exports.daytimeSliderChanges = daytimeSliderChanges;
exports.addHandle = addHandle;
exports.deleteHandle = deleteHandle;
exports.calculateAllHandles = calculateAllHandles;

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
var startHour; // hour on which widget started, handles cant step on it and past it
var startMoment;
$(window).ready(function () {
    $('body').append('<div id="slider-popup"></div>');
    sliderPopup = $('#slider-popup');
    startHour = moment().hour();
    startMoment = moment();
    console.log(startMoment);
});
var daytime_on = true;
var HANDLE_SIZE = 100;
function setHandleSize(size) {
    console.log(size);
    HANDLE_SIZE = size;
    updateAllHandles();
}
function updateAllHandles() {
    var heightToSet;
    if (HANDLE_SIZE == 100) {
        heightToSet = '8px';
    } else if (HANDLE_SIZE == 200) {
        heightToSet = '16px';
    } else if (HANDLE_SIZE == 300) {
        heightToSet = '24px';
    } else if (HANDLE_SIZE == 400) {
        heightToSet = '32px';
    } else {
        console.log('incorrect HANDLE_SIZE value!');
        heightToSet = '8px';
    }
    $('.ui-slider-handle').css('height', heightToSet);
}

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
    updateAllHandles();
}

function initFirstSlider(selector) {
    var defaultValue = getDefaultValue(daytime_on);
    if (defaultValue >= 23 - startHour) {
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
    return ui.value < 23 - startHour;
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
        clone.css('width', $(targetHandle).width()).css('height', $(targetHandle).height());
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
        if (defaultValue >= 23 - startHour) {
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
        if ($slider.hasClass('current-day') && defaultValue >= 23 - startHour) {
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
                    if (num >= 23 - startHour) return false;else return true;
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

function calculateAllHandles() {
    var calculatedMoments = []; // final array

    var allFlexSlides = $('.flexslider .slides .item:not(.clone)');
    allFlexSlides.each(function (i, slide) {
        var week = startMoment.week() + i;
        var allWeekSliders = $(slide).find('.default-wrap > div');
        allWeekSliders.each(function (i, slider) {
            var day = 1 + i;
            if ($(slider).hasClass('active-slider')) {
                var values = $(slider).slider('values');
                var hours = values.map(function (el) {
                    return 23 - el;
                });
                hours.forEach(function (hour) {
                    calculatedMoments.push(moment().year(startMoment.year()).month(startMoment.month()).week(week).day(day).hour(hour).minute(0).second(0).millisecond(0));
                });
            }
        });
    });
    var inConsole = calculatedMoments.map(function (mom) {
        return mom.format('LLL');
    });

    console.log(inConsole);
}

},{}]},{},[1]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF93ZWVrcyA9IHJlcXVpcmUoJy4vd2Vla3MnKTtcblxuJCh3aW5kb3cpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjaGFuZGxlLXNpemUtc2VsZWN0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgKDAsIF93ZWVrcy5zZXRIYW5kbGVTaXplKSh0aGlzLnZhbHVlKTtcbiAgICB9KTtcbiAgICAkKCcjY2FsY3VsYXRlLWFsbCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgKDAsIF93ZWVrcy5jYWxjdWxhdGVBbGxIYW5kbGVzKSgpO1xuICAgIH0pO1xuXG4gICAgdmFyIGlzSW5pdGlhdGVkID0gZmFsc2U7XG5cbiAgICAvLyAgT1BFTiBXSURHRVRcbiAgICB7XG4gICAgICAgIHZhciBkaXNwbGF5ID0gdm9pZCAwO1xuICAgICAgICAkKCcub24tYnRuJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib3gnKS5zdHlsZS5kaXNwbGF5O1xuICAgICAgICAgICAgaWYgKGRpc3BsYXkgPT0gJ25vbmUnKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JveCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICBpc0luaXRpYXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICQoJy5mbGV4c2xpZGVyJykuZmxleHNsaWRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246ICdzbGlkZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNob3c6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbE5hdjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sc0NvbnRhaW5lcjogJCgnLmN1c3RvbS1jb250cm9scy1jb250YWluZXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbURpcmVjdGlvbk5hdjogJCgnLmN1c3RvbS1uYXZpZ2F0aW9uIGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleWJvYXJkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkxvb3A6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhZnRlcjogZnVuY3Rpb24gYWZ0ZXIoY3R4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN0eC5jdXJyZW50U2xpZGUgPT0gY3R4Lmxhc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKDAsIF93ZWVrcy5hZGRMYXN0V2Vla1NsaWRlKSgkKCcuZmxleHNsaWRlcicpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xhc3QgdHJhbnNpdGlvbiBlbmRlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCBDdXJyZW50IGRheSBzbGlkZXIgYWN0aXZlLCB3aXRoIG9uZSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF5ID0gbW9tZW50KCkuaXNvV2Vla2RheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFjdGl2ZUVsZW0gPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGRheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlRWxlbSA9ICcubW9uZGF5JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbGVtID0gJy50dWVzZGF5JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbGVtID0gJy53ZWRuZXNkYXknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZUVsZW0gPSAnLnRodXJzZGF5JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbGVtID0gJy5mcmlkYXknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZUVsZW0gPSAnLnNhdHVyZGF5JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbGVtID0gJy5zdW5kYXknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaXJzdFNsaWRlciA9ICQoJy5mbGV4LWFjdGl2ZS1zbGlkZScpLmZpbmQoYWN0aXZlRWxlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWxsRmlyc3RXZWVrU2xpZGVycyA9ICQoJy5mbGV4LWFjdGl2ZS1zbGlkZSAuZGVmYXVsdC13cmFwID4gZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFzdERheVNsaWRlcnMgPSBhbGxGaXJzdFdlZWtTbGlkZXJzLnNwbGljZSgwLCBhbGxGaXJzdFdlZWtTbGlkZXJzLmluZGV4KGZpcnN0U2xpZGVyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXN0RGF5U2xpZGVycy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1hcmsgcGFzdCBkYXlzIChjYW50IG1vdmUvY3JlYXRlIGhhbmRsZXMgdGhlcmUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChlbCkuYWRkQ2xhc3MoJ3Bhc3QtZGF5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICgwLCBfd2Vla3MuaW5pdEZpcnN0U2xpZGVyKShmaXJzdFNsaWRlcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRpc3BsYXkgPT0gJ2Jsb2NrJykge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib3gnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gQ0xPU0VTIFdJREdFVFxuICAgICQoJy5jbG9zZS1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib3gnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH0pO1xuXG4gICAgLy8gREFZVElNRSBPTkxZIE9GRiBPUiBPTlxuXG5cbiAgICAkKCcuc3dpdGNoLW9uJykuY2xpY2soX3dlZWtzLmRheXRpbWVTbGlkZXJDaGFuZ2VzKTtcbiAgICAkKCcuc3dpdGNoLW9mZicpLmNsaWNrKF93ZWVrcy5kYXl0aW1lU2xpZGVyQ2hhbmdlcyk7XG5cbiAgICAvLyBXaGVuIGNsaWNraW5nIG9uIHRoZSBhcnJvd3MgZ2VuZXJhdGUgd2VlayB0ZXh0XG4gICAgZnVuY3Rpb24gc2V0V2Vla1RleHQod2Vlaykge1xuICAgICAgICB2YXIgbSA9IHdlZWsgPyBtb21lbnQoKS53ZWVrKHdlZWspIDogbW9tZW50KCk7XG4gICAgICAgIHZhciBtb25kYXkgPSBtLmlzb1dlZWtkYXkoMSkuZm9ybWF0KCdERCcpO1xuICAgICAgICB2YXIgc3VuZGF5ID0gbS5pc29XZWVrZGF5KDcpLmZvcm1hdCgnREQnKTtcbiAgICAgICAgdmFyIHRoaXNNb250aCA9IG0uZm9ybWF0KCdNTScpO1xuICAgICAgICAkKCcuaXRlbS13ZWVrJykuaHRtbCgnV2VlayAnICsgbW9uZGF5ICsgJy0nICsgc3VuZGF5ICsgJy4nICsgdGhpc01vbnRoKTtcbiAgICB9XG5cbiAgICB2YXIgdGhpc1dlZWsgPSBtb21lbnQoKS53ZWVrKCk7XG4gICAgdmFyIHdlZWsgPSBtb21lbnQoKS53ZWVrKCk7XG4gICAgc2V0V2Vla1RleHQod2Vlayk7XG4gICAgaWYgKHdlZWsgPT0gdGhpc1dlZWspIHtcbiAgICAgICAgJCgnLmZsZXgtcHJldicpLmhpZGUoKTtcbiAgICAgICAgJCgnLmZsZXgtcHJldi1ibG9jaycpLnNob3coKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAkKCcuZmxleC1wcmV2LWJsb2NrJykuaGlkZSgpO1xuICAgICAgICAkKCcuZmxleC1wcmV2Jykuc2hvdygpO1xuICAgIH1cblxuICAgICQoJy5mbGV4LW5leHQnKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJy5mbGV4LXByZXYnKS5zaG93KCk7XG4gICAgICAgICQoJy5mbGV4LXByZXYtYmxvY2snKS5oaWRlKCk7XG5cbiAgICAgICAgaWYgKHdlZWsgPT0gdGhpc1dlZWspIHtcbiAgICAgICAgICAgIHdlZWsgPSB0aGlzV2VlayArIDE7XG4gICAgICAgIH0gZWxzZSBpZiAod2VlayA9PSBwcmV2V2Vlaykge1xuICAgICAgICAgICAgd2VlayA9IHByZXZXZWVrICsgMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdlZWsgPSB3ZWVrICsgMTtcbiAgICAgICAgfVxuICAgICAgICBzZXRXZWVrVGV4dCh3ZWVrKTtcbiAgICB9KTtcblxuICAgIHZhciB0aGVXZWVrID0gd2VlaztcbiAgICB2YXIgcHJldldlZWs7XG4gICAgJCgnLmZsZXgtcHJldicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHdlZWsgPT0gdGhpc1dlZWspIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdlZWsgPSB3ZWVrIC0gMTtcbiAgICAgICAgfVxuICAgICAgICB0aGVXZWVrID0gd2VlaztcbiAgICAgICAgaWYgKHRoZVdlZWsgPT0gdGhpc1dlZWspIHtcbiAgICAgICAgICAgICQoJy5mbGV4LXByZXYnKS5oaWRlKCk7XG4gICAgICAgICAgICAkKCcuZmxleC1wcmV2LWJsb2NrJykuc2hvdygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnLmZsZXgtcHJldicpLnNob3coKTtcbiAgICAgICAgICAgICQoJy5mbGV4LXByZXYtYmxvY2snKS5oaWRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRXZWVrVGV4dCh3ZWVrKTtcblxuICAgICAgICBwcmV2V2VlayA9IHdlZWs7XG4gICAgfSk7XG5cbiAgICAvLyBBREQgQU5EIERFTCBCVVRUT05cblxuICAgICQoJy5hZGQtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYWxsU2xpZGVycyA9ICQoJy5mbGV4LWFjdGl2ZS1zbGlkZSAuZGVmYXVsdC13cmFwID4gZGl2Om5vdCgucGFzdC1kYXkpJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdhbGxTbGlkZXJzJywgYWxsU2xpZGVycyk7XG4gICAgICAgIHZhciBmaXJzdEFjdGl2ZVNsaWRlciA9IGFsbFNsaWRlcnNbMF07XG4gICAgICAgICgwLCBfd2Vla3MuYWRkSGFuZGxlKShmaXJzdEFjdGl2ZVNsaWRlcik7XG4gICAgfSk7XG4gICAge1xuICAgICAgICB2YXIgZm9jdXNFbGVtID0gbnVsbDtcbiAgICAgICAgJCgnLmRlbC1idXR0b24nKS5tb3VzZWRvd24oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2RlbGV0ZScpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJCgnOmZvY3VzJykpO1xuICAgICAgICAgICAgJCgnOmZvY3VzJykuaGFzQ2xhc3MoJ3VpLXNsaWRlci1oYW5kbGUnKSA/IGZvY3VzRWxlbSA9ICQoJzpmb2N1cycpIDogZm9jdXNFbGVtID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgICQoJy5kZWwtYnV0dG9uJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGZvY3VzRWxlbSkge1xuICAgICAgICAgICAgICAgICgwLCBfd2Vla3MuZGVsZXRlSGFuZGxlKShmb2N1c0VsZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59KTtcbi8vIFRPRE8gcHJldmVudCBtb3ZpbmcgaGFuZGxlcyB0byBkYXlzIGFuZCBob3VycyBwYXN0IGN1cnJlbnQgdGltZSBET05FXG4vLyBUT0RPIG1vdmUgd2hpdGUgYmFja2dyb3VuZCBhIGJpdCBzbyBpdCBsb29rcyBiZXR0ZXIgKHNreXBlKSBET05FXG4vLyBUT0RPIGZpbmFsIGNhbGN1bGF0aW9ucyBmdW5jdGlvbiAoZG9udCBmb3JnZXQgYWJvdXQgMjMtdmFsdWUpIGJ1Z1xuLy8gd2VlayB0ZXh0IGRpc3BsYXlzIGluY29ycmVjdGx5IGlmIHNsaWRlcyBhcmUgc2tpcHBlZCB0b28gZmFzdFxuLy8gVE9ETyBoYW5kbGUgY3VzdG9tIHNpemU/Pz8gRE9ORVxuXG59LHtcIi4vd2Vla3NcIjoyfV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuc2V0SGFuZGxlU2l6ZSA9IHNldEhhbmRsZVNpemU7XG5leHBvcnRzLnVwZGF0ZUFsbEhhbmRsZXMgPSB1cGRhdGVBbGxIYW5kbGVzO1xuZXhwb3J0cy5pbml0U2xpZGVyID0gaW5pdFNsaWRlcjtcbmV4cG9ydHMuaW5pdEZpcnN0U2xpZGVyID0gaW5pdEZpcnN0U2xpZGVyO1xuZXhwb3J0cy5nZXRJdGVtcyA9IGdldEl0ZW1zO1xuZXhwb3J0cy5hZGRMYXN0V2Vla1NsaWRlID0gYWRkTGFzdFdlZWtTbGlkZTtcbmV4cG9ydHMuZGF5dGltZVNsaWRlckNoYW5nZXMgPSBkYXl0aW1lU2xpZGVyQ2hhbmdlcztcbmV4cG9ydHMuYWRkSGFuZGxlID0gYWRkSGFuZGxlO1xuZXhwb3J0cy5kZWxldGVIYW5kbGUgPSBkZWxldGVIYW5kbGU7XG5leHBvcnRzLmNhbGN1bGF0ZUFsbEhhbmRsZXMgPSBjYWxjdWxhdGVBbGxIYW5kbGVzO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuLy8gaGVscGZ1bCBmdW5jdGlvbnNcbkFycmF5LnByb3RvdHlwZS5yYW5kb21FbGVtZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMubGVuZ3RoKV07XG59O1xuZnVuY3Rpb24gZ2V0QWJzb2x1dGVSZWN0KGVsZW0pIHtcbiAgICB2YXIgcmVjdCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdG9wOiByZWN0LnRvcCArIHdpbmRvdy5zY3JvbGxZLFxuICAgICAgICBib3R0b206IHJlY3QuYm90dG9tICsgd2luZG93LnNjcm9sbFksXG4gICAgICAgIGxlZnQ6IHJlY3QubGVmdCArIHdpbmRvdy5zY3JvbGxYLFxuICAgICAgICByaWdodDogcmVjdC5yaWdodCArIHdpbmRvdy5zY3JvbGxYXG4gICAgfTtcbn1cblxudmFyIHNsaWRlclBvcHVwO1xudmFyIHN0YXJ0SG91cjsgLy8gaG91ciBvbiB3aGljaCB3aWRnZXQgc3RhcnRlZCwgaGFuZGxlcyBjYW50IHN0ZXAgb24gaXQgYW5kIHBhc3QgaXRcbnZhciBzdGFydE1vbWVudDtcbiQod2luZG93KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgJCgnYm9keScpLmFwcGVuZCgnPGRpdiBpZD1cInNsaWRlci1wb3B1cFwiPjwvZGl2PicpO1xuICAgIHNsaWRlclBvcHVwID0gJCgnI3NsaWRlci1wb3B1cCcpO1xuICAgIHN0YXJ0SG91ciA9IG1vbWVudCgpLmhvdXIoKTtcbiAgICBzdGFydE1vbWVudCA9IG1vbWVudCgpO1xuICAgIGNvbnNvbGUubG9nKHN0YXJ0TW9tZW50KTtcbn0pO1xudmFyIGRheXRpbWVfb24gPSB0cnVlO1xudmFyIEhBTkRMRV9TSVpFID0gMTAwO1xuZnVuY3Rpb24gc2V0SGFuZGxlU2l6ZShzaXplKSB7XG4gICAgY29uc29sZS5sb2coc2l6ZSk7XG4gICAgSEFORExFX1NJWkUgPSBzaXplO1xuICAgIHVwZGF0ZUFsbEhhbmRsZXMoKTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZUFsbEhhbmRsZXMoKSB7XG4gICAgdmFyIGhlaWdodFRvU2V0O1xuICAgIGlmIChIQU5ETEVfU0laRSA9PSAxMDApIHtcbiAgICAgICAgaGVpZ2h0VG9TZXQgPSAnOHB4JztcbiAgICB9IGVsc2UgaWYgKEhBTkRMRV9TSVpFID09IDIwMCkge1xuICAgICAgICBoZWlnaHRUb1NldCA9ICcxNnB4JztcbiAgICB9IGVsc2UgaWYgKEhBTkRMRV9TSVpFID09IDMwMCkge1xuICAgICAgICBoZWlnaHRUb1NldCA9ICcyNHB4JztcbiAgICB9IGVsc2UgaWYgKEhBTkRMRV9TSVpFID09IDQwMCkge1xuICAgICAgICBoZWlnaHRUb1NldCA9ICczMnB4JztcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnaW5jb3JyZWN0IEhBTkRMRV9TSVpFIHZhbHVlIScpO1xuICAgICAgICBoZWlnaHRUb1NldCA9ICc4cHgnO1xuICAgIH1cbiAgICAkKCcudWktc2xpZGVyLWhhbmRsZScpLmNzcygnaGVpZ2h0JywgaGVpZ2h0VG9TZXQpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJWYWx1ZXModmFsdWVzLCBkYXl0aW1lX29uKSB7XG4gICAgaWYgKGRheXRpbWVfb24pIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2ZpbHRlcmluZy4uLicsIHZhbHVlcyk7XG4gICAgICAgIHZhbHVlcyA9IHZhbHVlcy5maWx0ZXIoZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIGlmICh2IDw9IDE0ICYmIHYgPj0gNCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyh2YWx1ZXMpO1xuICAgIHJldHVybiB2YWx1ZXM7XG59XG5mdW5jdGlvbiBnZXREZWZhdWx0VmFsdWUoZGF5dGltZV9vbikge1xuICAgIHZhciB2YWx1ZSA9IDIzIC0gKG1vbWVudCgpLmhvdXIoKSArIDEpO1xuICAgIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMDtcbiAgICBpZiAoZGF5dGltZV9vbikge1xuICAgICAgICBpZiAodmFsdWUgPCA0KSB2YWx1ZSA9IDQ7ZWxzZSBpZiAodmFsdWUgPiAxNCkgdmFsdWUgPSAxNDtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coJ2RlZmF1bHQnLCB2YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gaW5pdFNsaWRlcihzZWxlY3RvciwgdmFsdWVzKSB7XG4gICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGdldERlZmF1bHRWYWx1ZShkYXl0aW1lX29uKTtcbiAgICB2YWx1ZXMgPSB2YWx1ZXMgPyBmaWx0ZXJWYWx1ZXModmFsdWVzLCBkYXl0aW1lX29uKSA6IFtkZWZhdWx0VmFsdWVdO1xuICAgIHNlbGVjdG9yLnNsaWRlcih7XG4gICAgICAgIG9yaWVudGF0aW9uOiAndmVydGljYWwnLFxuICAgICAgICBtaW46IGRheXRpbWVfb24gPyA0IDogMCxcbiAgICAgICAgbWF4OiBkYXl0aW1lX29uID8gMTQgOiAyMyxcbiAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgIHN0ZXA6IDEsXG4gICAgICAgIGFuaW1hdGU6IHRydWUsXG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbiBzdGFydChlLCB1aSkge1xuICAgICAgICAgICAgdmFyIHYgPSAyMyAtIHVpLnZhbHVlO1xuICAgICAgICAgICAgc2xpZGVyUG9wdXAudGV4dCh2KTtcbiAgICAgICAgICAgIHNsaWRlclBvcHVwLnNob3coKTtcbiAgICAgICAgICAgIHNsaWRlclBvcHVwLmNzcygndG9wJywgZ2V0QWJzb2x1dGVSZWN0KHVpLmhhbmRsZSkudG9wIC0gMTApO1xuICAgICAgICAgICAgc2xpZGVyUG9wdXAuY3NzKCdsZWZ0JywgZ2V0QWJzb2x1dGVSZWN0KHVpLmhhbmRsZSkubGVmdCArIDMwKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2xpZGU6IGZ1bmN0aW9uIHNsaWRlKGUsIHVpKSB7XG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY3VycmVudC1kYXknKSkge1xuICAgICAgICAgICAgICAgIGlmICghaGFuZGxlQ3VycmVudERheSh1aSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0aGlzQ29vcmRzID0gZ2V0QWJzb2x1dGVSZWN0KHRoaXMpO1xuICAgICAgICAgICAgLy8gb25seSB0cmlnZ2VyaW5nIHRoZSBldmVudCBpZiBtb3VzZSBpcyBpbiBhIHJhbmdlIG9mIHRoZSBzbGlkZXJcbiAgICAgICAgICAgIGlmICghKGUucGFnZVggPCB0aGlzQ29vcmRzLnJpZ2h0ICsgMTAgJiYgZS5wYWdlWCA+IHRoaXNDb29yZHMubGVmdCAtIDEwICYmIGUucGFnZVkgPCB0aGlzQ29vcmRzLmJvdHRvbSArIDEwICYmIGUucGFnZVkgPiB0aGlzQ29vcmRzLnRvcCAtIDEwKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkaWZmVmFsdWVzID0gW107XG4gICAgICAgICAgICAvLyBwcmV2ZW50IGhhbmRsZSBvdmVybGFwcGluZ1xuICAgICAgICAgICAgZm9yICh2YXIgYSA9IDA7IGEgPCB1aS52YWx1ZXMubGVuZ3RoOyBhKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZGlmZlZhbHVlcy5pbmRleE9mKHVpLnZhbHVlc1thXSkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGlmZlZhbHVlcy5wdXNoKHVpLnZhbHVlc1thXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdiA9IDIzIC0gdWkudmFsdWU7XG4gICAgICAgICAgICBzbGlkZXJQb3B1cC50ZXh0KHYpO1xuICAgICAgICAgICAgc2xpZGVyUG9wdXAuY3NzKCd0b3AnLCBnZXRBYnNvbHV0ZVJlY3QodWkuaGFuZGxlKS50b3AgLSAxMCk7XG4gICAgICAgICAgICBzbGlkZXJQb3B1cC5jc3MoJ2xlZnQnLCBnZXRBYnNvbHV0ZVJlY3QodWkuaGFuZGxlKS5sZWZ0ICsgMzApO1xuICAgICAgICB9LFxuICAgICAgICBzdG9wOiBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgICAgICAgc2xpZGVyUG9wdXAuaGlkZSgpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coJ1ZBTFVFUycsIHZhbHVlcyk7XG4gICAgaWYgKHZhbHVlcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBzZWxlY3Rvci5yZW1vdmVDbGFzcygnYWN0aXZlLXNsaWRlcicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCdhY3RpdmUtc2xpZGVyJyk7XG4gICAgfVxuICAgIHNldERyYWdnYWJsZXMoKTtcbiAgICB1cGRhdGVBbGxIYW5kbGVzKCk7XG59XG5cbmZ1bmN0aW9uIGluaXRGaXJzdFNsaWRlcihzZWxlY3Rvcikge1xuICAgIHZhciBkZWZhdWx0VmFsdWUgPSBnZXREZWZhdWx0VmFsdWUoZGF5dGltZV9vbik7XG4gICAgaWYgKGRlZmF1bHRWYWx1ZSA+PSAyMyAtIHN0YXJ0SG91cikge1xuICAgICAgICBjb25zb2xlLmxvZygnY3VycmVudCBkYXkgd2l0aCBhbiBleGNlcHRpb24nKTtcbiAgICAgICAgdmFyIG5leHRTbGlkZXIgPSBmaW5kTmV4dFNsaWRlcihzZWxlY3RvciwgdHJ1ZSk7XG4gICAgICAgIGluaXRTbGlkZXIoJChuZXh0U2xpZGVyKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaW5pdFNsaWRlcihzZWxlY3Rvcik7XG4gICAgfVxuICAgIHNlbGVjdG9yLmFkZENsYXNzKCdjdXJyZW50LWRheScpO1xufVxuXG5mdW5jdGlvbiBmaW5kTmV4dFNsaWRlcihzZWxlY3RvciwgZ290b25leHQpIHtcbiAgICB2YXIgdGhpc1dlZWtTbGlkZXJzID0gJCgnLmZsZXgtYWN0aXZlLXNsaWRlIC5kZWZhdWx0LXdyYXAgPiBkaXYnKTtcbiAgICB2YXIgc2xpZGVySW5kZXggPSB0aGlzV2Vla1NsaWRlcnMuaW5kZXgoc2VsZWN0b3IpO1xuICAgIC8vIGlmIG5vdCBzdW5kYXlcbiAgICB2YXIgbmV4dFNsaWRlcjtcbiAgICBpZiAoc2xpZGVySW5kZXggIT0gNikge1xuICAgICAgICBuZXh0U2xpZGVyID0gdGhpc1dlZWtTbGlkZXJzW3NsaWRlckluZGV4ICsgMV07XG4gICAgfVxuICAgIC8vIGlmIHN1bmRheVxuICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGFjdGl2ZVNsaWRlID0gJCgnLmZsZXgtYWN0aXZlLXNsaWRlJylbMF07XG4gICAgICAgICAgICB2YXIgbmV4dFNsaWRlID0gYWN0aXZlU2xpZGUubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgICAgICAgbmV4dFNsaWRlciA9ICQobmV4dFNsaWRlKS5maW5kKCcubW9uZGF5Jyk7XG4gICAgICAgICAgICBpZiAoZ290b25leHQpIGdvVG9OZXh0U2xpZGUoKTtcbiAgICAgICAgfVxuICAgIHJldHVybiBuZXh0U2xpZGVyO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVDdXJyZW50RGF5KHVpKSB7XG4gICAgcmV0dXJuIHVpLnZhbHVlIDwgMjMgLSBzdGFydEhvdXI7XG59XG5mdW5jdGlvbiBzZXREcmFnZ2FibGVzKCkge1xuICAgICQoJy51aS1zbGlkZXItaGFuZGxlJykub2ZmKCdtb3VzZWRvd24nKTtcbiAgICAkKCcudWktc2xpZGVyLWhhbmRsZScpLm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnbW91c2Vkb3duJywgdGhpcyk7XG4gICAgICAgIHZhciB0YXJnZXRIYW5kbGUgPSB0aGlzO1xuICAgICAgICAkKHRhcmdldEhhbmRsZSkuZm9jdXMoKTsgLy8gZml4IGluY29ycmVjdCBmb2N1cyBidWdcbiAgICAgICAgY29uc29sZS5sb2codGFyZ2V0SGFuZGxlKTtcbiAgICAgICAgdmFyIHRhcmdldFNsaWRlciA9ICQodGhpcykucGFyZW50KClbMF07XG4gICAgICAgIHZhciBoYW5kbGVJbmRleCA9ICQodGFyZ2V0U2xpZGVyKS5maW5kKCcudWktc2xpZGVyLWhhbmRsZScpLmluZGV4KHRhcmdldEhhbmRsZSk7XG4gICAgICAgIHZhciBzbGlkZXJJbmRleCA9ICQoJy5mbGV4LWFjdGl2ZS1zbGlkZSAuc2NhbGUtaXRlbSAuZGVmYXVsdC13cmFwID4gZGl2JykuaW5kZXgoJCh0YXJnZXRTbGlkZXIpKTtcbiAgICAgICAgdmFyIGNsb25lID0gJCh0aGlzKS5jbG9uZSgpLmFkZENsYXNzKCdoYW5kbGUtY2xvbmUnKTtcbiAgICAgICAgY2xvbmUuY3NzKCd3aWR0aCcsICQodGFyZ2V0SGFuZGxlKS53aWR0aCgpKS5jc3MoJ2hlaWdodCcsICQodGFyZ2V0SGFuZGxlKS5oZWlnaHQoKSk7XG4gICAgICAgIG1vdmVBdChlKTtcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZChjbG9uZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzbGlkZXJJbmRleCcsIHNsaWRlckluZGV4KTtcbiAgICAgICAgZnVuY3Rpb24gaW5pdFdyYXBFdmVudHMoKSB7XG4gICAgICAgICAgICAkKCcuZmxleC1hY3RpdmUtc2xpZGUgLnNjYWxlLWl0ZW0gLmRlZmF1bHQtd3JhcCcpLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgIT09IHNsaWRlckluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdhdHRhY2hpbmcgZXZlbnQnLCBlbCk7XG4gICAgICAgICAgICAgICAgICAgICQoZWwpLm1vdXNldXAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdTbGlkZXIgPSAkKGUuY3VycmVudFRhcmdldCkuZmluZCgnZGl2Jyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5RHJhZ0FuZERyb3AoZSwgdGFyZ2V0U2xpZGVyLCBuZXdTbGlkZXIsIGhhbmRsZUluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gY2xlYXJXcmFwRXZlbnRzKCkge1xuICAgICAgICAgICAgJCgnLmZsZXgtYWN0aXZlLXNsaWRlIC5zY2FsZS1pdGVtIC5kZWZhdWx0LXdyYXAnKS5vZmYoJ21vdXNldXAnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGluaXRXcmFwRXZlbnRzKCk7XG4gICAgICAgIGNsb25lLm1vdXNldXAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Nsb25lIG1vdXNldXAnLCBlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gbW92ZUF0KGUpIHtcbiAgICAgICAgICAgICQodGFyZ2V0SGFuZGxlKS5mb2N1cygpOyAvLyBmaXggaW5jb3JyZWN0IGZvY3VzIGJ1Z1xuICAgICAgICAgICAgdmFyIHRoaXNDb29yZHMgPSBnZXRBYnNvbHV0ZVJlY3QodGFyZ2V0U2xpZGVyKTtcbiAgICAgICAgICAgIGlmIChlLnBhZ2VYIDwgdGhpc0Nvb3Jkcy5yaWdodCArIDEwICYmIGUucGFnZVggPiB0aGlzQ29vcmRzLmxlZnQgLSAxMCAmJiBlLnBhZ2VZIDwgdGhpc0Nvb3Jkcy5ib3R0b20gKyAxMCAmJiBlLnBhZ2VZID4gdGhpc0Nvb3Jkcy50b3AgLSAxMCkge1xuICAgICAgICAgICAgICAgIGNsb25lLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNsb25lLmNzcygnZGlzcGxheScsICdpbml0aWFsJyk7XG4gICAgICAgICAgICAgICAgY2xvbmUuY3NzKCdsZWZ0JywgZS5wYWdlWCAtIGNsb25lLndpZHRoKCkgLyAyKTtcbiAgICAgICAgICAgICAgICBjbG9uZS5jc3MoJ3RvcCcsIGUucGFnZVkgLSBjbG9uZS5oZWlnaHQoKSAvIDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgICQoJ2JvZHknKS5tb3VzZW1vdmUoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb3VzZW1vdmUnKTtcbiAgICAgICAgICAgIG1vdmVBdChlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnYm9keScpLm1vdXNldXAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb3VzZXVwJyk7XG4gICAgICAgICAgICAkKCdib2R5Jykub2ZmKCdtb3VzZW1vdmUnKTtcbiAgICAgICAgICAgICQoJ2JvZHknKS5vZmYoJ21vdXNldXAnKTtcbiAgICAgICAgICAgIGNsb25lLnJlbW92ZSgpO1xuICAgICAgICAgICAgY2xlYXJXcmFwRXZlbnRzKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBhcHBseURyYWdBbmREcm9wKGUsIHRhcmdldFNsaWRlciwgbmV3U2xpZGVyLCBoYW5kbGVJbmRleCkge1xuICAgIGlmIChuZXdTbGlkZXIuaGFzQ2xhc3MoJ3Bhc3QtZGF5JykpIHJldHVybjtcbiAgICBpZiAobmV3U2xpZGVyLmhhc0NsYXNzKCdjdXJyZW50LWRheScpKSB7XG4gICAgICAgIHZhciBkZWZhdWx0VmFsdWUgPSBnZXREZWZhdWx0VmFsdWUoZGF5dGltZV9vbik7XG4gICAgICAgIGlmIChkZWZhdWx0VmFsdWUgPj0gMjMgLSBzdGFydEhvdXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zb2xlLmxvZyhlKTtcbiAgICB2YXIgb2xkU2xpZGVyVmFsdWVzID0gJCh0YXJnZXRTbGlkZXIpLnNsaWRlcigndmFsdWVzJyk7XG4gICAgb2xkU2xpZGVyVmFsdWVzLnNwbGljZShoYW5kbGVJbmRleCwgMSk7XG4gICAgdmFyIHdhc0FkZGVkID0gYWRkSGFuZGxlKG5ld1NsaWRlcik7XG4gICAgLy8gaWYgc2xpZGVyIGFjdHVhbGx5IGRpZG50IHVwZGF0ZSAobm90IGVub3VnaCBwbGFjZSksIGRvIG5vdGhpbmdcbiAgICBpZiAod2FzQWRkZWQpIHtcbiAgICAgICAgJCh0YXJnZXRTbGlkZXIpLnNsaWRlcignZGVzdHJveScpO1xuICAgICAgICBpbml0U2xpZGVyKCQodGFyZ2V0U2xpZGVyKSwgb2xkU2xpZGVyVmFsdWVzKTtcbiAgICB9XG4gICAgc2xpZGVyUG9wdXAuaGlkZSgpO1xufVxuXG5mdW5jdGlvbiBnZXRJdGVtcygpIHtcbiAgICByZXR1cm4gJCgnLmZsZXhzbGlkZXIgLnNsaWRlcyAuaXRlbTpub3QoLmNsb25lKScpO1xufVxuXG5mdW5jdGlvbiBhZGRMYXN0V2Vla1NsaWRlKHNlbGVjdG9yKSB7XG4gICAgdmFyIGN0eCA9IHNlbGVjdG9yLmRhdGEoJ2ZsZXhzbGlkZXInKTtcblxuICAgIHZhciB0ZW1wbGF0ZSA9ICQoJzxsaSBjbGFzcz1cIml0ZW1cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtLXdlZWtcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNjYWxlLXdyYXBwZXJcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJsaXN0LXNjYWxlLXdyYXBcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwidGltZXMtd3JhcC1sZWZ0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGltZS1taW5cIj4wMDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpbWUtbWF4XCI+MjQ8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwic2NhbGUtaXRlbVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRheVwiPk1vbjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFkZC10aW1lcy1sZWZ0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtd3JhcFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC1zbGlkZXIgbW9uZGF5XCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwic2NhbGUtaXRlbVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRheVwiPlR1ZTwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtd3JhcFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXNsaWRlciAgdHVlc2RheVwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInNjYWxlLWl0ZW1cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXlcIj5XZWQ8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXdyYXBcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC1zbGlkZXIgd2VkbmVzZGF5XCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwic2NhbGUtaXRlbVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRheVwiPlRoPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtd3JhcFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXNsaWRlciB0aHVyc2RheVwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInNjYWxlLWl0ZW1cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXlcIj5GcjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtd3JhcFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXNsaWRlciAgZnJpZGF5XCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwic2NhbGUtaXRlbVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRheVwiPlNhdDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtd3JhcFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXNsaWRlciAgc2F0dXJkYXlcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJzY2FsZS1pdGVtXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF5XCI+U3VuPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkLXRpbWVzLXJpZ2h0XCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtd3JhcFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC1zbGlkZXIgIHN1bmRheVwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInRpbWVzLXdyYXAtcmlnaHRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lLW1pblwiPjAwPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGltZS1tYXhcIj4yNDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdWw+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT4nKTtcbiAgICBjdHguYWRkU2xpZGUodGVtcGxhdGUpO1xufVxuXG5mdW5jdGlvbiBnb1RvTmV4dFNsaWRlKCkge1xuICAgICQoJy5mbGV4LW5leHQnKS50cmlnZ2VyKCdjbGljaycpO1xufVxuXG5mdW5jdGlvbiBkYXl0aW1lU2xpZGVyQ2hhbmdlcygpIHtcbiAgICBpZiAoZGF5dGltZV9vbikge1xuICAgICAgICAkKCcuc3dpdGNoLW9uJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcuc3dpdGNoLW9mZicpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgJCgnLmRlZmF1bHQtd3JhcCcpLmFkZENsYXNzKCdzbGlkZS13cmFwJyk7XG4gICAgICAgICQoJy5kZWZhdWx0LXNsaWRlcicpLmFkZENsYXNzKCdzbGlkZXInKTtcbiAgICAgICAgJCgnLnNsaWRlcicpLnJlbW92ZUNsYXNzKCdkZWZhdWx0LXNsaWRlcicpO1xuXG4gICAgICAgICQoJy5zbGlkZXInKS5zbGlkZXIoe1xuICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgbWF4OiAyM1xuICAgICAgICB9KTtcblxuICAgICAgICBkYXl0aW1lX29uID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChkYXl0aW1lX29uID09IGZhbHNlKSB7XG4gICAgICAgICQoJy5zd2l0Y2gtb2ZmJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcuc3dpdGNoLW9uJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcuc2xpZGUtd3JhcCcpLmFkZENsYXNzKCdkZWZhdWx0LXdyYXAnKTtcbiAgICAgICAgJCgnLmRlZmF1bHQtd3JhcCcpLnJlbW92ZUNsYXNzKCdzbGlkZS13cmFwJyk7XG4gICAgICAgICQoJy5zbGlkZXInKS5hZGRDbGFzcygnZGVmYXVsdC1zbGlkZXInKTtcbiAgICAgICAgJCgnLmRlZmF1bHQtc2xpZGVyJykucmVtb3ZlQ2xhc3MoJ3NsaWRlcicpO1xuXG4gICAgICAgIGRheXRpbWVfb24gPSB0cnVlO1xuICAgICAgICAkKCcuZGVmYXVsdC1zbGlkZXIuYWN0aXZlLXNsaWRlcicpLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVzID0gJChlbCkuc2xpZGVyKCd2YWx1ZXMnKTtcbiAgICAgICAgICAgICQoZWwpLnNsaWRlcignZGVzdHJveScpO1xuICAgICAgICAgICAgaW5pdFNsaWRlcigkKGVsKSwgdmFsdWVzKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBhZGRIYW5kbGUoc2VsZWN0b3IpIHtcbiAgICB2YXIgJHNsaWRlciA9ICQoc2VsZWN0b3IpO1xuICAgIGNvbnNvbGUubG9nKCRzbGlkZXIpO1xuICAgIHZhciBwb3NzaWJsZUFyciA9IFtdO1xuICAgIC8vIGEgbGlzdCBvZiBwb3NzaWJsZSBoYW5kbGUgdmFsdWVzIHdoaWNoIGNhbiBiZSBhZGRlZFxuICAgIGlmIChkYXl0aW1lX29uKSBwb3NzaWJsZUFyciA9IFs0LCA1LCA2LCA3LCA4LCA5LCAxMCwgMTEsIDEyLCAxMywgMTRdO2Vsc2Uge1xuICAgICAgICBwb3NzaWJsZUFyciA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkobmV3IEFycmF5KDI0KS5rZXlzKCkpKTtcbiAgICB9XG4gICAgaWYgKCEkc2xpZGVyLmhhc0NsYXNzKCdhY3RpdmUtc2xpZGVyJykpIHtcbiAgICAgICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGdldERlZmF1bHRWYWx1ZShkYXl0aW1lX29uKTtcbiAgICAgICAgaWYgKCRzbGlkZXIuaGFzQ2xhc3MoJ2N1cnJlbnQtZGF5JykgJiYgZGVmYXVsdFZhbHVlID49IDIzIC0gc3RhcnRIb3VyKSB7XG4gICAgICAgICAgICB2YXIgbmV4dFNsaWRlciA9IGZpbmROZXh0U2xpZGVyKHNlbGVjdG9yLCBmYWxzZSk7XG4gICAgICAgICAgICAvLyBpZiBuZXh0IHNsaWRlciBpcyBvbiBhbm90aGVyIGZsZXhTbGlkZVxuICAgICAgICAgICAgaWYgKCQoJy5mbGV4LWFjdGl2ZS1zbGlkZSAuZGVmYXVsdC13cmFwID4gZGl2JykuaW5kZXgobmV4dFNsaWRlcikgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnZml4IScpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZEhhbmRsZShuZXh0U2xpZGVyKTtcbiAgICAgICAgICAgICQobmV4dFNsaWRlcikuYWRkQ2xhc3MoJ2FjdGl2ZS1zbGlkZXInKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluaXRTbGlkZXIoJHNsaWRlcik7XG4gICAgICAgICAgICAkc2xpZGVyLmFkZENsYXNzKCdhY3RpdmUtc2xpZGVyJyk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdmFsdWVzID0gJHNsaWRlci5zbGlkZXIoJ3ZhbHVlcycpO1xuICAgICAgICB2YXIgcG9zc2libGVOZXdWYWx1ZSA9IHZhbHVlc1t2YWx1ZXMubGVuZ3RoIC0gMV0gLSA0O1xuICAgICAgICBpZiAodmFsdWVzLmluZGV4T2YocG9zc2libGVOZXdWYWx1ZSkgPT09IC0xICYmIHBvc3NpYmxlQXJyLmluZGV4T2YocG9zc2libGVOZXdWYWx1ZSkgIT09IC0xKSB7XG4gICAgICAgICAgICB2YWx1ZXMucHVzaChwb3NzaWJsZU5ld1ZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICgkc2xpZGVyLmhhc0NsYXNzKCdjdXJyZW50LWRheScpKSB7XG4gICAgICAgICAgICAgICAgcG9zc2libGVBcnIgPSBwb3NzaWJsZUFyci5maWx0ZXIoZnVuY3Rpb24gKG51bSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAobnVtID49IDIzIC0gc3RhcnRIb3VyKSByZXR1cm4gZmFsc2U7ZWxzZSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBvc3NpYmxlQXJyID0gcG9zc2libGVBcnIuZmlsdGVyKGZ1bmN0aW9uIChudW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVzLmluZGV4T2YobnVtKSA9PSAtMTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3Bvc3NpYmxlIHJhbmRvbSB2YWx1ZXMnLCBwb3NzaWJsZUFycik7XG4gICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSBwb3NzaWJsZUFyci5yYW5kb21FbGVtZW50KCk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncmFuZG9tIG5ldyB2YWx1ZScsIG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIGlmIChuZXdWYWx1ZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZXMucHVzaChuZXdWYWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHJldHVybiBmYWxzZSBpZiBubyBwbGFjZSB0byBhZGRcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgJHNsaWRlci5zbGlkZXIoJ2Rlc3Ryb3knKTtcbiAgICAgICAgaW5pdFNsaWRlcigkc2xpZGVyLCB2YWx1ZXMpO1xuICAgIH1cbiAgICAkc2xpZGVyLmZpbmQoJy51aS1zbGlkZXItaGFuZGxlOmxhc3QnKS5mb2N1cygpO1xuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBkZWxldGVIYW5kbGUoaGFuZGxlKSB7XG4gICAgY29uc29sZS5sb2coaGFuZGxlKTtcbiAgICB2YXIgJHNsaWRlciA9IGhhbmRsZS5wYXJlbnQoKTtcbiAgICB2YXIgaGFuZGxlSW5kZXggPSAkc2xpZGVyLmZpbmQoJy51aS1zbGlkZXItaGFuZGxlJykuaW5kZXgoaGFuZGxlKTtcbiAgICB2YXIgdmFsdWVzID0gJHNsaWRlci5zbGlkZXIoJ3ZhbHVlcycpO1xuICAgIGNvbnNvbGUubG9nKCdvbGQgdmFsdWVzJywgdmFsdWVzKTtcbiAgICBjb25zb2xlLmxvZyhoYW5kbGVJbmRleCk7XG4gICAgdmFsdWVzLnNwbGljZShoYW5kbGVJbmRleCwgMSk7XG4gICAgY29uc29sZS5sb2coJ25ldyB2YWx1ZXMnLCB2YWx1ZXMpO1xuICAgICRzbGlkZXIuc2xpZGVyKCdkZXN0cm95Jyk7XG4gICAgaW5pdFNsaWRlcigkc2xpZGVyLCB2YWx1ZXMpO1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVBbGxIYW5kbGVzKCkge1xuICAgIHZhciBjYWxjdWxhdGVkTW9tZW50cyA9IFtdOyAvLyBmaW5hbCBhcnJheVxuXG4gICAgdmFyIGFsbEZsZXhTbGlkZXMgPSAkKCcuZmxleHNsaWRlciAuc2xpZGVzIC5pdGVtOm5vdCguY2xvbmUpJyk7XG4gICAgYWxsRmxleFNsaWRlcy5lYWNoKGZ1bmN0aW9uIChpLCBzbGlkZSkge1xuICAgICAgICB2YXIgd2VlayA9IHN0YXJ0TW9tZW50LndlZWsoKSArIGk7XG4gICAgICAgIHZhciBhbGxXZWVrU2xpZGVycyA9ICQoc2xpZGUpLmZpbmQoJy5kZWZhdWx0LXdyYXAgPiBkaXYnKTtcbiAgICAgICAgYWxsV2Vla1NsaWRlcnMuZWFjaChmdW5jdGlvbiAoaSwgc2xpZGVyKSB7XG4gICAgICAgICAgICB2YXIgZGF5ID0gMSArIGk7XG4gICAgICAgICAgICBpZiAoJChzbGlkZXIpLmhhc0NsYXNzKCdhY3RpdmUtc2xpZGVyJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWVzID0gJChzbGlkZXIpLnNsaWRlcigndmFsdWVzJyk7XG4gICAgICAgICAgICAgICAgdmFyIGhvdXJzID0gdmFsdWVzLm1hcChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDIzIC0gZWw7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaG91cnMuZm9yRWFjaChmdW5jdGlvbiAoaG91cikge1xuICAgICAgICAgICAgICAgICAgICBjYWxjdWxhdGVkTW9tZW50cy5wdXNoKG1vbWVudCgpLnllYXIoc3RhcnRNb21lbnQueWVhcigpKS5tb250aChzdGFydE1vbWVudC5tb250aCgpKS53ZWVrKHdlZWspLmRheShkYXkpLmhvdXIoaG91cikubWludXRlKDApLnNlY29uZCgwKS5taWxsaXNlY29uZCgwKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIHZhciBpbkNvbnNvbGUgPSBjYWxjdWxhdGVkTW9tZW50cy5tYXAoZnVuY3Rpb24gKG1vbSkge1xuICAgICAgICByZXR1cm4gbW9tLmZvcm1hdCgnTExMJyk7XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZyhpbkNvbnNvbGUpO1xufVxuXG59LHt9XX0se30sWzFdKTtcbiJdLCJmaWxlIjoibWFpbi5qcyJ9
