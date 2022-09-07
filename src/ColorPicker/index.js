import Element from '../Element';
import Overlay from '../Overlay';
import NumericInput from '../NumericInput';
import TextInput from '../TextInput';

const CLASS_COLOR_INPUT = 'pcui-color-input';
const CLASS_NOT_FLEXIBLE = 'pcui-not-flexible';
const CLASS_MULTIPLE_VALUES = 'pcui-multiple-values';

/**
 * @name ColorPicker
 * @augments Element
 * @class
 * @classdesc Represents a color picker
 * @property {Array} value An optional array of 4 integers containing the RGBA values the picker should be initialised to
 * @property {number} channels=3 Number of color channels; default is 3, changing to 4 adds the option to change the alpha value
 */
class ColorPicker extends Element {
    /**
     * Creates a new ColorPicker.
     *
     * @param {object} args - The arguments. Extends the Element arguments. Any settable property can also be set through the constructor.
     */
    constructor(args) {
        if (!args) args = {};

        super(args.dom ? args.dom : document.createElement('div'), args);

        this.size = 144;
        this.directInput = true;
        this.colorHSV = [0, 0, 0];
        this.pickerChannels = [];
        this.channelsNumber = 4;
        this.changing = false;
        this.dragging = false;

        this.callingCallback = false;

        this.dom.classList.add(CLASS_COLOR_INPUT);
        this.dom.classList.add(CLASS_NOT_FLEXIBLE);

        // this element shows the actual color. The
        // parent element shows the checkerboard pattern
        this._domColor = document.createElement('div');
        this.dom.appendChild(this._domColor);

        this._domEventKeyDown = this._onKeyDown.bind(this);
        this._domEventFocus = this._onFocus.bind(this);
        this._domEventBlur = this._onBlur.bind(this);

        this._pickRectMouseMove = this._pickRectMouseMove.bind(this);
        this._pickRectMouseUp = this._pickRectMouseUp.bind(this);

        this._pickHueMouseMove = this._pickHueMouseMove.bind(this);
        this._pickHueMouseUp = this._pickHueMouseUp.bind(this);

        this._pickOpacityMouseMove = this._pickOpacityMouseMove.bind(this);
        this._pickOpacityMouseUp = this._pickOpacityMouseUp.bind(this);

        this._closePicker = this._closePicker.bind(this);

        this.dom.addEventListener('keydown', this._domEventKeyDown);
        this.dom.addEventListener('focus', this._domEventFocus);
        this.dom.addEventListener('blur', this._domEventBlur);

        this.on('click', () => {
            if (!this.enabled || this.readOnly) return;
            this._openColorPicker();
        });

        this._historyCombine = false;
        this._historyPostfix = null;

        this._value = args.value || [0, 0, 255, 1];
        this._channels = args.channels || 3;
        this._setValue(this._value);

        this._isColorPickerOpen = false;

        this.renderChanges = args.renderChanges || false;

        this.on('change', () => {
            if (this.renderChanges) {
                this.flash();
            }
        });

        // overlay
        this.overlay = new Overlay();
        this.overlay.clickable = true;
        this.overlay.class.add('picker-color');
        this.overlay.center = false;
        this.overlay.transparent = true;
        this.overlay.hidden = true;
        this.dom.appendChild(this.overlay.element);

        // rectangular picker
        this.pickRect = document.createElement('div');
        this.pickRect.classList.add('pick-rect');
        this.overlay.append(this.pickRect);

        this.pickRect.addEventListener('mousedown', function (evt) {
            this._pickRectMouseMove(evt);

            window.addEventListener('mousemove', this._pickRectMouseMove, false);
            window.addEventListener('mouseup', this._pickRectMouseUp, false);

            evt.stopPropagation();
            evt.preventDefault();
            this.dragging = true;
            this.emit('picker:color:start');
        }.bind(this));

        // white
        this.pickRectWhite = document.createElement('div');
        this.pickRectWhite.classList.add('white');
        this.pickRect.appendChild(this.pickRectWhite);

        // black
        this.pickRectBlack = document.createElement('div');
        this.pickRectBlack.classList.add('black');
        this.pickRect.appendChild(this.pickRectBlack);

        // handle
        this.pickRectHandle = document.createElement('div');
        this.pickRectHandle.classList.add('handle');
        this.pickRect.appendChild(this.pickRectHandle);

        // hue (rainbow) picker
        this.pickHue = document.createElement('div');
        this.pickHue.classList.add('pick-hue');
        this.overlay.append(this.pickHue);

        // hue drag start
        this.pickHue.addEventListener('mousedown', function (evt) {
            this._pickHueMouseMove(evt);

            window.addEventListener('mousemove', this._pickHueMouseMove, false);
            window.addEventListener('mouseup', this._pickHueMouseUp, false);

            evt.stopPropagation();
            evt.preventDefault();
            this.dragging = true;
            this.emit('picker:color:start');
        }.bind(this));

        // handle
        this.pickHueHandle = document.createElement('div');
        this.pickHueHandle.classList.add('handle');
        this.pickHue.appendChild(this.pickHueHandle);


        // opacity (gradient) picker
        this.pickOpacity = document.createElement('div');
        this.pickOpacity.classList.add('pick-opacity');
        this.overlay.append(this.pickOpacity);

        // opacoty drag start
        this.pickOpacity.addEventListener('mousedown', function (evt) {
            this._pickOpacityMouseMove(evt);

            window.addEventListener('mousemove', this._pickOpacityMouseMove, false);
            window.addEventListener('mouseup', this._pickOpacityMouseUp, false);

            evt.stopPropagation();
            evt.preventDefault();
            this.dragging = true;
            this.emit('picker:color:start');
        }.bind(this));

        // handle
        this.pickOpacityHandle = document.createElement('div');
        this.pickOpacityHandle.classList.add('handle');
        this.pickOpacity.appendChild(this.pickOpacityHandle);


        // fields
        this.panelFields = document.createElement('div');
        this.panelFields.classList.add('fields');
        this.overlay.append(this.panelFields);

        this.evtColorPick = null;
        this.evtColorToPicker = null;
        this.evtColorPickStart = null;
        this.evtColorPickEnd = null;

        this.overlay.on('hide', function () {
            this.evtColorPick.unbind();
            this.evtColorPick = null;

            this.evtColorToPicker.unbind();
            this.evtColorToPicker = null;

            this.evtColorPickStart.unbind();
            this.evtColorPickStart = null;

            this.evtColorPickEnd.unbind();
            this.evtColorPickEnd = null;
        }.bind(this));

        // R
        this.fieldR = new NumericInput({
            precision: 1,
            step: 1,
            min: 0,
            max: 255
        });

        this.pickerChannels.push(this.fieldR);
        this.fieldR.renderChanges = false;
        this.fieldR.placeholder = 'r';
        this.fieldR.flexGrow = 1;
        this.fieldR.class.add('field', 'field-r');
        this.fieldR.on('change', this._updateRects.bind(this));
        this.panelFields.appendChild(this.fieldR.element);

        // G
        this.fieldG = new NumericInput({
            precision: 1,
            step: 1,
            min: 0,
            max: 255
        });
        this.pickerChannels.push(this.fieldG);
        this.fieldG.renderChanges = false;
        this.fieldG.placeholder = 'g';
        this.fieldG.class.add('field', 'field-g');
        this.fieldG.on('change', this._updateRects.bind(this));
        this.panelFields.appendChild(this.fieldG.element);

        // B
        this.fieldB = new NumericInput({
            precision: 1,
            step: 1,
            min: 0,
            max: 255
        });
        this.pickerChannels.push(this.fieldB);
        this.fieldB.renderChanges = false;
        this.fieldB.placeholder = 'b';
        this.fieldB.class.add('field', 'field-b');
        this.fieldB.on('change', this._updateRects.bind(this));
        this.panelFields.appendChild(this.fieldB.element);

        this.fieldA = new NumericInput({
            precision: 1,
            step: 1,
            min: 0,
            max: 255
        });
        this.pickerChannels.push(this.fieldA);
        this.fieldA.renderChanges = false;
        this.fieldA.placeholder = 'a';
        this.fieldA.class.add('field', 'field-a');
        this.fieldA.on('change', this._updateRectAlpha.bind(this));
        this.panelFields.appendChild(this.fieldA.element);


        // HEX
        this.fieldHex = new TextInput();
        this.fieldHex.renderChanges = false;
        this.fieldHex.placeholder = '#';
        this.fieldHex.class.add('field', 'field-hex');
        this.fieldHex.on('change', this._updateHex.bind(this));
        this.panelFields.appendChild(this.fieldHex.element);
    }

