import Element, { ElementArgs } from '../Element/index';
import Overlay from '../Overlay/index';
import NumericInput from '../NumericInput/index';
import TextInput from '../TextInput/index';
import { _hsv2rgb, _rgb2hsv } from '../../Math/color-value';

const CLASS_COLOR_INPUT = 'pcui-color-input';
const CLASS_NOT_FLEXIBLE = 'pcui-not-flexible';
const CLASS_MULTIPLE_VALUES = 'pcui-multiple-values';

export interface ColorPickerArgs extends ElementArgs {
    renderChanges?: boolean;
    /**
     * An optional array of 4 integers containing the RGBA values the picker should be initialized to.
     */
    value?: Array<number>;
    /**
     * Number of color channels; default is 3, changing to 4 adds the option to change the alpha value.
     */
    channels?: number;
}

/**
 * Represents a color picker
 */
class ColorPicker extends Element {
    static readonly defaultArgs: ColorPickerArgs = {
        ...Element.defaultArgs,
        channels: 3,
        value: [0, 0, 255, 1],
        renderChanges: false,
        dom: 'div'
    };

    protected _domColor: HTMLDivElement;

    protected _domEventKeyDown: any;

    protected _domEventFocus: any;

    protected _domEventBlur: any;

    protected _historyCombine: boolean;

    protected _historyPostfix: any;

    protected _value: number[];

    protected _channels: number;

    protected _isColorPickerOpen: boolean;

    protected _size: number;

    protected _directInput: boolean;

    protected _colorHSV: number[];

    protected _pickerChannels: any[];

    protected _channelsNumber: number;

    protected _changing: boolean;

    protected _dragging: boolean;

    protected _callingCallback: boolean;

    protected _overlay: Overlay;

    protected _pickRect: HTMLDivElement;

    protected _pickRectWhite: HTMLDivElement;

    protected _pickRectBlack: HTMLDivElement;

    protected _pickRectHandle: HTMLDivElement;

    protected _pickHue: HTMLDivElement;

    protected _pickHueHandle: HTMLDivElement;

    protected _pickOpacity: HTMLDivElement;

    protected _pickOpacityHandle: HTMLDivElement;

    protected _panelFields: HTMLDivElement;

    protected _evtColorPick: any;

    protected _evtColorToPicker: any;

    protected _evtColorPickStart: any;

    protected _evtColorPickEnd: any;

    protected _fieldR: NumericInput;

    protected _fieldG: NumericInput;

    protected _fieldB: NumericInput;

    protected _fieldA: NumericInput;

    protected _fieldHex: TextInput;

    renderChanges: any;

