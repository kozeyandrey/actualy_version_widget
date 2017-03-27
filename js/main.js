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
                            }
                            (0, _weeks.setWeekText)(ctx.currentSlide);
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

    $('.flex-prev').hide();
    $('.flex-prev-block').show();

    // ADD AND DEL BUTTON

    $('.add-button').click(function () {
        var allSliders = $('.flex-active-slide .default-wrap > div:not(.past-day)');
        var firstActiveSlider = allSliders[0];
        (0, _weeks.addHandle)(firstActiveSlider);
    });
    {
        var focusElem = null;
        $('.del-button').mousedown(function () {
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
exports.setWeekText = setWeekText;
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
    setWeekText();
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
    // console('VALUES', values);
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
        // console('current day with an exception');
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
        // console(targetHandle);
        var targetSlider = $(this).parent()[0];
        var handleIndex = $(targetSlider).find('.ui-slider-handle').index(targetHandle);
        var sliderIndex = $('.flex-active-slide .scale-item .default-wrap > div').index($(targetSlider));
        var clone = $(this).clone().addClass('handle-clone');
        clone.css('width', $(targetHandle).width()).css('height', $(targetHandle).height());
        moveAt(e);
        $('body').append(clone);
        // console('sliderIndex', sliderIndex);
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
    // console.log(e);
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
    // console.log($slider);
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

function setWeekText(slideIndex) {
    var startM = startMoment.clone();
    var m = slideIndex ? startM.add(slideIndex, 'w') : startM;
    var monday = m.isoWeekday(1).format('DD');
    var sunday = m.isoWeekday(7).format('DD');
    var thisMonth = m.format('MM');
    $('.item-week').html('Week ' + monday + '-' + sunday + '.' + thisMonth);
}

function calculateAllHandles() {
    var calculatedMoments = []; // final array
    console.log('calculating moments...');
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
                    calculatedMoments.push(moment().year(startMoment.year()).month(startMoment.month()).week(week).day(day).hour(hour).minute(0).second(0));
                });
            }
        });
    });
    // additional validating, incase handles went to past days/hours
    calculatedMoments = calculatedMoments.filter(function (mom) {
        var cantGoPast = startMoment.clone().hour(startHour + 1).minute(0).second(0);
        return mom.unix() >= cantGoPast.unix();
    });

    var inConsole = calculatedMoments.map(function (mom) {
        return mom.format('LLL');
    });

    console.log(inConsole);
    console.log('object returned -> ', calculatedMoments);
}

},{}]},{},[1]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF93ZWVrcyA9IHJlcXVpcmUoJy4vd2Vla3MnKTtcblxuJCh3aW5kb3cpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICAkKCcjaGFuZGxlLXNpemUtc2VsZWN0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgKDAsIF93ZWVrcy5zZXRIYW5kbGVTaXplKSh0aGlzLnZhbHVlKTtcbiAgICB9KTtcbiAgICAkKCcjY2FsY3VsYXRlLWFsbCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgKDAsIF93ZWVrcy5jYWxjdWxhdGVBbGxIYW5kbGVzKSgpO1xuICAgIH0pO1xuXG4gICAgdmFyIGlzSW5pdGlhdGVkID0gZmFsc2U7XG5cbiAgICAvLyAgT1BFTiBXSURHRVRcbiAgICB7XG4gICAgICAgIHZhciBkaXNwbGF5ID0gdm9pZCAwO1xuICAgICAgICAkKCcub24tYnRuJykuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib3gnKS5zdHlsZS5kaXNwbGF5O1xuICAgICAgICAgICAgaWYgKGRpc3BsYXkgPT0gJ25vbmUnKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JveCcpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICBpc0luaXRpYXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICQoJy5mbGV4c2xpZGVyJykuZmxleHNsaWRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246ICdzbGlkZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZXNob3c6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbE5hdjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sc0NvbnRhaW5lcjogJCgnLmN1c3RvbS1jb250cm9scy1jb250YWluZXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbURpcmVjdGlvbk5hdjogJCgnLmN1c3RvbS1uYXZpZ2F0aW9uIGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleWJvYXJkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkxvb3A6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhZnRlcjogZnVuY3Rpb24gYWZ0ZXIoY3R4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN0eC5jdXJyZW50U2xpZGUgPT0gY3R4Lmxhc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKDAsIF93ZWVrcy5hZGRMYXN0V2Vla1NsaWRlKSgkKCcuZmxleHNsaWRlcicpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKDAsIF93ZWVrcy5zZXRXZWVrVGV4dCkoY3R4LmN1cnJlbnRTbGlkZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN0eC5jdXJyZW50U2xpZGUgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcuZmxleC1wcmV2JykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcuZmxleC1wcmV2LWJsb2NrJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5mbGV4LXByZXYnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5mbGV4LXByZXYtYmxvY2snKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IEN1cnJlbnQgZGF5IHNsaWRlciBhY3RpdmUsIHdpdGggb25lIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXkgPSBtb21lbnQoKS5pc29XZWVrZGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWN0aXZlRWxlbSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoZGF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVFbGVtID0gJy5tb25kYXknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZUVsZW0gPSAnLnR1ZXNkYXknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZUVsZW0gPSAnLndlZG5lc2RheSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlRWxlbSA9ICcudGh1cnNkYXknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZUVsZW0gPSAnLmZyaWRheSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZlRWxlbSA9ICcuc2F0dXJkYXknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZUVsZW0gPSAnLnN1bmRheSc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZpcnN0U2xpZGVyID0gJCgnLmZsZXgtYWN0aXZlLXNsaWRlJykuZmluZChhY3RpdmVFbGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbGxGaXJzdFdlZWtTbGlkZXJzID0gJCgnLmZsZXgtYWN0aXZlLXNsaWRlIC5kZWZhdWx0LXdyYXAgPiBkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXN0RGF5U2xpZGVycyA9IGFsbEZpcnN0V2Vla1NsaWRlcnMuc3BsaWNlKDAsIGFsbEZpcnN0V2Vla1NsaWRlcnMuaW5kZXgoZmlyc3RTbGlkZXIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhc3REYXlTbGlkZXJzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbWFyayBwYXN0IGRheXMgKGNhbnQgbW92ZS9jcmVhdGUgaGFuZGxlcyB0aGVyZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKGVsKS5hZGRDbGFzcygncGFzdC1kYXknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgKDAsIF93ZWVrcy5pbml0Rmlyc3RTbGlkZXIpKGZpcnN0U2xpZGVyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGlzcGxheSA9PSAnYmxvY2snKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JveCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBDTE9TRVMgV0lER0VUXG4gICAgJCgnLmNsb3NlLWJ1dHRvbicpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JveCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfSk7XG5cbiAgICAvLyBEQVlUSU1FIE9OTFkgT0ZGIE9SIE9OXG5cblxuICAgICQoJy5zd2l0Y2gtb24nKS5jbGljayhfd2Vla3MuZGF5dGltZVNsaWRlckNoYW5nZXMpO1xuICAgICQoJy5zd2l0Y2gtb2ZmJykuY2xpY2soX3dlZWtzLmRheXRpbWVTbGlkZXJDaGFuZ2VzKTtcblxuICAgICQoJy5mbGV4LXByZXYnKS5oaWRlKCk7XG4gICAgJCgnLmZsZXgtcHJldi1ibG9jaycpLnNob3coKTtcblxuICAgIC8vIEFERCBBTkQgREVMIEJVVFRPTlxuXG4gICAgJCgnLmFkZC1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhbGxTbGlkZXJzID0gJCgnLmZsZXgtYWN0aXZlLXNsaWRlIC5kZWZhdWx0LXdyYXAgPiBkaXY6bm90KC5wYXN0LWRheSknKTtcbiAgICAgICAgdmFyIGZpcnN0QWN0aXZlU2xpZGVyID0gYWxsU2xpZGVyc1swXTtcbiAgICAgICAgKDAsIF93ZWVrcy5hZGRIYW5kbGUpKGZpcnN0QWN0aXZlU2xpZGVyKTtcbiAgICB9KTtcbiAgICB7XG4gICAgICAgIHZhciBmb2N1c0VsZW0gPSBudWxsO1xuICAgICAgICAkKCcuZGVsLWJ1dHRvbicpLm1vdXNlZG93bihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkKCc6Zm9jdXMnKS5oYXNDbGFzcygndWktc2xpZGVyLWhhbmRsZScpID8gZm9jdXNFbGVtID0gJCgnOmZvY3VzJykgOiBmb2N1c0VsZW0gPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgICAgJCgnLmRlbC1idXR0b24nKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoZm9jdXNFbGVtKSB7XG4gICAgICAgICAgICAgICAgKDAsIF93ZWVrcy5kZWxldGVIYW5kbGUpKGZvY3VzRWxlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuLy8gVE9ETyBwcmV2ZW50IG1vdmluZyBoYW5kbGVzIHRvIGRheXMgYW5kIGhvdXJzIHBhc3QgY3VycmVudCB0aW1lIERPTkVcbi8vIFRPRE8gbW92ZSB3aGl0ZSBiYWNrZ3JvdW5kIGEgYml0IHNvIGl0IGxvb2tzIGJldHRlciAoc2t5cGUpIERPTkVcbi8vIFRPRE8gZmluYWwgY2FsY3VsYXRpb25zIGZ1bmN0aW9uIChkb250IGZvcmdldCBhYm91dCAyMy12YWx1ZSkgYnVnXG4vLyB3ZWVrIHRleHQgZGlzcGxheXMgaW5jb3JyZWN0bHkgaWYgc2xpZGVzIGFyZSBza2lwcGVkIHRvbyBmYXN0XG4vLyBUT0RPIGhhbmRsZSBjdXN0b20gc2l6ZT8/PyBET05FXG5cbn0se1wiLi93ZWVrc1wiOjJ9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5zZXRIYW5kbGVTaXplID0gc2V0SGFuZGxlU2l6ZTtcbmV4cG9ydHMudXBkYXRlQWxsSGFuZGxlcyA9IHVwZGF0ZUFsbEhhbmRsZXM7XG5leHBvcnRzLmluaXRTbGlkZXIgPSBpbml0U2xpZGVyO1xuZXhwb3J0cy5pbml0Rmlyc3RTbGlkZXIgPSBpbml0Rmlyc3RTbGlkZXI7XG5leHBvcnRzLmdldEl0ZW1zID0gZ2V0SXRlbXM7XG5leHBvcnRzLmFkZExhc3RXZWVrU2xpZGUgPSBhZGRMYXN0V2Vla1NsaWRlO1xuZXhwb3J0cy5kYXl0aW1lU2xpZGVyQ2hhbmdlcyA9IGRheXRpbWVTbGlkZXJDaGFuZ2VzO1xuZXhwb3J0cy5hZGRIYW5kbGUgPSBhZGRIYW5kbGU7XG5leHBvcnRzLmRlbGV0ZUhhbmRsZSA9IGRlbGV0ZUhhbmRsZTtcbmV4cG9ydHMuc2V0V2Vla1RleHQgPSBzZXRXZWVrVGV4dDtcbmV4cG9ydHMuY2FsY3VsYXRlQWxsSGFuZGxlcyA9IGNhbGN1bGF0ZUFsbEhhbmRsZXM7XG5cbmZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG4vLyBoZWxwZnVsIGZ1bmN0aW9uc1xuQXJyYXkucHJvdG90eXBlLnJhbmRvbUVsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5sZW5ndGgpXTtcbn07XG5mdW5jdGlvbiBnZXRBYnNvbHV0ZVJlY3QoZWxlbSkge1xuICAgIHZhciByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4ge1xuICAgICAgICB0b3A6IHJlY3QudG9wICsgd2luZG93LnNjcm9sbFksXG4gICAgICAgIGJvdHRvbTogcmVjdC5ib3R0b20gKyB3aW5kb3cuc2Nyb2xsWSxcbiAgICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgd2luZG93LnNjcm9sbFgsXG4gICAgICAgIHJpZ2h0OiByZWN0LnJpZ2h0ICsgd2luZG93LnNjcm9sbFhcbiAgICB9O1xufVxuXG52YXIgc2xpZGVyUG9wdXA7XG52YXIgc3RhcnRIb3VyOyAvLyBob3VyIG9uIHdoaWNoIHdpZGdldCBzdGFydGVkLCBoYW5kbGVzIGNhbnQgc3RlcCBvbiBpdCBhbmQgcGFzdCBpdFxudmFyIHN0YXJ0TW9tZW50O1xuJCh3aW5kb3cpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICAkKCdib2R5JykuYXBwZW5kKCc8ZGl2IGlkPVwic2xpZGVyLXBvcHVwXCI+PC9kaXY+Jyk7XG4gICAgc2xpZGVyUG9wdXAgPSAkKCcjc2xpZGVyLXBvcHVwJyk7XG4gICAgc3RhcnRIb3VyID0gbW9tZW50KCkuaG91cigpO1xuICAgIHN0YXJ0TW9tZW50ID0gbW9tZW50KCk7XG4gICAgc2V0V2Vla1RleHQoKTtcbn0pO1xudmFyIGRheXRpbWVfb24gPSB0cnVlO1xudmFyIEhBTkRMRV9TSVpFID0gMTAwO1xuZnVuY3Rpb24gc2V0SGFuZGxlU2l6ZShzaXplKSB7XG4gICAgY29uc29sZS5sb2coc2l6ZSk7XG4gICAgSEFORExFX1NJWkUgPSBzaXplO1xuICAgIHVwZGF0ZUFsbEhhbmRsZXMoKTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZUFsbEhhbmRsZXMoKSB7XG4gICAgdmFyIGhlaWdodFRvU2V0O1xuICAgIGlmIChIQU5ETEVfU0laRSA9PSAxMDApIHtcbiAgICAgICAgaGVpZ2h0VG9TZXQgPSAnOHB4JztcbiAgICB9IGVsc2UgaWYgKEhBTkRMRV9TSVpFID09IDIwMCkge1xuICAgICAgICBoZWlnaHRUb1NldCA9ICcxNnB4JztcbiAgICB9IGVsc2UgaWYgKEhBTkRMRV9TSVpFID09IDMwMCkge1xuICAgICAgICBoZWlnaHRUb1NldCA9ICcyNHB4JztcbiAgICB9IGVsc2UgaWYgKEhBTkRMRV9TSVpFID09IDQwMCkge1xuICAgICAgICBoZWlnaHRUb1NldCA9ICczMnB4JztcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnaW5jb3JyZWN0IEhBTkRMRV9TSVpFIHZhbHVlIScpO1xuICAgICAgICBoZWlnaHRUb1NldCA9ICc4cHgnO1xuICAgIH1cbiAgICAkKCcudWktc2xpZGVyLWhhbmRsZScpLmNzcygnaGVpZ2h0JywgaGVpZ2h0VG9TZXQpO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJWYWx1ZXModmFsdWVzLCBkYXl0aW1lX29uKSB7XG4gICAgaWYgKGRheXRpbWVfb24pIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2ZpbHRlcmluZy4uLicsIHZhbHVlcyk7XG4gICAgICAgIHZhbHVlcyA9IHZhbHVlcy5maWx0ZXIoZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIGlmICh2IDw9IDE0ICYmIHYgPj0gNCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyh2YWx1ZXMpO1xuICAgIHJldHVybiB2YWx1ZXM7XG59XG5mdW5jdGlvbiBnZXREZWZhdWx0VmFsdWUoZGF5dGltZV9vbikge1xuICAgIHZhciB2YWx1ZSA9IDIzIC0gKG1vbWVudCgpLmhvdXIoKSArIDEpO1xuICAgIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMDtcbiAgICBpZiAoZGF5dGltZV9vbikge1xuICAgICAgICBpZiAodmFsdWUgPCA0KSB2YWx1ZSA9IDQ7ZWxzZSBpZiAodmFsdWUgPiAxNCkgdmFsdWUgPSAxNDtcbiAgICB9XG4gICAgLy8gY29uc29sZS5sb2coJ2RlZmF1bHQnLCB2YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gaW5pdFNsaWRlcihzZWxlY3RvciwgdmFsdWVzKSB7XG4gICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGdldERlZmF1bHRWYWx1ZShkYXl0aW1lX29uKTtcbiAgICB2YWx1ZXMgPSB2YWx1ZXMgPyBmaWx0ZXJWYWx1ZXModmFsdWVzLCBkYXl0aW1lX29uKSA6IFtkZWZhdWx0VmFsdWVdO1xuICAgIHNlbGVjdG9yLnNsaWRlcih7XG4gICAgICAgIG9yaWVudGF0aW9uOiAndmVydGljYWwnLFxuICAgICAgICBtaW46IGRheXRpbWVfb24gPyA0IDogMCxcbiAgICAgICAgbWF4OiBkYXl0aW1lX29uID8gMTQgOiAyMyxcbiAgICAgICAgdmFsdWVzOiB2YWx1ZXMsXG4gICAgICAgIHN0ZXA6IDEsXG4gICAgICAgIGFuaW1hdGU6IHRydWUsXG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbiBzdGFydChlLCB1aSkge1xuICAgICAgICAgICAgdmFyIHYgPSAyMyAtIHVpLnZhbHVlO1xuICAgICAgICAgICAgc2xpZGVyUG9wdXAudGV4dCh2KTtcbiAgICAgICAgICAgIHNsaWRlclBvcHVwLnNob3coKTtcbiAgICAgICAgICAgIHNsaWRlclBvcHVwLmNzcygndG9wJywgZ2V0QWJzb2x1dGVSZWN0KHVpLmhhbmRsZSkudG9wIC0gMTApO1xuICAgICAgICAgICAgc2xpZGVyUG9wdXAuY3NzKCdsZWZ0JywgZ2V0QWJzb2x1dGVSZWN0KHVpLmhhbmRsZSkubGVmdCArIDMwKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2xpZGU6IGZ1bmN0aW9uIHNsaWRlKGUsIHVpKSB7XG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5oYXNDbGFzcygnY3VycmVudC1kYXknKSkge1xuICAgICAgICAgICAgICAgIGlmICghaGFuZGxlQ3VycmVudERheSh1aSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0aGlzQ29vcmRzID0gZ2V0QWJzb2x1dGVSZWN0KHRoaXMpO1xuICAgICAgICAgICAgLy8gb25seSB0cmlnZ2VyaW5nIHRoZSBldmVudCBpZiBtb3VzZSBpcyBpbiBhIHJhbmdlIG9mIHRoZSBzbGlkZXJcbiAgICAgICAgICAgIGlmICghKGUucGFnZVggPCB0aGlzQ29vcmRzLnJpZ2h0ICsgMTAgJiYgZS5wYWdlWCA+IHRoaXNDb29yZHMubGVmdCAtIDEwICYmIGUucGFnZVkgPCB0aGlzQ29vcmRzLmJvdHRvbSArIDEwICYmIGUucGFnZVkgPiB0aGlzQ29vcmRzLnRvcCAtIDEwKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkaWZmVmFsdWVzID0gW107XG4gICAgICAgICAgICAvLyBwcmV2ZW50IGhhbmRsZSBvdmVybGFwcGluZ1xuICAgICAgICAgICAgZm9yICh2YXIgYSA9IDA7IGEgPCB1aS52YWx1ZXMubGVuZ3RoOyBhKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZGlmZlZhbHVlcy5pbmRleE9mKHVpLnZhbHVlc1thXSkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGlmZlZhbHVlcy5wdXNoKHVpLnZhbHVlc1thXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdiA9IDIzIC0gdWkudmFsdWU7XG4gICAgICAgICAgICBzbGlkZXJQb3B1cC50ZXh0KHYpO1xuICAgICAgICAgICAgc2xpZGVyUG9wdXAuY3NzKCd0b3AnLCBnZXRBYnNvbHV0ZVJlY3QodWkuaGFuZGxlKS50b3AgLSAxMCk7XG4gICAgICAgICAgICBzbGlkZXJQb3B1cC5jc3MoJ2xlZnQnLCBnZXRBYnNvbHV0ZVJlY3QodWkuaGFuZGxlKS5sZWZ0ICsgMzApO1xuICAgICAgICB9LFxuICAgICAgICBzdG9wOiBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgICAgICAgc2xpZGVyUG9wdXAuaGlkZSgpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgLy8gY29uc29sZSgnVkFMVUVTJywgdmFsdWVzKTtcbiAgICBpZiAodmFsdWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCdhY3RpdmUtc2xpZGVyJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZWN0b3IuYWRkQ2xhc3MoJ2FjdGl2ZS1zbGlkZXInKTtcbiAgICB9XG4gICAgc2V0RHJhZ2dhYmxlcygpO1xuICAgIHVwZGF0ZUFsbEhhbmRsZXMoKTtcbn1cblxuZnVuY3Rpb24gaW5pdEZpcnN0U2xpZGVyKHNlbGVjdG9yKSB7XG4gICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGdldERlZmF1bHRWYWx1ZShkYXl0aW1lX29uKTtcbiAgICBpZiAoZGVmYXVsdFZhbHVlID49IDIzIC0gc3RhcnRIb3VyKSB7XG4gICAgICAgIC8vIGNvbnNvbGUoJ2N1cnJlbnQgZGF5IHdpdGggYW4gZXhjZXB0aW9uJyk7XG4gICAgICAgIHZhciBuZXh0U2xpZGVyID0gZmluZE5leHRTbGlkZXIoc2VsZWN0b3IsIHRydWUpO1xuICAgICAgICBpbml0U2xpZGVyKCQobmV4dFNsaWRlcikpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGluaXRTbGlkZXIoc2VsZWN0b3IpO1xuICAgIH1cbiAgICBzZWxlY3Rvci5hZGRDbGFzcygnY3VycmVudC1kYXknKTtcbn1cblxuZnVuY3Rpb24gZmluZE5leHRTbGlkZXIoc2VsZWN0b3IsIGdvdG9uZXh0KSB7XG4gICAgdmFyIHRoaXNXZWVrU2xpZGVycyA9ICQoJy5mbGV4LWFjdGl2ZS1zbGlkZSAuZGVmYXVsdC13cmFwID4gZGl2Jyk7XG4gICAgdmFyIHNsaWRlckluZGV4ID0gdGhpc1dlZWtTbGlkZXJzLmluZGV4KHNlbGVjdG9yKTtcbiAgICAvLyBpZiBub3Qgc3VuZGF5XG4gICAgdmFyIG5leHRTbGlkZXI7XG4gICAgaWYgKHNsaWRlckluZGV4ICE9IDYpIHtcbiAgICAgICAgbmV4dFNsaWRlciA9IHRoaXNXZWVrU2xpZGVyc1tzbGlkZXJJbmRleCArIDFdO1xuICAgIH1cbiAgICAvLyBpZiBzdW5kYXlcbiAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBhY3RpdmVTbGlkZSA9ICQoJy5mbGV4LWFjdGl2ZS1zbGlkZScpWzBdO1xuICAgICAgICAgICAgdmFyIG5leHRTbGlkZSA9IGFjdGl2ZVNsaWRlLm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgICAgIG5leHRTbGlkZXIgPSAkKG5leHRTbGlkZSkuZmluZCgnLm1vbmRheScpO1xuICAgICAgICAgICAgaWYgKGdvdG9uZXh0KSBnb1RvTmV4dFNsaWRlKCk7XG4gICAgICAgIH1cbiAgICByZXR1cm4gbmV4dFNsaWRlcjtcbn1cblxuZnVuY3Rpb24gaGFuZGxlQ3VycmVudERheSh1aSkge1xuICAgIHJldHVybiB1aS52YWx1ZSA8IDIzIC0gc3RhcnRIb3VyO1xufVxuZnVuY3Rpb24gc2V0RHJhZ2dhYmxlcygpIHtcbiAgICAkKCcudWktc2xpZGVyLWhhbmRsZScpLm9mZignbW91c2Vkb3duJyk7XG4gICAgJCgnLnVpLXNsaWRlci1oYW5kbGUnKS5vbignbW91c2Vkb3duJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ21vdXNlZG93bicsIHRoaXMpO1xuICAgICAgICB2YXIgdGFyZ2V0SGFuZGxlID0gdGhpcztcbiAgICAgICAgJCh0YXJnZXRIYW5kbGUpLmZvY3VzKCk7IC8vIGZpeCBpbmNvcnJlY3QgZm9jdXMgYnVnXG4gICAgICAgIC8vIGNvbnNvbGUodGFyZ2V0SGFuZGxlKTtcbiAgICAgICAgdmFyIHRhcmdldFNsaWRlciA9ICQodGhpcykucGFyZW50KClbMF07XG4gICAgICAgIHZhciBoYW5kbGVJbmRleCA9ICQodGFyZ2V0U2xpZGVyKS5maW5kKCcudWktc2xpZGVyLWhhbmRsZScpLmluZGV4KHRhcmdldEhhbmRsZSk7XG4gICAgICAgIHZhciBzbGlkZXJJbmRleCA9ICQoJy5mbGV4LWFjdGl2ZS1zbGlkZSAuc2NhbGUtaXRlbSAuZGVmYXVsdC13cmFwID4gZGl2JykuaW5kZXgoJCh0YXJnZXRTbGlkZXIpKTtcbiAgICAgICAgdmFyIGNsb25lID0gJCh0aGlzKS5jbG9uZSgpLmFkZENsYXNzKCdoYW5kbGUtY2xvbmUnKTtcbiAgICAgICAgY2xvbmUuY3NzKCd3aWR0aCcsICQodGFyZ2V0SGFuZGxlKS53aWR0aCgpKS5jc3MoJ2hlaWdodCcsICQodGFyZ2V0SGFuZGxlKS5oZWlnaHQoKSk7XG4gICAgICAgIG1vdmVBdChlKTtcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZChjbG9uZSk7XG4gICAgICAgIC8vIGNvbnNvbGUoJ3NsaWRlckluZGV4Jywgc2xpZGVySW5kZXgpO1xuICAgICAgICBmdW5jdGlvbiBpbml0V3JhcEV2ZW50cygpIHtcbiAgICAgICAgICAgICQoJy5mbGV4LWFjdGl2ZS1zbGlkZSAuc2NhbGUtaXRlbSAuZGVmYXVsdC13cmFwJykuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSAhPT0gc2xpZGVySW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2F0dGFjaGluZyBldmVudCcsIGVsKTtcbiAgICAgICAgICAgICAgICAgICAgJChlbCkubW91c2V1cChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1NsaWRlciA9ICQoZS5jdXJyZW50VGFyZ2V0KS5maW5kKCdkaXYnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwbHlEcmFnQW5kRHJvcChlLCB0YXJnZXRTbGlkZXIsIG5ld1NsaWRlciwgaGFuZGxlSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBjbGVhcldyYXBFdmVudHMoKSB7XG4gICAgICAgICAgICAkKCcuZmxleC1hY3RpdmUtc2xpZGUgLnNjYWxlLWl0ZW0gLmRlZmF1bHQtd3JhcCcpLm9mZignbW91c2V1cCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5pdFdyYXBFdmVudHMoKTtcblxuICAgICAgICBmdW5jdGlvbiBtb3ZlQXQoZSkge1xuICAgICAgICAgICAgJCh0YXJnZXRIYW5kbGUpLmZvY3VzKCk7IC8vIGZpeCBpbmNvcnJlY3QgZm9jdXMgYnVnXG4gICAgICAgICAgICB2YXIgdGhpc0Nvb3JkcyA9IGdldEFic29sdXRlUmVjdCh0YXJnZXRTbGlkZXIpO1xuICAgICAgICAgICAgaWYgKGUucGFnZVggPCB0aGlzQ29vcmRzLnJpZ2h0ICsgMTAgJiYgZS5wYWdlWCA+IHRoaXNDb29yZHMubGVmdCAtIDEwICYmIGUucGFnZVkgPCB0aGlzQ29vcmRzLmJvdHRvbSArIDEwICYmIGUucGFnZVkgPiB0aGlzQ29vcmRzLnRvcCAtIDEwKSB7XG4gICAgICAgICAgICAgICAgY2xvbmUuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2xvbmUuY3NzKCdkaXNwbGF5JywgJ2luaXRpYWwnKTtcbiAgICAgICAgICAgICAgICBjbG9uZS5jc3MoJ2xlZnQnLCBlLnBhZ2VYIC0gY2xvbmUud2lkdGgoKSAvIDIpO1xuICAgICAgICAgICAgICAgIGNsb25lLmNzcygndG9wJywgZS5wYWdlWSAtIGNsb25lLmhlaWdodCgpIC8gMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgJCgnYm9keScpLm1vdXNlbW92ZShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ21vdXNlbW92ZScpO1xuICAgICAgICAgICAgbW92ZUF0KGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkKCdib2R5JykubW91c2V1cChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ21vdXNldXAnKTtcbiAgICAgICAgICAgICQoJ2JvZHknKS5vZmYoJ21vdXNlbW92ZScpO1xuICAgICAgICAgICAgJCgnYm9keScpLm9mZignbW91c2V1cCcpO1xuICAgICAgICAgICAgY2xvbmUucmVtb3ZlKCk7XG4gICAgICAgICAgICBjbGVhcldyYXBFdmVudHMoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5RHJhZ0FuZERyb3AoZSwgdGFyZ2V0U2xpZGVyLCBuZXdTbGlkZXIsIGhhbmRsZUluZGV4KSB7XG4gICAgaWYgKG5ld1NsaWRlci5oYXNDbGFzcygncGFzdC1kYXknKSkgcmV0dXJuO1xuICAgIGlmIChuZXdTbGlkZXIuaGFzQ2xhc3MoJ2N1cnJlbnQtZGF5JykpIHtcbiAgICAgICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGdldERlZmF1bHRWYWx1ZShkYXl0aW1lX29uKTtcbiAgICAgICAgaWYgKGRlZmF1bHRWYWx1ZSA+PSAyMyAtIHN0YXJ0SG91cikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKGUpO1xuICAgIHZhciBvbGRTbGlkZXJWYWx1ZXMgPSAkKHRhcmdldFNsaWRlcikuc2xpZGVyKCd2YWx1ZXMnKTtcbiAgICBvbGRTbGlkZXJWYWx1ZXMuc3BsaWNlKGhhbmRsZUluZGV4LCAxKTtcbiAgICB2YXIgd2FzQWRkZWQgPSBhZGRIYW5kbGUobmV3U2xpZGVyKTtcbiAgICAvLyBpZiBzbGlkZXIgYWN0dWFsbHkgZGlkbnQgdXBkYXRlIChub3QgZW5vdWdoIHBsYWNlKSwgZG8gbm90aGluZ1xuICAgIGlmICh3YXNBZGRlZCkge1xuICAgICAgICAkKHRhcmdldFNsaWRlcikuc2xpZGVyKCdkZXN0cm95Jyk7XG4gICAgICAgIGluaXRTbGlkZXIoJCh0YXJnZXRTbGlkZXIpLCBvbGRTbGlkZXJWYWx1ZXMpO1xuICAgIH1cbiAgICBzbGlkZXJQb3B1cC5oaWRlKCk7XG59XG5cbmZ1bmN0aW9uIGdldEl0ZW1zKCkge1xuICAgIHJldHVybiAkKCcuZmxleHNsaWRlciAuc2xpZGVzIC5pdGVtOm5vdCguY2xvbmUpJyk7XG59XG5cbmZ1bmN0aW9uIGFkZExhc3RXZWVrU2xpZGUoc2VsZWN0b3IpIHtcbiAgICB2YXIgY3R4ID0gc2VsZWN0b3IuZGF0YSgnZmxleHNsaWRlcicpO1xuXG4gICAgdmFyIHRlbXBsYXRlID0gJCgnPGxpIGNsYXNzPVwiaXRlbVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIml0ZW0td2Vla1wiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2NhbGUtd3JhcHBlclwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cImxpc3Qtc2NhbGUtd3JhcFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJ0aW1lcy13cmFwLWxlZnRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lLW1pblwiPjAwPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGltZS1tYXhcIj4yNDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJzY2FsZS1pdGVtXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF5XCI+TW9uPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYWRkLXRpbWVzLWxlZnRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC13cmFwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXNsaWRlciBtb25kYXlcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJzY2FsZS1pdGVtXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF5XCI+VHVlPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC13cmFwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtc2xpZGVyICB0dWVzZGF5XCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwic2NhbGUtaXRlbVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRheVwiPldlZDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtd3JhcFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXNsaWRlciB3ZWRuZXNkYXlcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJzY2FsZS1pdGVtXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF5XCI+VGg8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC13cmFwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtc2xpZGVyIHRodXJzZGF5XCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwic2NhbGUtaXRlbVwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRheVwiPkZyPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC13cmFwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtc2xpZGVyICBmcmlkYXlcIj48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJzY2FsZS1pdGVtXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF5XCI+U2F0PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC13cmFwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRlZmF1bHQtc2xpZGVyICBzYXR1cmRheVwiPjwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInNjYWxlLWl0ZW1cIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXlcIj5TdW48L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhZGQtdGltZXMtcmlnaHRcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVmYXVsdC13cmFwXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWZhdWx0LXNsaWRlciAgc3VuZGF5XCI+PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwidGltZXMtd3JhcC1yaWdodFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRpbWUtbWluXCI+MDA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0aW1lLW1heFwiPjI0PC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC91bD5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPicpO1xuICAgIGN0eC5hZGRTbGlkZSh0ZW1wbGF0ZSk7XG59XG5cbmZ1bmN0aW9uIGdvVG9OZXh0U2xpZGUoKSB7XG4gICAgJCgnLmZsZXgtbmV4dCcpLnRyaWdnZXIoJ2NsaWNrJyk7XG59XG5cbmZ1bmN0aW9uIGRheXRpbWVTbGlkZXJDaGFuZ2VzKCkge1xuICAgIGlmIChkYXl0aW1lX29uKSB7XG4gICAgICAgICQoJy5zd2l0Y2gtb24nKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5zd2l0Y2gtb2ZmJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcuZGVmYXVsdC13cmFwJykuYWRkQ2xhc3MoJ3NsaWRlLXdyYXAnKTtcbiAgICAgICAgJCgnLmRlZmF1bHQtc2xpZGVyJykuYWRkQ2xhc3MoJ3NsaWRlcicpO1xuICAgICAgICAkKCcuc2xpZGVyJykucmVtb3ZlQ2xhc3MoJ2RlZmF1bHQtc2xpZGVyJyk7XG5cbiAgICAgICAgJCgnLnNsaWRlcicpLnNsaWRlcih7XG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDIzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRheXRpbWVfb24gPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGRheXRpbWVfb24gPT0gZmFsc2UpIHtcbiAgICAgICAgJCgnLnN3aXRjaC1vZmYnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5zd2l0Y2gtb24nKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5zbGlkZS13cmFwJykuYWRkQ2xhc3MoJ2RlZmF1bHQtd3JhcCcpO1xuICAgICAgICAkKCcuZGVmYXVsdC13cmFwJykucmVtb3ZlQ2xhc3MoJ3NsaWRlLXdyYXAnKTtcbiAgICAgICAgJCgnLnNsaWRlcicpLmFkZENsYXNzKCdkZWZhdWx0LXNsaWRlcicpO1xuICAgICAgICAkKCcuZGVmYXVsdC1zbGlkZXInKS5yZW1vdmVDbGFzcygnc2xpZGVyJyk7XG5cbiAgICAgICAgZGF5dGltZV9vbiA9IHRydWU7XG4gICAgICAgICQoJy5kZWZhdWx0LXNsaWRlci5hY3RpdmUtc2xpZGVyJykuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSAkKGVsKS5zbGlkZXIoJ3ZhbHVlcycpO1xuICAgICAgICAgICAgJChlbCkuc2xpZGVyKCdkZXN0cm95Jyk7XG4gICAgICAgICAgICBpbml0U2xpZGVyKCQoZWwpLCB2YWx1ZXMpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFkZEhhbmRsZShzZWxlY3Rvcikge1xuICAgIHZhciAkc2xpZGVyID0gJChzZWxlY3Rvcik7XG4gICAgLy8gY29uc29sZS5sb2coJHNsaWRlcik7XG4gICAgdmFyIHBvc3NpYmxlQXJyID0gW107XG4gICAgLy8gYSBsaXN0IG9mIHBvc3NpYmxlIGhhbmRsZSB2YWx1ZXMgd2hpY2ggY2FuIGJlIGFkZGVkXG4gICAgaWYgKGRheXRpbWVfb24pIHBvc3NpYmxlQXJyID0gWzQsIDUsIDYsIDcsIDgsIDksIDEwLCAxMSwgMTIsIDEzLCAxNF07ZWxzZSB7XG4gICAgICAgIHBvc3NpYmxlQXJyID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShuZXcgQXJyYXkoMjQpLmtleXMoKSkpO1xuICAgIH1cbiAgICBpZiAoISRzbGlkZXIuaGFzQ2xhc3MoJ2FjdGl2ZS1zbGlkZXInKSkge1xuICAgICAgICB2YXIgZGVmYXVsdFZhbHVlID0gZ2V0RGVmYXVsdFZhbHVlKGRheXRpbWVfb24pO1xuICAgICAgICBpZiAoJHNsaWRlci5oYXNDbGFzcygnY3VycmVudC1kYXknKSAmJiBkZWZhdWx0VmFsdWUgPj0gMjMgLSBzdGFydEhvdXIpIHtcbiAgICAgICAgICAgIHZhciBuZXh0U2xpZGVyID0gZmluZE5leHRTbGlkZXIoc2VsZWN0b3IsIGZhbHNlKTtcbiAgICAgICAgICAgIC8vIGlmIG5leHQgc2xpZGVyIGlzIG9uIGFub3RoZXIgZmxleFNsaWRlXG4gICAgICAgICAgICBpZiAoJCgnLmZsZXgtYWN0aXZlLXNsaWRlIC5kZWZhdWx0LXdyYXAgPiBkaXYnKS5pbmRleChuZXh0U2xpZGVyKSA9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdmaXghJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkSGFuZGxlKG5leHRTbGlkZXIpO1xuICAgICAgICAgICAgJChuZXh0U2xpZGVyKS5hZGRDbGFzcygnYWN0aXZlLXNsaWRlcicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5pdFNsaWRlcigkc2xpZGVyKTtcbiAgICAgICAgICAgICRzbGlkZXIuYWRkQ2xhc3MoJ2FjdGl2ZS1zbGlkZXInKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSAkc2xpZGVyLnNsaWRlcigndmFsdWVzJyk7XG4gICAgICAgIHZhciBwb3NzaWJsZU5ld1ZhbHVlID0gdmFsdWVzW3ZhbHVlcy5sZW5ndGggLSAxXSAtIDQ7XG4gICAgICAgIGlmICh2YWx1ZXMuaW5kZXhPZihwb3NzaWJsZU5ld1ZhbHVlKSA9PT0gLTEgJiYgcG9zc2libGVBcnIuaW5kZXhPZihwb3NzaWJsZU5ld1ZhbHVlKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHZhbHVlcy5wdXNoKHBvc3NpYmxlTmV3VmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCRzbGlkZXIuaGFzQ2xhc3MoJ2N1cnJlbnQtZGF5JykpIHtcbiAgICAgICAgICAgICAgICBwb3NzaWJsZUFyciA9IHBvc3NpYmxlQXJyLmZpbHRlcihmdW5jdGlvbiAobnVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudW0gPj0gMjMgLSBzdGFydEhvdXIpIHJldHVybiBmYWxzZTtlbHNlIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9zc2libGVBcnIgPSBwb3NzaWJsZUFyci5maWx0ZXIoZnVuY3Rpb24gKG51bSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZXMuaW5kZXhPZihudW0pID09IC0xO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncG9zc2libGUgcmFuZG9tIHZhbHVlcycsIHBvc3NpYmxlQXJyKTtcbiAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IHBvc3NpYmxlQXJyLnJhbmRvbUVsZW1lbnQoKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyYW5kb20gbmV3IHZhbHVlJywgbmV3VmFsdWUpO1xuICAgICAgICAgICAgaWYgKG5ld1ZhbHVlICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKG5ld1ZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIGZhbHNlIGlmIG5vIHBsYWNlIHRvIGFkZFxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAkc2xpZGVyLnNsaWRlcignZGVzdHJveScpO1xuICAgICAgICBpbml0U2xpZGVyKCRzbGlkZXIsIHZhbHVlcyk7XG4gICAgfVxuICAgICRzbGlkZXIuZmluZCgnLnVpLXNsaWRlci1oYW5kbGU6bGFzdCcpLmZvY3VzKCk7XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGRlbGV0ZUhhbmRsZShoYW5kbGUpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhoYW5kbGUpO1xuICAgIHZhciAkc2xpZGVyID0gaGFuZGxlLnBhcmVudCgpO1xuICAgIHZhciBoYW5kbGVJbmRleCA9ICRzbGlkZXIuZmluZCgnLnVpLXNsaWRlci1oYW5kbGUnKS5pbmRleChoYW5kbGUpO1xuICAgIHZhciB2YWx1ZXMgPSAkc2xpZGVyLnNsaWRlcigndmFsdWVzJyk7XG4gICAgLy8gY29uc29sKCdvbGQgdmFsdWVzJywgdmFsdWVzKTtcbiAgICAvLyBjb25zb2woaGFuZGxlSW5kZXgpO1xuICAgIHZhbHVlcy5zcGxpY2UoaGFuZGxlSW5kZXgsIDEpO1xuICAgIC8vIGNvbnNvbCgnbmV3IHZhbHVlcycsIHZhbHVlcyk7XG4gICAgJHNsaWRlci5zbGlkZXIoJ2Rlc3Ryb3knKTtcbiAgICBpbml0U2xpZGVyKCRzbGlkZXIsIHZhbHVlcyk7XG59XG5cbmZ1bmN0aW9uIHNldFdlZWtUZXh0KHNsaWRlSW5kZXgpIHtcbiAgICB2YXIgc3RhcnRNID0gc3RhcnRNb21lbnQuY2xvbmUoKTtcbiAgICB2YXIgbSA9IHNsaWRlSW5kZXggPyBzdGFydE0uYWRkKHNsaWRlSW5kZXgsICd3JykgOiBzdGFydE07XG4gICAgdmFyIG1vbmRheSA9IG0uaXNvV2Vla2RheSgxKS5mb3JtYXQoJ0REJyk7XG4gICAgdmFyIHN1bmRheSA9IG0uaXNvV2Vla2RheSg3KS5mb3JtYXQoJ0REJyk7XG4gICAgdmFyIHRoaXNNb250aCA9IG0uZm9ybWF0KCdNTScpO1xuICAgICQoJy5pdGVtLXdlZWsnKS5odG1sKCdXZWVrICcgKyBtb25kYXkgKyAnLScgKyBzdW5kYXkgKyAnLicgKyB0aGlzTW9udGgpO1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVBbGxIYW5kbGVzKCkge1xuICAgIHZhciBjYWxjdWxhdGVkTW9tZW50cyA9IFtdOyAvLyBmaW5hbCBhcnJheVxuICAgIGNvbnNvbGUubG9nKCdjYWxjdWxhdGluZyBtb21lbnRzLi4uJyk7XG4gICAgdmFyIGFsbEZsZXhTbGlkZXMgPSAkKCcuZmxleHNsaWRlciAuc2xpZGVzIC5pdGVtOm5vdCguY2xvbmUpJyk7XG4gICAgYWxsRmxleFNsaWRlcy5lYWNoKGZ1bmN0aW9uIChpLCBzbGlkZSkge1xuICAgICAgICB2YXIgd2VlayA9IHN0YXJ0TW9tZW50LndlZWsoKSArIGk7XG4gICAgICAgIHZhciBhbGxXZWVrU2xpZGVycyA9ICQoc2xpZGUpLmZpbmQoJy5kZWZhdWx0LXdyYXAgPiBkaXYnKTtcbiAgICAgICAgYWxsV2Vla1NsaWRlcnMuZWFjaChmdW5jdGlvbiAoaSwgc2xpZGVyKSB7XG4gICAgICAgICAgICB2YXIgZGF5ID0gMSArIGk7XG4gICAgICAgICAgICBpZiAoJChzbGlkZXIpLmhhc0NsYXNzKCdhY3RpdmUtc2xpZGVyJykpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWVzID0gJChzbGlkZXIpLnNsaWRlcigndmFsdWVzJyk7XG4gICAgICAgICAgICAgICAgdmFyIGhvdXJzID0gdmFsdWVzLm1hcChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDIzIC0gZWw7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaG91cnMuZm9yRWFjaChmdW5jdGlvbiAoaG91cikge1xuICAgICAgICAgICAgICAgICAgICBjYWxjdWxhdGVkTW9tZW50cy5wdXNoKG1vbWVudCgpLnllYXIoc3RhcnRNb21lbnQueWVhcigpKS5tb250aChzdGFydE1vbWVudC5tb250aCgpKS53ZWVrKHdlZWspLmRheShkYXkpLmhvdXIoaG91cikubWludXRlKDApLnNlY29uZCgwKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIC8vIGFkZGl0aW9uYWwgdmFsaWRhdGluZywgaW5jYXNlIGhhbmRsZXMgd2VudCB0byBwYXN0IGRheXMvaG91cnNcbiAgICBjYWxjdWxhdGVkTW9tZW50cyA9IGNhbGN1bGF0ZWRNb21lbnRzLmZpbHRlcihmdW5jdGlvbiAobW9tKSB7XG4gICAgICAgIHZhciBjYW50R29QYXN0ID0gc3RhcnRNb21lbnQuY2xvbmUoKS5ob3VyKHN0YXJ0SG91ciArIDEpLm1pbnV0ZSgwKS5zZWNvbmQoMCk7XG4gICAgICAgIHJldHVybiBtb20udW5peCgpID49IGNhbnRHb1Bhc3QudW5peCgpO1xuICAgIH0pO1xuXG4gICAgdmFyIGluQ29uc29sZSA9IGNhbGN1bGF0ZWRNb21lbnRzLm1hcChmdW5jdGlvbiAobW9tKSB7XG4gICAgICAgIHJldHVybiBtb20uZm9ybWF0KCdMTEwnKTtcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKGluQ29uc29sZSk7XG4gICAgY29uc29sZS5sb2coJ29iamVjdCByZXR1cm5lZCAtPiAnLCBjYWxjdWxhdGVkTW9tZW50cyk7XG59XG5cbn0se31dfSx7fSxbMV0pO1xuIl0sImZpbGUiOiJtYWluLmpzIn0=
