import { EventHandle } from '@playcanvas/observer';

import Element, { ElementArgs, IBindable, IBindableArgs } from '../Element';
import Overlay from '../Overlay';
import NumericInput from '../NumericInput';
import TextInput from '../TextInput';
import * as pcuiClass from '../../class';
import { _hsv2rgb, _rgb2hsv } from '../../Math/color-value';

const CLASS_ROOT = 'pcui-color-input';

/**
 * The arguments for the {@link ColorPicker} constructor.
 */
export interface ColorPickerArgs extends ElementArgs, IBindableArgs {
    /**
     * An array of 4 integers containing the RGBA values the picker should be initialized to. Defaults to `[0, 0, 255, 1]`.
     */
    value?: number[];
    /**
     * Number of color channels. Defaults to 3. Changing to 4 adds the option to change the alpha value.
     */
    channels?: number;
}

/**
 * Represents a color picker.
 */
class ColorPicker extends Element implements IBindable {
    protected _historyCombine = false;

    protected _historyPostfix: string = null;

    protected _value: number[];

    protected _channels: number;

    protected _size = 144;

    protected _directInput = true;

    protected _colorHSV = [0, 0, 0];

    protected _pickerChannels: NumericInput[] = [];

    protected _channelsNumber = 4;

    protected _changing = false;

    protected _dragging = false;

    protected _callingCallback = false;

    protected _overlay: Overlay;

    protected _domColor: HTMLDivElement;

    protected _pickRect: HTMLDivElement;

    protected _pickRectPointerId: number = null;

    protected _pickRectWhite: HTMLDivElement;

    protected _pickRectBlack: HTMLDivElement;

    protected _pickRectHandle: HTMLDivElement;

    protected _pickHue: HTMLDivElement;

    protected _pickHuePointerId: number = null;

    protected _pickHueHandle: HTMLDivElement;

    protected _pickOpacity: HTMLDivElement;

    protected _pickOpacityPointerId: number = null;

    protected _pickOpacityHandle: HTMLDivElement;

    protected _panelFields: HTMLDivElement;

    protected _evtColorPick: EventHandle = null;

    protected _evtColorToPicker: EventHandle = null;

    protected _evtColorPickStart: EventHandle = null;

    protected _evtColorPickEnd: EventHandle = null;

    protected _fieldHex: TextInput;

    protected _renderChanges: boolean;