    constructor(args: ColorPickerArgs = ColorPicker.defaultArgs) {
        args = { ...ColorPicker.defaultArgs, ...args };
        super(args.dom, args);

        this._size = 144;
        this._directInput = true;
        this._colorHSV = [0, 0, 0];
        this._pickerChannels = [];
        this._channelsNumber = 4;
        this._changing = false;
        this._dragging = false;

        this._callingCallback = false;

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

        this._value = args.value;
        this._channels = args.channels;
        this._setValue(this._value);

        this._isColorPickerOpen = false;

        this.renderChanges = args.renderChanges;

        this.on('change', () => {
            if (this.renderChanges) {
                this.flash();
            }
        });

        // overlay
        this._overlay = new Overlay();
        this._overlay.clickable = true;
        this._overlay.class.add('picker-color');
        // @ts-ignore center not a property of Overlay
        this._overlay.center = false;
        this._overlay.transparent = true;
        this._overlay.hidden = true;
        this.dom.appendChild(this._overlay.element);

        // rectangular picker
        this._pickRect = document.createElement('div');
        this._pickRect.classList.add('pick-rect');
        this._overlay.append(this._pickRect);

        this._pickRect.addEventListener('mousedown', function (evt: MouseEvent) {
            this._pickRectMouseMove(evt);

            window.addEventListener('mousemove', this._pickRectMouseMove, false);
            window.addEventListener('mouseup', this._pickRectMouseUp, false);

            evt.stopPropagation();
            evt.preventDefault();
            this.dragging = true;
            this.emit('picker:color:start');
        }.bind(this));

        // white
        this._pickRectWhite = document.createElement('div');
        this._pickRectWhite.classList.add('white');
        this._pickRect.appendChild(this._pickRectWhite);

        // black
        this._pickRectBlack = document.createElement('div');
        this._pickRectBlack.classList.add('black');
        this._pickRect.appendChild(this._pickRectBlack);

        // handle
        this._pickRectHandle = document.createElement('div');
        this._pickRectHandle.classList.add('handle');
        this._pickRect.appendChild(this._pickRectHandle);

        // hue (rainbow) picker
        this._pickHue = document.createElement('div');
        this._pickHue.classList.add('pick-hue');
        this._overlay.append(this._pickHue);

        // hue drag start
        this._pickHue.addEventListener('mousedown', function (evt: MouseEvent) {
            this._pickHueMouseMove(evt);

            window.addEventListener('mousemove', this._pickHueMouseMove, false);
            window.addEventListener('mouseup', this._pickHueMouseUp, false);

            evt.stopPropagation();
            evt.preventDefault();
            this.dragging = true;
            this.emit('picker:color:start');
        }.bind(this));

        // handle
        this._pickHueHandle = document.createElement('div');
        this._pickHueHandle.classList.add('handle');
        this._pickHue.appendChild(this._pickHueHandle);


        // opacity (gradient) picker
        this._pickOpacity = document.createElement('div');
        this._pickOpacity.classList.add('pick-opacity');
        this._overlay.append(this._pickOpacity);

        // opacity drag start
        this._pickOpacity.addEventListener('mousedown', function (evt: MouseEvent) {
            this._pickOpacityMouseMove(evt);

            window.addEventListener('mousemove', this._pickOpacityMouseMove, false);
            window.addEventListener('mouseup', this._pickOpacityMouseUp, false);

            evt.stopPropagation();
            evt.preventDefault();
            this.dragging = true;
            this.emit('picker:color:start');
        }.bind(this));

        // handle
        this._pickOpacityHandle = document.createElement('div');
        this._pickOpacityHandle.classList.add('handle');
        this._pickOpacity.appendChild(this._pickOpacityHandle);


        // fields
        this._panelFields = document.createElement('div');
        this._panelFields.classList.add('fields');
        this._overlay.append(this._panelFields);

        this._evtColorPick = null;
        this._evtColorToPicker = null;
        this._evtColorPickStart = null;
        this._evtColorPickEnd = null;

        this._overlay.on('hide', function () {
            this._evtColorPick.unbind();
            this._evtColorPick = null;

            this._evtColorToPicker.unbind();
            this._evtColorToPicker = null;

            this._evtColorPickStart.unbind();
            this._evtColorPickStart = null;

            this._evtColorPickEnd.unbind();
            this._evtColorPickEnd = null;
        }.bind(this));

        // R
        this._fieldR = new NumericInput({
            precision: 1,
            step: 1,
            min: 0,
            max: 255
        });

        this._pickerChannels.push(this._fieldR);
        this._fieldR.renderChanges = false;
        this._fieldR.placeholder = 'r';
        // @ts-ignore
        this._fieldR.flexGrow = 1;
        this._fieldR.class.add('field', 'field-r');
        this._fieldR.on('change', this._updateRects.bind(this));
        this._panelFields.appendChild(this._fieldR.element);

        // G
        this._fieldG = new NumericInput({
            precision: 1,
            step: 1,
            min: 0,
            max: 255
        });
        this._pickerChannels.push(this._fieldG);
        this._fieldG.renderChanges = false;
        this._fieldG.placeholder = 'g';
        this._fieldG.class.add('field', 'field-g');
        this._fieldG.on('change', this._updateRects.bind(this));
        this._panelFields.appendChild(this._fieldG.element);

        // B
        this._fieldB = new NumericInput({
            precision: 1,
            step: 1,
            min: 0,
            max: 255
        });
        this._pickerChannels.push(this._fieldB);
        this._fieldB.renderChanges = false;
        this._fieldB.placeholder = 'b';
        this._fieldB.class.add('field', 'field-b');
        this._fieldB.on('change', this._updateRects.bind(this));
        this._panelFields.appendChild(this._fieldB.element);

        this._fieldA = new NumericInput({
            precision: 1,
            step: 1,
            min: 0,
            max: 255
        });
        this._pickerChannels.push(this._fieldA);
        this._fieldA.renderChanges = false;
        this._fieldA.placeholder = 'a';
        this._fieldA.class.add('field', 'field-a');
        this._fieldA.on('change', this._updateRectAlpha.bind(this));
        this._panelFields.appendChild(this._fieldA.element);


        // HEX
        this._fieldHex = new TextInput({});
        this._fieldHex.renderChanges = false;
        this._fieldHex.placeholder = '#';
        this._fieldHex.class.add('field', 'field-hex');
        this._fieldHex.on('change', this._updateHex.bind(this));
        this._panelFields.appendChild(this._fieldHex.element);
    }

    focus() {
        this.dom.focus();
    }

    blur() {
        this.dom.blur();
    }

