Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
};
var sliderPopup;
$(window).ready(()=> {
    $('body').append('<div id="slider-popup"></div>');
    sliderPopup = $('#slider-popup');
});
var daytime_on = true;
function filterValues(values, daytime_on) {
    if (daytime_on) {
        console.log('filtering...', values);
        values = values.filter((v) => {
            if (v <= 14 && v >= 4) {
                return true;
            } else {
                return false;
            }
        })
    }
    console.log(values);
    return values;
}
function getDefaultValue(daytime_on) {
    var value = 23 - (moment().hour() + 1);
    if (daytime_on) {
        if (value < 4) value = 4;
        else if (value > 14) value = 14;
    }
    return value;
}
export function initSlider(selector, values) {
    values = values ? filterValues(values, daytime_on) : [getDefaultValue(daytime_on)];
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
            sliderPopup.css('top', ui.handle.getBoundingClientRect().top - 10);
            sliderPopup.css('left', ui.handle.getBoundingClientRect().left + 30);
        },
        slide: function (e, ui) {
            var thisCoords = this.getBoundingClientRect();
            // only triggering the event if mouse is in a range of the slider
            if (!(e.pageX < thisCoords.right && e.pageX > thisCoords.left
                && e.pageY < thisCoords.bottom && e.pageY > thisCoords.top)) {return false;}
            let diffValues = [];
            console.log(ui.values);
            // prevent handle overlapping
            for (let a = 0; a < ui.values.length; a++) {
                if (diffValues.indexOf(ui.values[a]) > -1) {
                    return false;
                } else {
                    diffValues.push(ui.values[a]);
                }
            }

            let v = 23 - ui.value;
            sliderPopup.text(v);
            sliderPopup.css('top', ui.handle.getBoundingClientRect().top - 10);
            sliderPopup.css('left', ui.handle.getBoundingClientRect().left + 30);
            $(".contentSlider").html(v + ' hour');
        },
        stop: () => {
            sliderPopup.hide();
        },
    });
    console.log('VALUES', values);
    if (values.length == 0) {
        selector.removeClass('active-slider');
    } else {
        selector.addClass('active-slider');
    }
    setDraggable();
}

function setDraggable() {
    $('.ui-slider-handle').off('mousedown');
    $('.ui-slider-handle').on('dragstart', function(e) {
        e.preventDefault();
    });
    $('.ui-slider-handle').on('mousedown', function(e) {
            console.log('mousedown', this);
            var targetHandle = this;
            var targetSlider = $(this).parent()[0];
            console.log(targetSlider);
            var clone = $(this).clone();
            clone.css('position', 'absolute');
            clone.css('width', '25px').css('height', '9px').css('left', '0').css('top', 0).css('opacity', 0.5);
            $('body').append(clone);
            function moveAt(e) {
                var thisCoords = targetSlider.getBoundingClientRect();
                if (e.pageX < thisCoords.right && e.pageX > thisCoords.left
                    && e.pageY < thisCoords.bottom && e.pageY > thisCoords.top) {
                    clone.css('display', 'none');
                } else {
                    clone.css('display', 'initial');
                    clone.css('left', e.pageX - clone.width()/2);
                    clone.css('top', e.pageY - clone.height()/2);
                }


            }
            $('body').mousemove(function(e) {
                console.log('mousemove');
                moveAt(e);
            });

            $('body').mouseup(function() {
                console.log('mouseup');
                $('body').off('mouseup');
                $('body').off('mousemove');
                clone.remove();

                // var values = $(targetHandle).parent().slider('values');
                // console.log(values);
                // initSlider($(targetHandle).parent(), values);
            });
        })
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
                                                    <div class="monday default-slider slide-active"></div>
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
    console.log($('.flex-active-slide .active-slider').slider('values'));
}

export function addHandle() {
    var active = $('.flex-active-slide');
    var monday = active.find('.monday');
    var possibleArr = [];
    // a list of possible handle values which can be added
    if (daytime_on) possibleArr = [4,5,6,7,8,9,10,11,12,13,14];
    else {
        possibleArr = [...new Array(24).keys()];
    }

    if (!monday.hasClass('active-slider')) {
        initSlider(monday);
        monday.addClass('active-slider');
    } else {
        var value = monday.slider('value');
        var values = monday.slider('values');
        console.log(value, values);
        let possibleNewValue = values[values.length-1] - 1;
        if (values.indexOf(possibleNewValue) === -1 && possibleArr.indexOf(possibleNewValue) !== -1) {
            values.push(values[values.length-1] - 1);
        } else {
            possibleArr = possibleArr.filter((num) => {
                return values.indexOf(num) == -1;
            });
            // console.log('possible random values', possibleArr);
            let newValue = possibleArr.randomElement();
            // console.log('random new value', newValue);
            if (newValue != undefined) {
                values.push(newValue);
            } else  {
                // console.log('no choices left! Nothing to add');
            }

            console.log(values);

        }
        monday.slider('destroy');
        initSlider(monday, values);
    }
    monday.find('.ui-slider-handle:last').focus();
}

export function deleteHandle(handle) {
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