    /**
     * Creates a new ColorPicker.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<ColorPickerArgs> = {}) {
        super(args);

        this.class.add(CLASS_ROOT, pcuiClass.NOT_FLEXIBLE);

        // this element shows the actual color. The
        // parent element shows the checkerboard pattern
        this._domColor = document.createElement('div');
        this.dom.appendChild(this._domColor);

        this.dom.addEventListener('keydown', this._onKeyDown);
        this.dom.addEventListener('focus', this._onFocus);
        this.dom.addEventListener('blur', this._onBlur);

        this.on('click', () => {
            if (this.enabled && !this.readOnly) {
                this._openColorPicker();
            }
        });

        this._value = args.value ?? [0, 0, 255, 1];
        this._channels = args.channels ?? 3;
        this._setValue(this._value);

        this.renderChanges = args.renderChanges ?? false;

        this.on('change', () => {
            if (this.renderChanges) {
                this.flash();
            }
        });

        // overlay
        this._overlay = new Overlay({
            class: 'picker-color',
            clickable: true,
            hidden: true,
            transparent: true
        });
        this.dom.appendChild(this._overlay.dom);

        // rectangular picker
        this._pickRect = document.createElement('div');
        this._pickRect.classList.add('pick-rect');
        this._overlay.append(this._pickRect);

        // color drag events
        this._pickRect.addEventListener('pointerdown', this._pickRectPointerDown);
        this._pickRect.addEventListener('pointermove', this._pickRectPointerMove);
        this._pickRect.addEventListener('pointerup', this._pickRectPointerUp);

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

        // hue drag events
        this._pickHue.addEventListener('pointerdown', this._pickHuePointerDown);
        this._pickHue.addEventListener('pointermove', this._pickHuePointerMove);
        this._pickHue.addEventListener('pointerup', this._pickHuePointerUp);

        // handle
        this._pickHueHandle = document.createElement('div');
        this._pickHueHandle.classList.add('handle');
        this._pickHue.appendChild(this._pickHueHandle);

        // opacity (gradient) picker
        this._pickOpacity = document.createElement('div');
        this._pickOpacity.classList.add('pick-opacity');
        this._overlay.append(this._pickOpacity);

        // opacity drag events
        this._pickOpacity.addEventListener('pointerdown', this._pickOpacityPointerDown);
        this._pickOpacity.addEventListener('pointermove', this._pickOpacityPointerMove);
        this._pickOpacity.addEventListener('pointerup', this._pickOpacityPointerUp);

        // handle
        this._pickOpacityHandle = document.createElement('div');
        this._pickOpacityHandle.classList.add('handle');
        this._pickOpacity.appendChild(this._pickOpacityHandle);

        // fields
        this._panelFields = document.createElement('div');
        this._panelFields.classList.add('fields');
        this._overlay.append(this._panelFields);

        this._overlay.on('hide', () => {
            this._evtColorPick.unbind();
            this._evtColorPick = null;

            this._evtColorToPicker.unbind();
            this._evtColorToPicker = null;

            this._evtColorPickStart.unbind();
            this._evtColorPickStart = null;

            this._evtColorPickEnd.unbind();
            this._evtColorPickEnd = null;
        });

        const createChannelInput = (channel: string) => {
            return new NumericInput({
                class: ['field', 'field-' + channel],
                precision: 0,
                step: 1,
                min: 0,
                max: 255,
                placeholder: channel
            });
        };

        // R
        const fieldR = createChannelInput('r');
        fieldR.on('change', () => {
            this._onChangeRgb();
        });
        this._pickerChannels.push(fieldR);
        this._panelFields.appendChild(fieldR.dom);

        // G
        const fieldG = createChannelInput('g');
        fieldG.on('change', () => {
            this._onChangeRgb();
        });
        this._pickerChannels.push(fieldG);
        this._panelFields.appendChild(fieldG.dom);

        // B
        const fieldB = createChannelInput('b');
        fieldB.on('change', () => {
            this._onChangeRgb();
        });
        this._pickerChannels.push(fieldB);
        this._panelFields.appendChild(fieldB.dom);

        // A
        const fieldA = createChannelInput('a');
        fieldA.on('change', (value: number) => {
            this._onChangeAlpha(value);
        });
        this._pickerChannels.push(fieldA);
        this._panelFields.appendChild(fieldA.dom);

        // HEX
        this._fieldHex = new TextInput({
            class: ['field', 'field-hex'],
            placeholder: '#'
        });
        this._fieldHex.on('change', () => {
            this._onChangeHex();
        });
        this._panelFields.appendChild(this._fieldHex.dom);
    }

    destroy() {
        if (this._destroyed) return;

        this.dom.removeEventListener('keydown', this._onKeyDown);
        this.dom.removeEventListener('focus', this._onFocus);
        this.dom.removeEventListener('blur', this._onBlur);

        this._pickRect.removeEventListener('pointerdown', this._pickRectPointerDown);
        this._pickRect.removeEventListener('pointermove', this._pickRectPointerMove);
        this._pickRect.removeEventListener('pointerup', this._pickRectPointerUp);

        this._pickHue.removeEventListener('pointerdown', this._pickHuePointerDown);
        this._pickHue.removeEventListener('pointermove', this._pickHuePointerMove);
        this._pickHue.removeEventListener('pointerup', this._pickHuePointerUp);

        this._pickOpacity.removeEventListener('pointerdown', this._pickOpacityPointerDown);
        this._pickOpacity.removeEventListener('pointermove', this._pickOpacityPointerMove);
        this._pickOpacity.removeEventListener('pointerup', this._pickOpacityPointerUp);

        super.destroy();
    }

    focus() {
        this.dom.focus();
    }

    blur() {
        this.dom.blur();
    }

    protected _onKeyDown = (evt: KeyboardEvent) => {
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
    };

    protected _onFocus = (evt: FocusEvent) => {
        this.emit('focus');
    };

    protected _onBlur = (evt: FocusEvent) => {
        this.emit('blur');
    };

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

        window.setTimeout(() => {
            this._fieldHex.dom.focus();
        }, 100);
    }

    protected _valueToColor(value: number) {
        value = Math.floor(value * 255);
        return Math.max(0, Math.min(value, 255));
    }

    protected _setValue(value: number[]) {
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

    protected _updateValue(value: number[]) {
        let dirty = false;
        for (let i = 0; i < value.length; i++) {
            if (this._value[i] !== value[i]) {
                dirty = true;
                this._value[i] = value[i];
            }
        }

        this.class.remove(pcuiClass.MULTIPLE_VALUES);

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

    // rect drag start
    protected _pickRectPointerDown = (event: PointerEvent) => {
        if (this._pickRectPointerId !== null) return;

        this._pickRect.setPointerCapture(event.pointerId);
        this._pickRectPointerId = event.pointerId;

        event.preventDefault();
        event.stopPropagation();

        this.emit('picker:color:start');

        this._pickRectPointerMove(event);
    };

    // rect drag
    protected _pickRectPointerMove = (event: PointerEvent) => {
        if (this._pickRectPointerId !== event.pointerId) return;

        this._changing = true;

        // Get the pointer position relative to the element
        const rect = this._pickRect.getBoundingClientRect();
        const x = Math.max(0, Math.min(this._size, Math.floor(event.clientX - rect.left)));
        const y = Math.max(0, Math.min(this._size, Math.floor(event.clientY - rect.top)));

        this._colorHSV[1] = x / this._size;
        this._colorHSV[2] = 1.0 - (y / this._size);

        this._directInput = false;
        const rgb = _hsv2rgb(this._colorHSV);
        for (let i = 0; i < 3; i++) {
            this._pickerChannels[i].value = rgb[i];
        }
        this._fieldHex.value = this._getHex();
        this._directInput = true;

        this._pickRectHandle.style.left = Math.max(4, Math.min(this._size - 4, x)) + 'px';
        this._pickRectHandle.style.top = Math.max(4, Math.min(this._size - 4, y)) + 'px';

        this._changing = false;
    };

    // rect drag stop
    protected _pickRectPointerUp = (event: PointerEvent) => {
        if (this._pickRectPointerId !== event.pointerId) return;

        this.emit('picker:color:end');

        // Release the pointer
        this._pickRect.releasePointerCapture(event.pointerId);
        this._pickRectPointerId = null;
    };

    // hue drag start
    protected _pickHuePointerDown = (event: PointerEvent) => {
        if (this._pickHuePointerId !== null) return;

        this._pickHue.setPointerCapture(event.pointerId);
        this._pickHuePointerId = event.pointerId;

        event.preventDefault();
        event.stopPropagation();

        this.emit('picker:color:start');

        this._pickHuePointerMove(event);
    };

    // hue drag
    protected _pickHuePointerMove = (event: PointerEvent) => {
        if (this._pickHuePointerId !== event.pointerId) return;

        this._changing = true;

        const rect = this._pickHue.getBoundingClientRect();
        const y = Math.max(0, Math.min(this._size, Math.floor(event.clientY - rect.top)));
        const h = y / this._size;

        const rgb = _hsv2rgb([h, this._colorHSV[1], this._colorHSV[2]]);
        this._colorHSV[0] = h;

        this._directInput = false;
        for (let i = 0; i < 3; i++) {
            this._pickerChannels[i].value = rgb[i];
        }
        this._fieldHex.value = this._getHex();
        this._onChangeRgb();
        this._directInput = true;

        this._changing = false;
    };

    // hue drag stop
    protected _pickHuePointerUp = (event: PointerEvent) => {
        if (this._pickHuePointerId !== event.pointerId) return;

        this.emit('picker:color:end');

        // Release the pointer
        this._pickHue.releasePointerCapture(event.pointerId);
        this._pickHuePointerId = null;
    };

    // opacity drag start
    protected _pickOpacityPointerDown = (event: PointerEvent) => {
        if (this._pickOpacityPointerId !== null) return;

        this._pickOpacity.setPointerCapture(event.pointerId);
        this._pickOpacityPointerId = event.pointerId;

        event.preventDefault();
        event.stopPropagation();

        this.emit('picker:color:start');

        this._pickOpacityPointerMove(event);
    };

    // opacity drag
    protected _pickOpacityPointerMove = (event: PointerEvent) => {
        if (this._pickOpacityPointerId !== event.pointerId) return;

        this._changing = true;

        const rect = this._pickOpacity.getBoundingClientRect();
        const y = Math.max(0, Math.min(this._size, Math.floor(event.clientY - rect.top)));
        const o = 1.0 - y / this._size;

        this._directInput = false;
        this._pickerChannels[3].value = Math.max(0, Math.min(255, Math.round(o * 255)));
        this._fieldHex.value = this._getHex();
        this._directInput = true;

        this._changing = false;
    };

    // opacity drag stop
    protected _pickOpacityPointerUp = (event: PointerEvent) => {
        if (this._pickOpacityPointerId !== event.pointerId) return;

        this.emit('picker:color:end');

        // Release the pointer
        this._pickOpacity.releasePointerCapture(event.pointerId);
        this._pickOpacityPointerId = null;
    };

    protected _onChangeHex() {
        if (!this._directInput)
            return;

        this._changing = true;

        const hex = this._fieldHex.value.trim().toLowerCase();
        if (/^([0-9a-f]{2}){3,4}$/.test(hex)) {
            for (let i = 0; i < this._channelsNumber; i++) {
                this._pickerChannels[i].value = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
            }
        }

        this._changing = false;
    }

    protected _onChangeRgb() {
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
    protected _onChangeAlpha(value: number) {
        if (this._channelsNumber !== 4)
            return;

        // position
        this._pickOpacityHandle.style.top = Math.floor(this._size * (1.0 - (Math.max(0, Math.min(255, value)) / 255))) + 'px';

        // color
        this._pickOpacityHandle.style.backgroundColor = `rgb(${value}, ${value}, ${value})`;

        this.callCallback();
    }

    /** @ignore */
    callbackHandle() {
        this._callingCallback = false;

        this.emit('picker:color', this._pickerChannels.map(function (channel) {
            return channel.value || 0;
        }).slice(0, this._channelsNumber));
    }

    /** @ignore */
    callCallback() {
        if (this._callingCallback)
            return;

        this._callingCallback = true;
        window.setTimeout(() => {
            this.callbackHandle();
        }, 1000 / 60);
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

    /* eslint accessor-pairs: 0 */
    set values(values: Array<number>) {
        let different = false;
        const value = values[0];
        for (let i = 1; i < values.length; i++) {
            if (Array.isArray(value)) {
                // @ts-ignore
                if (!value.equals(values[i])) { // TODO: check if this works
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
            this.class.add(pcuiClass.MULTIPLE_VALUES);
        } else {
            // @ts-ignore
            this.value = values[0];
        }
    }

    set channels(value) {
        if (this._channels === value) return;
        this._channels = Math.max(0, Math.min(value, 4));
        this._setValue(this.value);
    }

    get channels() {
        return this._channels;
    }

    set renderChanges(value: boolean) {
        this._renderChanges = value;
    }

    get renderChanges() {
        return this._renderChanges;
    }
}

Element.register('rgb', ColorPicker);
Element.register('rgba', ColorPicker, { channels: 4 });

export default ColorPicker;