    protected _onKeyDown(evt: KeyboardEvent) {
        // escape blurs the field
        if (evt.key === 'Escape') {
            this.blur();
        }

        // enter opens the color picker
        if (evt.key !== 'Enter' || !this.enabled || this.readOnly) {
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();
    }

    protected _onFocus(evt: FocusEvent) {
        this.emit('focus');
    }

    protected _onBlur(evt: FocusEvent) {
        this.emit('blur');
    }

    protected _closePicker() {
        this._overlay.hidden = true;
        this._isColorPickerOpen = false;
        this.focus();
    }

    protected _getColorRect() {
        // @ts-ignore rect not a property of Overlay
        return this._overlay.rect;
    }

    protected _setColorPickerPosition(x: number, y: number) {
        this._overlay.position(x, y);
    }

    protected _setPickerColor(color: number[]) {
        if (this._changing || this._dragging)
            return;

        if (this._channelsNumber >= 3) {
            const hsv = _rgb2hsv(color);
            this._colorHSV[0] = hsv[0];
            this._colorHSV[1] = hsv[1];
            this._colorHSV[2] = hsv[2];
        }

        // set fields
        this._directInput = false;
        for (let i = 0; i < color.length; i++) {
            this._pickerChannels[i].value = color[i];
        }
        this._fieldHex.value = this._getHex();
        this._directInput = true;
    }

    protected _openColorPicker() {
        this._isColorPickerOpen = true;

        // open color picker
        this._callPicker(this.value.map(c => Math.floor(c * 255)));

        // picked color
        this._evtColorPick = this.on('picker:color', (color) => {
            this.value = color.map((c: number) => c / 255);
        });

        this._evtColorPickStart = this.on('picker:color:start', () => {
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

        this._evtColorPickEnd = this.on('picker:color:end', () => {
            if (this.binding) {
                this.binding.historyCombine = this._historyCombine;
                this.binding.historyPostfix = this._historyPostfix;
            }
        });

        // position picker
        const rectPicker = this._overlay.dom.getBoundingClientRect();
        const rectElement = this.dom.getBoundingClientRect();
        this._setColorPickerPosition(rectElement.left - rectPicker.width, rectElement.top + 25);

        // color changed, update picker
        this._evtColorToPicker = this.on('change', () => {
            this._setPickerColor(this.value.map(c => Math.floor(c * 255)));
        });
    }

    protected _callPicker(color: number[]) {
        // class for channels
        for (let i = 0; i < 4; i++) {
            if (color.length - 1 < i) {
                this._overlay.class.remove('c-' + (i + 1));
            } else {
                this._overlay.class.add('c-' + (i + 1));
            }
        }

        // number of channels
        this._channelsNumber = color.length;

        if (this._channelsNumber >= 3) {
            const hsv = _rgb2hsv(color);
            this._colorHSV[0] = hsv[0];
            this._colorHSV[1] = hsv[1];
            this._colorHSV[2] = hsv[2];
        }

        // set fields
        this._directInput = false;
        for (let i = 0; i < color.length; i++) {
            this._pickerChannels[i].value = color[i];
        }
        this._fieldHex.value = this._getHex();
        this._directInput = true;

        // show overlay
        this._overlay.hidden = false;

        // focus on hex field
        this._fieldHex.dom.focus();

        setTimeout(() => {
            this._fieldHex.dom.focus();
        }, 100);
    }

    protected _valueToColor(value: number) {
        value = Math.floor(value * 255);
        return Math.max(0, Math.min(value, 255));

    }

    protected _setValue(value: any) {
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

    protected _updateValue(value: string | any[]) {
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
    protected _getHex() {
        let hex = '';
        for (let i = 0; i < this._channelsNumber; i++) {
            hex += ('00' + this._pickerChannels[i].value.toString(16)).slice(-2).toUpperCase();
        }
        return hex;
    }

    // rect drag
    protected _pickRectMouseMove(evt: MouseEvent) {
        this._changing = true;
        const rect = this._pickRect.getBoundingClientRect();
        const x = Math.max(0, Math.min(this._size, Math.floor(evt.clientX - rect.left)));
        const y = Math.max(0, Math.min(this._size, Math.floor(evt.clientY - rect.top)));

        this._colorHSV[1] = x / this._size;
        this._colorHSV[2] = 1.0 - (y / this._size);

        this._directInput = false;
        const rgb = _hsv2rgb([this._colorHSV[0], this._colorHSV[1], this._colorHSV[2]]);
        for (let i = 0; i < 3; i++) {
            this._pickerChannels[i].value = rgb[i];
        }
        this._fieldHex.value = this._getHex();
        this._directInput = true;

        this._pickRectHandle.style.left = Math.max(4, Math.min(this._size - 4, x)) + 'px';
        this._pickRectHandle.style.top = Math.max(4, Math.min(this._size - 4, y)) + 'px';
        this._changing = false;
    }

    // rect drag stop
    protected _pickRectMouseUp() {
        window.removeEventListener('mousemove', this._pickRectMouseMove, false);
        window.removeEventListener('mouseup', this._pickRectMouseUp, false);
        this._dragging = false;
        this.emit('picker:color:end');
    }

    // hue drag
    protected _pickHueMouseMove(evt: MouseEvent) {
        this._changing = true;
        const rect = this._pickHue.getBoundingClientRect();
        const y = Math.max(0, Math.min(this._size, Math.floor(evt.clientY - rect.top)));
        const h = y / this._size;

        const rgb = _hsv2rgb([h, this._colorHSV[1], this._colorHSV[2]]);
        this._colorHSV[0] = h;

        this._directInput = false;
        for (let i = 0; i < 3; i++) {
            this._pickerChannels[i].value = rgb[i];
        }
        this._fieldHex.value = this._getHex();
        this._updateRects();
        this._directInput = true;
        this._changing = false;
    }

    // hue drag stop
    protected _pickHueMouseUp() {
        window.removeEventListener('mousemove', this._pickHueMouseMove, false);
        window.removeEventListener('mouseup', this._pickHueMouseUp, false);
        this._dragging = false;
        this.emit('picker:color:end');
    }

    // opacity drag
    protected _pickOpacityMouseMove(evt: MouseEvent) {
        this._changing = true;
        const rect = this._pickOpacity.getBoundingClientRect();
        const y = Math.max(0, Math.min(this._size, Math.floor(evt.clientY - rect.top)));
        const o = 1.0 - y / this._size;

        this._directInput = false;
        this._fieldA.value = Math.max(0, Math.min(255, Math.round(o * 255)));
        this._fieldHex.value = this._getHex();
        this._directInput = true;
        this._changing = false;
    }

    protected _pickOpacityMouseUp() {
        window.removeEventListener('mousemove', this._pickOpacityMouseMove, false);
        window.removeEventListener('mouseup', this._pickOpacityMouseUp, false);
        this._dragging = false;
        this.emit('picker:color:end');
    }

    protected _updateHex() {
        if (!this._directInput)
            return;

        this._changing = true;

        // @ts-ignore
        const hex = this._fieldHex.value.trim().toLowerCase();
        if (/^([0-9a-f]{2}){3,4}$/.test(hex)) {
            for (let i = 0; i < this._channelsNumber; i++) {
                this._pickerChannels[i].value = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
            }
        }
        this._changing = false;
    }

    protected _updateRects() {
        const color = this._pickerChannels.map(function (channel) {
            return channel.value || 0;
        }).slice(0, this._channelsNumber);

        const hsv = _rgb2hsv(color);
        if (this._directInput) {
            const sum = color[0] + color[1] + color[2];
            if (sum !== 765 && sum !== 0)
                this._colorHSV[0] = hsv[0];

            this._colorHSV[1] = hsv[1];
            this._colorHSV[2] = hsv[2];

            this._dragging = true;
            this.emit('picker:color:start');
        }

        // hue position
        this._pickHueHandle.style.top = Math.floor(this._size * this._colorHSV[0]) + 'px'; // h

        // rect position
        this._pickRectHandle.style.left = Math.max(4, Math.min(this._size - 4, this._size * this._colorHSV[1])) + 'px'; // s
        this._pickRectHandle.style.top = Math.max(4, Math.min(this._size - 4, this._size * (1.0 - this._colorHSV[2]))) + 'px'; // v

        if (this._channelsNumber >= 3) {
            const plainColor = _hsv2rgb([this._colorHSV[0], 1, 1]).join(',');

            // rect background color
            this._pickRect.style.backgroundColor = 'rgb(' + plainColor + ')';

            // rect handle color
            this._pickRectHandle.style.backgroundColor = 'rgb(' + color.slice(0, 3).join(',') + ')';

            // hue handle color
            this._pickHueHandle.style.backgroundColor = 'rgb(' + plainColor + ')';
        }

        this.callCallback();
    }

    // update alpha handle
    protected _updateRectAlpha(value: number) {
        if (this._channelsNumber !== 4)
            return;

        // position
        this._pickOpacityHandle.style.top = Math.floor(this._size * (1.0 - (Math.max(0, Math.min(255, value)) / 255))) + 'px';

        // color
        this._pickOpacityHandle.style.backgroundColor = 'rgb(' + [value, value, value].join(',') + ')';

        this.callCallback();
    }


    callbackHandle() {
        this._callingCallback = false;

        this.emit('picker:color', this._pickerChannels.map(function (channel) {
            return channel.value || 0;
        }).slice(0, this._channelsNumber));
    }

    callCallback() {
        if (this._callingCallback)
            return;

        this._callingCallback = true;
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

    set values(values: Array<number>) {
        let different = false;
        const value = values[0];
        for (let i = 1; i < values.length; i++) {
            if (Array.isArray(value)) {
                // @ts-ignore
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
            // @ts-ignore
            this.value = null;
            this.dom.classList.add(CLASS_MULTIPLE_VALUES);
        } else {
            // @ts-ignore
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