    focus() {
        this.dom.focus();
    }

    blur() {
        this.dom.blur();
    }

    _onKeyDown(evt) {
        // escape blurs the field
        if (evt.keyCode === 27) {
            this.blur();
        }

        // enter opens the color picker
        if (evt.keyCode !== 13 || !this.enabled || this.readOnly) {
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();

    }

    _onFocus(evt) {
        this.emit('focus');
    }

    _onBlur(evt) {
        this.emit('blur');
    }

    _closePicker() {
        this.overlay.hidden = true;
        this._isColorPickerOpen = false;
        this.focus();
    }

    _getColorRect() {
        return this.overlay.rect;
    }

    _setColorPickerPosition(x, y) {
        this.overlay.position(x, y);
    }

    _setPickerColor(color) {
        if (this.changing || this.dragging)
            return;

        if (this.channelsNumber >= 3) {
            const hsv = this._rgb2hsv(color);
            this.colorHSV[0] = hsv[0];
            this.colorHSV[1] = hsv[1];
            this.colorHSV[2] = hsv[2];
        }

        // set fields
        this.directInput = false;
        for (let i = 0; i < color.length; i++) {
            this.pickerChannels[i].value = color[i];
        }
        this.fieldHex.value = this._getHex();
        this.directInput = true;
    }

    _openColorPicker() {
        this._isColorPickerOpen = true;

        // open color picker
        this._callPicker(this.value.map(c => Math.floor(c * 255)));

        // picked color
        this.evtColorPick = this.on('picker:color', (color) => {
            this.value = color.map(c => c / 255);
        });

        this.evtColorPickStart = this.on('picker:color:start', () => {
            if (this.binding) {
                this._historyCombine = this.binding.historyCombine;
                this._historyPostfix = this.binding.historyPostfix;

                this.binding.historyCombine = true;
                this._binding.historyPostfix = `(${Date.now()})`;

            } else {
                this._historyCombine = false;
                this._historyPostfix = null;
            }
        });

        this.evtColorPickEnd = this.on('picker:color:end', () => {
            if (this.binding) {
                this.binding.historyCombine = this._historyCombine;
                this.binding.historyPostfix = this._historyPostfix;
            }
        });

        // position picker
        const rectPicker = this.overlay.dom.getBoundingClientRect();
        const rectElement = this.dom.getBoundingClientRect();
        this._setColorPickerPosition(rectElement.left - rectPicker.width, rectElement.top);

        // color changed, update picker
        this.evtColorToPicker = this.on('change', () => {
            this._setPickerColor(this.value.map(c => Math.floor(c * 255)));
        });
    }

    _callPicker(color) {
        // class for channels
        for (let i = 0; i < 4; i++) {
            if (color.length - 1 < i) {
                this.overlay.class.remove('c-' + (i + 1));
            } else {
                this.overlay.class.add('c-' + (i + 1));
            }
        }

        // number of channels
        this.channelsNumber = color.length;

        if (this.channelsNumber >= 3) {
            const hsv = this._rgb2hsv(color);
            this.colorHSV[0] = hsv[0];
            this.colorHSV[1] = hsv[1];
            this.colorHSV[2] = hsv[2];
        }

        // set fields
        this.directInput = false;
        for (let i = 0; i < color.length; i++) {
            this.pickerChannels[i].value = color[i];
        }
        this.fieldHex.value = this._getHex();
        this.directInput = true;

        // show overlay
        this.overlay.hidden = false;

        // focus on hex field
        // TODO
        this.fieldHex._dom.focus();

        setTimeout(function () {
            this.fieldHex._dom.focus();
        }.bind(this), 100);
    }

    _valueToColor(value) {
        value = Math.floor(value * 255);
        return Math.max(0, Math.min(value, 255));

    }

    _setValue(value) {
        const r = this._valueToColor(value[0]);
        const g = this._valueToColor(value[1]);
        const b = this._valueToColor(value[2]);
        const a = value[3];

        if (this._channels === 1) {
            this._domColor.style.backgroundColor = `rgb(${r}, ${r}, ${r})`;
        } else if (this._channels === 3) {
            this._domColor.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        } else if (this._channels === 4) {
            this._domColor.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
        }
    }

    _updateValue(value) {
        let dirty = false;
        for (let i = 0; i < value.length; i++) {
            if (this._value[i] !== value[i]) {
                dirty = true;
                this._value[i] = value[i];
            }
        }

        this.dom.classList.remove(CLASS_MULTIPLE_VALUES);

        if (dirty) {
            this._setValue(value);

            this.emit('change', value);
        }

        return dirty;
    }

    // get hex from channels
    _getHex() {
        let hex = '';
        for (let i = 0; i < this.channelsNumber; i++) {
            hex += ('00' + this.pickerChannels[i].value.toString(16)).slice(-2).toUpperCase();
        }
        return hex;
    }

    // rect drag
    _pickRectMouseMove(evt) {
        this.changing = true;
        const rect = this.pickRect.getBoundingClientRect();
        const x = Math.max(0, Math.min(this.size, Math.floor(evt.clientX - rect.left)));
        const y = Math.max(0, Math.min(this.size, Math.floor(evt.clientY - rect.top)));

        this.colorHSV[1] = x / this.size;
        this.colorHSV[2] = 1.0 - (y / this.size);

        this.directInput = false;
        const rgb = this._hsv2rgb([this.colorHSV[0], this.colorHSV[1], this.colorHSV[2]]);
        for (let i = 0; i < 3; i++) {
            this.pickerChannels[i].value = rgb[i];
        }
        this.fieldHex.value = this._getHex();
        this.directInput = true;

        this.pickRectHandle.style.left = Math.max(4, Math.min(this.size - 4, x)) + 'px';
        this.pickRectHandle.style.top = Math.max(4, Math.min(this.size - 4, y)) + 'px';
        this.changing = false;
    }

    // rect drag stop
    _pickRectMouseUp() {
        window.removeEventListener('mousemove', this._pickRectMouseMove, false);
        window.removeEventListener('mouseup', this._pickRectMouseUp, false);
        this.dragging = false;
        this.emit('picker:color:end');
    }

    // hue drag
    _pickHueMouseMove(evt) {
        this.changing = true;
        const rect = this.pickHue.getBoundingClientRect();
        const y = Math.max(0, Math.min(this.size, Math.floor(evt.clientY - rect.top)));
        const h = y / this.size;

        const rgb = this._hsv2rgb([h, this.colorHSV[1], this.colorHSV[2]]);
        this.colorHSV[0] = h;

        this.directInput = false;
        for (let i = 0; i < 3; i++) {
            this.pickerChannels[i].value = rgb[i];
        }
        this.fieldHex.value = this._getHex();
        this._updateRects();
        this.directInput = true;
        this.changing = false;
    }

    // hue drag stop
    _pickHueMouseUp() {
        window.removeEventListener('mousemove', this._pickHueMouseMove, false);
        window.removeEventListener('mouseup', this._pickHueMouseUp, false);
        this.dragging = false;
        this.emit('picker:color:end');
    }

    // opacity drag
    _pickOpacityMouseMove(evt) {
        this.changing = true;
        const rect = this.pickOpacity.getBoundingClientRect();
        const y = Math.max(0, Math.min(this.size, Math.floor(evt.clientY - rect.top)));
        const o = 1.0 - y / this.size;

        this.directInput = false;
        this.fieldA.value = Math.max(0, Math.min(255, Math.round(o * 255)));
        this.fieldHex.value = this._getHex();
        this.directInput = true;
        this.changing = false;
    }

    _pickOpacityMouseUp() {
        window.removeEventListener('mousemove', this._pickOpacityMouseMove, false);
        window.removeEventListener('mouseup', this._pickOpacityMouseUp, false);
        this.dragging = false;
        this.emit('picker:color:end');
    }

    _updateHex() {
        if (!this.directInput)
            return;

        this.changing = true;

        const hex = this.fieldHex.value.trim().toLowerCase();
        if (/^([0-9a-f]{2}){3,4}$/.test(hex)) {
            for (let i = 0; i < this.channelsNumber; i++) {
                this.pickerChannels[i].value = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
            }
        }
        this.changing = false;
    }

    _rgb2hsv(rgb) {
        let rr, gg, bb;
        const r = rgb[0] / 255,
            g = rgb[1] / 255,
            b = rgb[2] / 255;
        let h, s;
        const v = Math.max(r, g, b),
            diff = v - Math.min(r, g, b),
            diffc = function (c) {
                return (v - c) / 6 / diff + 1 / 2;
            };

        if (diff == 0) {
            h = s = 0;
        } else {
            s = diff / v;
            rr = diffc(r);
            gg = diffc(g);
            bb = diffc(b);

            if (r === v) {
                h = bb - gg;
            } else if (g === v) {
                h = (1 / 3) + rr - bb;
            } else if (b === v) {
                h = (2 / 3) + gg - rr;
            }
            if (h < 0) {
                h += 1;
            } else if (h > 1) {
                h -= 1;
            }
        }
        return [h, s, v];
    }

    _hsv2rgb(hsv) {
        let h = hsv[0];
        let s = hsv[1];
        let v = hsv[2];
        let r, g, b;
        if (h && s === undefined && v === undefined) {
            s = h.s;
            v = h.v;
            h = h.h;
        }
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
                r = v;
                g = p;
                b = q;
                break;
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    _updateRects() {
        const color = this.pickerChannels.map(function (channel) {
            return channel.value || 0;
        }).slice(0, this.channelsNumber);

        const hsv = this._rgb2hsv(color);
        if (this.directInput) {
            const sum = color[0] + color[1] + color[2];
            if (sum !== 765 && sum !== 0)
                this.colorHSV[0] = hsv[0];

            this.colorHSV[1] = hsv[1];
            this.colorHSV[2] = hsv[2];

            this.dragging = true;
            this.emit('picker:color:start');
        }

        // hue position
        this.pickHueHandle.style.top = Math.floor(this.size * this.colorHSV[0]) + 'px'; // h

        // rect position
        this.pickRectHandle.style.left = Math.max(4, Math.min(this.size - 4, this.size * this.colorHSV[1])) + 'px'; // s
        this.pickRectHandle.style.top = Math.max(4, Math.min(this.size - 4, this.size * (1.0 - this.colorHSV[2]))) + 'px'; // v

        if (this.channelsNumber >= 3) {
            const plainColor = this._hsv2rgb([this.colorHSV[0], 1, 1]).join(',');

            // rect background color
            this.pickRect.style.backgroundColor = 'rgb(' + plainColor + ')';

            // rect handle color
            this.pickRectHandle.style.backgroundColor = 'rgb(' + color.slice(0, 3).join(',') + ')';

            // hue handle color
            this.pickHueHandle.style.backgroundColor = 'rgb(' + plainColor + ')';
        }

        this.callCallback();
    }

    // update alpha handle
    _updateRectAlpha(value) {
        if (this.channelsNumber !== 4)
            return;

        // position
        this.pickOpacityHandle.style.top = Math.floor(this.size * (1.0 - (Math.max(0, Math.min(255, value)) / 255))) + 'px';

        // color
        this.pickOpacityHandle.style.backgroundColor = 'rgb(' + [value, value, value].join(',') + ')';

        this.callCallback();
    }


    callbackHandle() {
        this.callingCallback = false;

        this.emit('picker:color', this.pickerChannels.map(function (channel) {
            return channel.value || 0;
        }).slice(0, this.channelsNumber));
    }

    callCallback() {
        if (this.callingCallback)
            return;

        this.callingCallback = true;
        setTimeout(this.callbackHandle.bind(this), 1000 / 60);
    }

    destroy() {
        if (this._destroyed) return;
        this.dom.removeEventListener('keydown', this._domEventKeyDown);
        this.dom.removeEventListener('focus', this._domEventFocus);
        this.dom.removeEventListener('blur', this._domEventBlur);
        super.destroy();
    }

    set value(value) {
        value = value || [0, 0, 0, 0];
        const changed = this._updateValue(value);

        if (changed && this._binding) {
            this._binding.setValue(value);
        }
    }

    get value() {
        return this._value.slice(0, this._channels);
    }

    set values(values) {
        let different = false;
        const value = values[0];
        for (let i = 1; i < values.length; i++) {
            if (Array.isArray(value)) {
                if (!value.equals(values[i])) {
                    different = true;
                    break;
                }
            } else {
                if (value !== values[i]) {
                    different = true;
                    break;
                }
            }
        }

        if (different) {
            this.value = null;
            this.dom.classList.add(CLASS_MULTIPLE_VALUES);
        } else {
            this.value = values[0];
        }
    }

    get values() {
        return this.values;
    }

    set channels(value) {
        if (this._channels === value) return;
        this._channels = Math.max(0, Math.min(value, 4));
        this._setValue(this.value);
    }

    get channels() {
        return this._channels;
    }
}

Element.register('div', ColorPicker);

export default ColorPicker;
