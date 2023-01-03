import Element, { ElementArgs } from '../Element/index';
import Overlay from '../Overlay';
import Button from '../Button';
import SelectInput from '../SelectInput';
import NumericInput from '../NumericInput';
import TextInput from '../TextInput';
import Panel from '../Panel';
import Canvas from '../Canvas';
import Label from '../Label';
import { CurveSet, Curve, math } from 'playcanvas';
import { _hsv2rgb, _rgb2hsv } from '../../Math/color-value';

const CLASS_MULTIPLE_VALUES = 'pcui-multiple-values';

const CURVE_LINEAR = 0;
const CURVE_SPLINE = 4;
const CURVE_STEP = 5;

const REGEX_KEYS = /keys/;
const REGEX_TYPE = /type/;
const CLASS_GRADIENT = 'pcui-gradient';

/**
 * The arguments for the {@link GradientPicker} constructor.
 */
export interface GradientPickerArgs extends ElementArgs {
    renderChanges?: boolean;
    /**
     * An array of 4 integers containing the RGBA values the picker should be initialized to.
     */
    value?: number[];
    /**
     * Number of color channels. Defaults to 3. Changing to 4 adds the option to change the alpha value.
     */
    channels?: number;
}

/**
 * Represents a gradient picker.
 */
class GradientPicker extends Element {
    static readonly defaultArgs: GradientPickerArgs = {
        ...Element.defaultArgs,
        renderChanges: true,
        dom: 'div'
    };

    protected _canvas: Canvas;

    protected _checkerboardPattern: CanvasPattern;

    protected _resizeInterval: number;

    protected _panel: Panel;

    protected _colorRect: Canvas;

    protected _colorHandle: HTMLDivElement;

    protected _hueRect: Canvas;

    protected _hueHandle: HTMLDivElement;

    protected _alphaRect: Canvas;

    protected _alphaHandle: HTMLDivElement;

    protected _fields: HTMLDivElement;

    protected _rField: NumericInput;

    protected _gField: NumericInput;

    protected _bField: NumericInput;

    protected _aField: NumericInput;

    protected _hexField: TextInput;

    protected _hsva: number[];

    protected _storeHsva: number[];

    protected _dragMode: number;

    protected _changing: boolean;

    protected _copiedData: any;

    protected _channels: number;

    protected _value: { type: number; keys: any[]; betweenCurves: boolean; };

    protected _evtPickerChanged: any;

    protected _evtRefreshPicker: any;

    protected renderChanges: boolean;

    protected Helpers: any;

    protected CONSTANTS: any;

    protected UI: any;

    protected STATE: any;

    protected fieldChangeHandler: (evt: any) => void;

    protected hexChangeHandler: (evt: any) => void;

    protected downHandler: (evt: any) => void;

    protected moveHandler: (evt: any) => void;

    protected upHandler: (evt: any) => void;

    /**
     * Creates a new GradientPicker.
     *
     * @param args - The arguments. Extends the Element arguments. Any settable property can also
     * be set through the constructor.
     */
    constructor(args: GradientPickerArgs = GradientPicker.defaultArgs) {
        args = { ...GradientPicker.defaultArgs, ...args };
        super(args.dom, args);

        this.class.add(CLASS_GRADIENT);

        this._canvas = new Canvas({ useDevicePixelRatio: true });
        this.dom.appendChild(this._canvas.dom);
        this._canvas.parent = this;
        this._canvas.on('resize', () => {
            this._renderGradient();
        });
        const canvasElement = this._canvas.dom as HTMLCanvasElement;
        this._checkerboardPattern = this._createCheckerboardPattern(canvasElement.getContext('2d'));

        // make sure canvas is the same size as the container element
        // 20 times a second
        this._resizeInterval = window.setInterval(() => {
            this._canvas.resize(this.width, this.height);
        }, 1000 / 20);

        this.dom.addEventListener('keydown', this._onKeyDown);
        this.dom.addEventListener('focus', this._onFocus);
        this.dom.addEventListener('blur', this._onBlur);

        this.on('click', () => {
            if (!this.enabled || this.readOnly || this.class.contains(CLASS_MULTIPLE_VALUES)) return;
            this._openGradientPicker();
        });

        this.renderChanges = args.renderChanges;

        this.on('change', () => {
            if (this.renderChanges) {
                this.flash();
            }
        });

        // capture this for the event handler
        function genEvtHandler(self: any, func: any) {
            return function (evt: any) {
                func.apply(self, [evt]);
            };
        }

        this.Helpers = {
            rgbaStr: function (color: Array<number>, scale: number) {
                if (!scale) {
                    scale = 1;
                }
                let rgba = color.map(function (element: number, index: number) {
                    return index < 3 ? Math.round(element * scale) : element;
                }).join(',');
                for (let i = color.length; i < 4; ++i) {
                    rgba += ',' + (i < 3 ? scale : 1);
                }
                return 'rgba(' + rgba + ')';
            },

            hexStr: function (clr: Array<number>) {
                return clr.map(function (v: { toString: (arg0: number) => string; }) {
                    return ('00' + v.toString(16)).slice(-2).toUpperCase();
                }).join('');
            },

            // rgb(a) -> hsva
            toHsva: function (rgba: Array<number>) {
                const hsva = _rgb2hsv(rgba.map(function (v: number) {
                    return v * 255;
                }));
                hsva.push(rgba.length > 3 ? rgba[3] : 1);
                return hsva;
            },

            // hsv(1) -> rgba
            toRgba: function (hsva: Array<number>) {
                const rgba = _hsv2rgb(hsva).map(function (v: any) {
                    return v / 255;
                });
                rgba.push(hsva.length > 3 ? hsva[3] : 1);
                return rgba;
            },

            // calculate the normalized coordinate [x,y] relative to rect
            normalizedCoord: function (canvas: Canvas, x: number, y: number) {
                const rect = canvas.dom.getBoundingClientRect();
                return [
                    (x - rect.left) / rect.width,
                    (y - rect.top) / rect.height
                ];
            }
        };

        this._panel = new Panel();
        this._panel.class.add('color-panel');
        this.dom.appendChild(this._panel.dom);

        this._colorRect = new Canvas({ useDevicePixelRatio: true });
        this._colorRect.class.add('color-rect');
        this._panel.append(this._colorRect.dom);
        this._colorRect.resize(140, 140);

        this._colorHandle = document.createElement('div');
        this._colorHandle.classList.add('color-handle');
        this._panel.append(this._colorHandle);

        this._hueRect = new Canvas({ useDevicePixelRatio: true });
        this._hueRect.class.add('hue-rect');
        this._panel.append(this._hueRect.dom);
        this._hueRect.resize(20, 140);

        this._hueHandle = document.createElement('div');
        this._hueHandle.classList.add('hue-handle');
        this._panel.append(this._hueHandle);

        this._alphaRect = new Canvas({ useDevicePixelRatio: true });
        this._alphaRect.class.add('alpha-rect');
        this._panel.append(this._alphaRect.dom);
        this._alphaRect.resize(20, 140);

        this._alphaHandle = document.createElement('div');
        this._alphaHandle.classList.add('alpha-handle');
        this._panel.append(this._alphaHandle);

        this._fields = document.createElement('div');
        this._fields.classList.add('fields');
        this._panel.append(this._fields);

        this.fieldChangeHandler = genEvtHandler(this, this._onFieldChanged);
        this.hexChangeHandler = genEvtHandler(this, this._onHexChanged);
        this.downHandler = genEvtHandler(this, this._onMouseDown);
        this.moveHandler = genEvtHandler(this, this._onMouseMove);
        this.upHandler = genEvtHandler(this, this._onMouseUp);

        function numberField(label: string) {
            const field = new NumericInput({
                precision: 1,
                step: 1,
                min: 0,
                max: 255
            });
            field.renderChanges = false;
            field.placeholder = label;
            field.on('change', this.fieldChangeHandler);
            this._fields.appendChild(field.dom);
            return field;
        }

        this._rField = numberField.call(this, 'r');
        this._gField = numberField.call(this, 'g');
        this._bField = numberField.call(this, 'b');
        this._aField = numberField.call(this, 'a');

        this._hexField = new TextInput();
        this._hexField.renderChanges = false;
        this._hexField.placeholder = '#';
        this._hexField.on('change', this.hexChangeHandler);
        this._fields.appendChild(this._hexField.dom);

        // hook up mouse handlers
        this._colorRect.dom.addEventListener('mousedown', this.downHandler);
        this._hueRect.dom.addEventListener('mousedown', this.downHandler);
        this._alphaRect.dom.addEventListener('mousedown', this.downHandler);

        this._generateHue(this._hueRect);
        this._generateAlpha(this._alphaRect);

        this._hsva = [-1, -1, -1, 1];
        this._storeHsva = [0, 0, 0, 1];
        this._dragMode = 0;
        this._changing = false;

        this.CONSTANTS = {
            bg: '#2c393c',
            anchorRadius: 5,
            selectedRadius: 7
        };

        this.UI = {
            root: this.dom,
            overlay: new Overlay(),
            panel: document.createElement('div'),
            gradient: new Canvas({ useDevicePixelRatio: true }),
            checkerPattern: this.createCheckerPattern(),
            anchors: new Canvas({ useDevicePixelRatio: true }),
            footer: new Panel(),
            typeLabel: new Label({ text: 'Type' }),
            typeCombo: new SelectInput({
                options: [{ t: '0', v: 'placeholder' }],
                type: 'number'
            }),
            positionLabel: new Label({ text: 'Position' }),
            positionEdit: new NumericInput({ min: 0, max: 100, step: 1 }),
            copyButton: new Button(),
            pasteButton: new Button(),
            deleteButton: new Button(),
            showSelectedPosition: new NumericInput({ min: 0, max: 100, step: 1, hideSlider: true }),
            showCrosshairPosition: document.createElement('div'),
            anchorAddCrossHair: document.createElement('div'),
            colorPicker: null
        };

        // current state
        this.STATE = {
            curves: [],            // holds all the gradient curves (either 3 or 4 of them)
            keystore: [],          // holds the curve during edit
            anchors: [],           // holds the times of the anchors
            hoveredAnchor: -1,     // index of the hovered anchor
            selectedAnchor: -1,    // index of selected anchor
            selectedValue: [],     // value being dragged
            changing: false,       // UI is currently changing
            draggingAnchor: false,
            typeMap: { }          // map from curve type dropdown to engine curve enum
        };

        // initialize overlay
        this.UI.root.appendChild(this.UI.overlay.dom);
        this.UI.overlay.class.add('picker-gradient');
        this.UI.overlay.center = false;
        this.UI.overlay.transparent = true;
        this.UI.overlay.hidden = true;
        this.UI.overlay.clickable = true;
        this.UI.overlay.dom.style.position = "fixed";

        this.UI.overlay.on('show', () => {
            this.onOpen();
        });

        this.UI.overlay.on('hide', () => {
            this.onClose();
        });

        // panel
        this.UI.panel.classList.add('picker-gradient-panel');
        this.UI.overlay.append(this.UI.panel);

        // gradient
        this.UI.panel.appendChild(this.UI.gradient.dom);
        this.UI.gradient.class.add('picker-gradient-gradient');
        this.UI.gradient.resize(320, 28);

        // anchors
        this.UI.panel.appendChild(this.UI.anchors.dom);
        this.UI.anchors.class.add('picker-gradient-anchors');
        this.UI.anchors.resize(320, 28);

        // footer
        this.UI.panel.appendChild(this.UI.footer.dom);
        this.UI.footer.append(this.UI.typeLabel);
        this.UI.footer.class.add('picker-gradient-footer');

        this.UI.footer.append(this.UI.typeCombo);
        this.UI.typeCombo.value = -1;
        this.UI.typeCombo.on('change', (value: number) => {
            this._onTypeChanged(value);
        });

        // this.UI.footer.append(this.UI.positionLabel);

        // this.UI.footer.append(this.UI.positionEdit);
        this.UI.positionEdit.style.width = '40px';
        this.UI.positionEdit.renderChanges = false;
        this.UI.showSelectedPosition.on('change', (value: number) => {
            if (!this.STATE.changing) {
                this.moveSelectedAnchor(value / 100);
            }
        });

        this.UI.copyButton.on('click', () => {
            this.doCopy();
        });
        this.UI.copyButton.class.add('copy-curve-button');
        this.UI.footer.append(this.UI.copyButton);
        // Tooltip.attach({
        //     target: this.UI.copyButton.dom,
        //     text: 'Copy',
        //     align: 'bottom',
        //     root: this.UI.root
        // });

        this.UI.pasteButton.on('click', () => {
            this.doPaste();
        });
        this.UI.pasteButton.class.add('paste-curve-button');
        this.UI.footer.append(this.UI.pasteButton);

        this.UI.deleteButton.on('click', () => {
            this.doDelete();
        });
        this.UI.deleteButton.class.add('delete-curve-button');
        this.UI.footer.append(this.UI.deleteButton);

        this.UI.panel.appendChild(this._panel.dom);

        this.UI.panel.append(this.UI.showSelectedPosition.dom);
        this.UI.showSelectedPosition.class.add('show-selected-position');
        this.UI.showSelectedPosition._domInput.classList.add('show-selected-position-input');

        const crosshairPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

        crosshairPath.setAttribute('fill-rule', 'evenodd');
        crosshairPath.setAttribute('clip-rule', 'evenodd');
        crosshairPath.setAttribute('d', 'M8.5 17C7.35596 17 6.26043 16.7741 5.2134 16.3222C4.16637 15.8703 3.26152 15.2629 2.49882 14.4997C1.73612 13.7366 1.12899 12.8312 0.677391 11.7835C0.225795 10.7359 0 9.6397 0 8.49498C0 7.35026 0.225795 6.25409 0.677391 5.20644C1.12899 4.15879 1.73612 3.25507 2.49882 2.49527C3.26152 1.73548 4.16637 1.12965 5.2134 0.677791C6.26043 0.225928 7.35596 0 8.5 0C9.64404 0 10.7396 0.225928 11.7866 0.677791C12.8336 1.12965 13.7385 1.73548 14.5012 2.49527C15.2639 3.25507 15.871 4.15879 16.3226 5.20644C16.7742 6.25409 17 7.35026 17 8.49498C17 9.6397 16.7742 10.7359 16.3226 11.7835C15.871 12.8312 15.2639 13.7366 14.5012 14.4997C13.7385 15.2629 12.8336 15.8703 11.7866 16.3222C10.7396 16.7741 9.64404 17 8.5 17ZM8.5 2.2593C7.64364 2.2593 6.82576 2.42498 6.04634 2.75635C5.26692 3.08772 4.59622 3.53288 4.03424 4.09185C3.47225 4.65082 3.02568 5.31354 2.69451 6.08004C2.36334 6.84653 2.19776 7.6515 2.19776 8.49498C2.19776 9.6397 2.47875 10.6957 3.04073 11.663C3.60272 12.6303 4.36707 13.3952 5.33383 13.9575C6.30058 14.5198 7.35596 14.8009 8.5 14.8009C9.34298 14.8009 10.1475 14.6353 10.9135 14.3039C11.6796 13.9725 12.3419 13.5257 12.9005 12.9634C13.4592 12.4011 13.9041 11.73 14.2352 10.9501C14.5664 10.1702 14.732 9.35184 14.732 8.49498C14.732 7.6515 14.5664 6.84653 14.2352 6.08004C13.9041 5.31354 13.4592 4.65082 12.9005 4.09185C12.3419 3.53288 11.6796 3.08772 10.9135 2.75635C10.1475 2.42498 9.34298 2.2593 8.5 2.2593ZM9.52361 9.73007V12.9533H7.40614V9.73007H4.11452V7.61134H7.40614V4.31778H9.52361V7.61134H12.745V9.73007H9.52361Z');
        crosshairPath.setAttribute('fill', '#FF6600');

        const crosshairHolder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const crosshairBar = document.createElement('div');

        crosshairHolder.appendChild(crosshairPath);
        crosshairHolder.setAttribute('width', '17');
        crosshairHolder.setAttribute('height', '17');
        crosshairHolder.setAttribute('viewBox', '0 0 17 17');

        this.UI.showCrosshairPosition.classList.add('show-crosshair-position');
        crosshairBar.classList.add('crosshair-bar');

        this.UI.anchorAddCrossHair.appendChild(crosshairHolder);
        this.UI.anchorAddCrossHair.appendChild(crosshairBar);
        this.UI.anchorAddCrossHair.appendChild(this.UI.showCrosshairPosition);
        this.UI.anchorAddCrossHair.classList.add('anchor-crosshair');
        this.UI.anchorAddCrossHair.style.visibility = 'hidden';

        this.UI.panel.append(this.UI.anchorAddCrossHair);

        // construct the color picker
        /* this.on('change', this.colorSelectedAnchor);*/
        this.on('changing', function (color) {
            this.colorSelectedAnchor(color, true);
        });

        this._copiedData = null;

        this._channels = args.channels || 3;
        this._value = this._getDefaultValue();
        if (args.value) {
            // @ts-ignore
            this.value = args.value;
        }
    }

    destroy() {
        if (this._destroyed) return;

        this.dom.removeEventListener('keydown', this._onKeyDown);
        this.dom.removeEventListener('focus', this._onFocus);
        this.dom.removeEventListener('blur', this._onBlur);

        window.clearInterval(this._resizeInterval);

        super.destroy();
    }

    protected _createCheckerboardPattern(context: CanvasRenderingContext2D) {
        // create checkerboard pattern
        const canvas = document.createElement('canvas');
        const size = 24;
        const halfSize = size / 2;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#';
        ctx.fillStyle = "#949a9c";
        ctx.fillRect(0, 0, halfSize, halfSize);
        ctx.fillRect(halfSize, halfSize, halfSize, halfSize);
        ctx.fillStyle = "#657375";
        ctx.fillRect(halfSize, 0, halfSize, halfSize);
        ctx.fillRect(0, halfSize, halfSize, halfSize);

        return context.createPattern(canvas, 'repeat');
    }

    protected _onKeyDown = (evt: KeyboardEvent) => {
        // escape blurs the field
        if (evt.key === 'Escape') {
            this.blur();
        }

        // enter opens the gradient picker
        if (evt.key !== 'Enter' || !this.enabled || this.readOnly || this.class.contains(CLASS_MULTIPLE_VALUES)) {
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();

        this._openGradientPicker();
    };

    protected _onFocus = (evt: FocusEvent) => {
        this.emit('focus');
    };

    protected _onBlur = (evt: FocusEvent) => {
        this.emit('blur');
    };

    protected _getDefaultValue() {
        return {
            type: 4,
            keys: (new Array(this._channels)).fill([0, 0]),
            betweenCurves: false
        };
    }

    protected _openGradientPicker() {
        this.callOpenGradientPicker([this.value || this._getDefaultValue()]);

        // position picker
        const rectPicker = this.getGradientPickerRect();
        const rectField = this.dom.getBoundingClientRect();

        this.positionGradientPicker(rectField.right - rectPicker.width, rectField.bottom);

        // change event from the picker sets the new value
        this._evtPickerChanged = this.on('picker:curve:change', this._onPickerChange.bind(this));

        // refreshing the value resets the picker
        this._evtRefreshPicker = this.on('change', () => this.setGradientPicker([this.value]));
    }

    protected _onPickerChange(paths: string[], values: any[]) {
        const value = this.value || this._getDefaultValue();

        // TODO: this is all kinda hacky. We need to clear up
        // the events raised by the picker
        if (REGEX_KEYS.test(paths[0])) {
            // set new value with new keys but same type
            this.value = {
                type: value.type,
                keys: values,
                betweenCurves: false
            };
        } else if (REGEX_TYPE.test(paths[0])) {
            // set new value with new type but same keys
            this.value = {
                type: values[0],
                keys: value.keys,
                betweenCurves: false
            };
        }
    }

    protected _renderGradient() {
        const canvas = this._canvas.dom as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        const width = this._canvas.width;
        const height = this._canvas.height;
        const ratio = this._canvas.pixelRatio;

        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        context.fillStyle = this._checkerboardPattern;
        context.fillRect(0, 0, width, height);

        if (!this.value || !this.value.keys || !this.value.keys.length) {
            return;
        }

        const rgba: any[] = [];

        const curve = this.channels === 1 ? new CurveSet([this.value.keys]) : new CurveSet(this.value.keys);
        curve.type = this.value.type;

        const precision = 2;

        const gradient = context.createLinearGradient(0, 0, width, 0);

        for (let t = precision; t < width; t += precision) {
            curve.value(t / width, rgba);

            const r = Math.round((rgba[0] || 0) * 255);
            const g = Math.round((rgba[1] || 0) * 255);
            const b = Math.round((rgba[2] || 0) * 255);
            const a = this.channels === 4 ? (rgba[3] || 0) : 1;

            gradient.addColorStop(t / width, `rgba(${r}, ${g}, ${b}, ${a})`);
        }

        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
    }

    focus() {
        this.dom.focus();
    }

    blur() {
        this.dom.blur();
    }

    set channels(value) {
        if (this._channels === value) return;
        this._channels = Math.max(1, Math.min(value, 4));

        // change default value

        if (this.value) {
            this._renderGradient();
        }
    }

    get channels() {
        return this._channels;
    }

    set value(value) {
        // TODO: maybe we should check for equality
        // but since this value will almost always be set using
        // the picker it's not worth the effort
        this._value = value;

        this.class.remove(CLASS_MULTIPLE_VALUES);

        this._renderGradient();

        this.emit('change', value);

        this.setValue([value]);
    }

    get value() {
        return this._value;
    }

    set values(values: any) { // eslint-disable-line accessor-pairs
        // we do not support multiple values so just
        // add the multiple values class which essentially disables
        // the input
        this.class.add(CLASS_MULTIPLE_VALUES);
        this._renderGradient();
    }

    protected _generateHue(canvas: Canvas) {
        const canvasElement = canvas.dom as HTMLCanvasElement;
        const ctx = canvasElement.getContext('2d');
        const w = canvas.pixelWidth;
        const h = canvas.pixelHeight;
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        for (let t = 0; t <= 6; t += 1) {
            gradient.addColorStop(t / 6, this.Helpers.rgbaStr(_hsv2rgb([t / 6, 1, 1])));
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }

    protected _generateAlpha(canvas: Canvas) {
        const canvasElement = canvas.dom as HTMLCanvasElement;
        const ctx = canvasElement.getContext('2d');
        const w = canvas.pixelWidth;
        const h = canvas.pixelHeight;
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, 'rgb(255, 255, 255)');
        gradient.addColorStop(1, 'rgb(0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }

    protected _generateGradient(canvas: Canvas, clr: number[]) {
        const canvasElement = canvas.dom as HTMLCanvasElement;
        const ctx = canvasElement.getContext('2d');
        const w = canvas.pixelWidth;
        const h = canvas.pixelHeight;

        let gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, this.Helpers.rgbaStr([255, 255, 255, 255]));
        gradient.addColorStop(1, this.Helpers.rgbaStr([clr[0], clr[1], clr[2], 255]));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 255)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }

    protected _onFieldChanged() {
        if (!this._changing) {
            const rgba = [
                this._rField.value,
                this._gField.value,
                this._bField.value,
                this._aField.value
            ].map(function (v) {
                return v / 255;
            });
            this.hsva = this.Helpers.toHsva(rgba);
            this.colorSelectedAnchor(this.color);
        }
    }

    protected _onHexChanged() {
        if (!this._changing) {
            // @ts-ignore
            const hex = this._hexField.value.trim().toLowerCase();
            if (/^([0-9a-f]{2}){3,4}$/.test(hex)) {
                const rgb = [parseInt(hex.substring(0, 2), 16),
                    parseInt(hex.substring(2, 4), 16),
                    parseInt(hex.substring(4, 6), 16)];
                this.hsva = _rgb2hsv(rgb).concat([this.hsva[3]]);
                this.colorSelectedAnchor(this.color);
            }
        }
    }

    protected _onMouseDown(evt: MouseEvent) {
        if (evt.currentTarget === this._colorRect.dom) {
            this._dragMode = 1;     // drag color
        } else if (evt.currentTarget === this._hueRect.dom) {
            this._dragMode = 2;     // drag hue
        } else {
            this._dragMode = 3;     // drag alpha
        }

        this._storeHsva = this._hsva.slice();
        this._onMouseMove(evt);

        // hook up mouse
        window.addEventListener('mousemove', this.moveHandler);
        window.addEventListener('mouseup', this.upHandler);
    }

    protected _onMouseMove(evt: MouseEvent) {
        let newhsva;
        if (this._dragMode === 1) {
            const m = this.Helpers.normalizedCoord(this._colorRect, evt.pageX, evt.pageY);
            const s = math.clamp(m[0], 0, 1);
            const v = math.clamp(m[1], 0, 1);
            newhsva = [this.hsva[0], s, 1 - v, this._hsva[3]];
        } else if (this._dragMode === 2) {
            const m = this.Helpers.normalizedCoord(this._hueRect, evt.pageX, evt.pageY);
            const h = math.clamp(m[1], 0, 1);
            newhsva = [h, this.hsva[1], this.hsva[2], this.hsva[3]];
        } else {
            const m = this.Helpers.normalizedCoord(this._alphaRect, evt.pageX, evt.pageY);
            const a = math.clamp(m[1], 0, 1);
            newhsva = [this.hsva[0], this.hsva[1], this.hsva[2], 1 - a];
        }
        if (newhsva[0] !== this._hsva[0] ||
            newhsva[1] !== this._hsva[1] ||
            newhsva[2] !== this._hsva[2] ||
            newhsva[3] !== this._hsva[3]) {
            this.hsva = newhsva;
            this.emit('changing', this.color);
        }
    }

    protected _onMouseUp(evt: MouseEvent) {
        window.removeEventListener('mousemove', this.moveHandler);
        window.removeEventListener('mouseup', this.upHandler);

        if (this._storeHsva[0] !== this._hsva[0] ||
            this._storeHsva[1] !== this._hsva[1] ||
            this._storeHsva[2] !== this._hsva[2] ||
            this._storeHsva[3] !== this._hsva[3]) {
            this.colorSelectedAnchor(this.color);
        }
    }

    set hsva(hsva) {
        const rgb = _hsv2rgb(hsva);
        const hueRgb = _hsv2rgb([hsva[0], 1, 1]);

        // regenerate gradient canvas if hue changes
        if (hsva[0] !== this._hsva[0]) {
            this._generateGradient(this._colorRect, hueRgb);
        }

        const e = this._colorRect.dom;
        const r = e.getBoundingClientRect();
        const w = r.width - 2;
        const h = r.height - 2;

        this._colorHandle.style.backgroundColor = this.Helpers.rgbaStr(rgb);
        this._colorHandle.style.left = e.offsetLeft - 7 + Math.floor(w * hsva[1]) + 'px';
        this._colorHandle.style.top = e.offsetTop - 7 + Math.floor(h * (1 - hsva[2])) + 'px';

        this._hueHandle.style.backgroundColor = this.Helpers.rgbaStr(hueRgb);
        this._hueHandle.style.top = e.offsetTop - 3 + Math.floor(140 * hsva[0]) + 'px';
        this._hueHandle.style.left = '162px';

        this._alphaHandle.style.backgroundColor = this.Helpers.rgbaStr(_hsv2rgb([0, 0, hsva[3]]));
        this._alphaHandle.style.top = e.offsetTop - 3 + Math.floor(140 * (1 - hsva[3]))  + 'px';
        this._alphaHandle.style.left = '194px';

        this._changing = true;
        this._rField.value = rgb[0];
        this._gField.value = rgb[1];
        this._bField.value = rgb[2];
        this._aField.value = Math.round(hsva[3] * 255);
        this._hexField.value = this.Helpers.hexStr(rgb);
        this._changing = false;

        this._hsva = hsva;
    }

    get hsva() {
        return this._hsva;
    }

    set color(clr) {
        const hsva = this.Helpers.toHsva(clr);
        if (hsva[0] === 0 && hsva[1] === 0 && this._hsva[0] !== -1) {
            // if the incoming RGB is a shade of grey (without hue),
            // use the current active hue instead.
            hsva[0] = this._hsva[0];
        }
        this.hsva = hsva;
    }

    get color() {
        return this.Helpers.toRgba(this._hsva);
    }

    set editAlpha(editAlpha) {
        if (editAlpha) {
            this._alphaRect.dom.style.display = 'inline';
            this._alphaHandle.style.display = 'block';
            this._aField.dom.style.display = 'inline-block';
        } else {
            this._alphaRect.dom.style.display = 'none';
            this._alphaHandle.style.display = 'none';
            this._aField.dom.style.display = 'none';
        }
    }

    get editAlpha(): any {
        return this.editAlpha;
    }

    // open the picker
    open() {
        this.UI.overlay.hidden = false;
    }

    // close the picker
    close() {
        this.UI.overlay.hidden = true;
    }

    // handle the picker being opened
    onOpen() {
        window.addEventListener('mousemove', this._onAnchorsMouseMove);
        window.addEventListener('mouseup', this._onAnchorsMouseUp);
        this.UI.anchors.dom.addEventListener('mousedown', this._onAnchorsMouseDown);
        // editor.emit('picker:gradient:open');
        // editor.emit('picker:open', 'gradient');
    }

    // handle the picker being closed
    onClose() {
        this.STATE.hoveredAnchor = -1;
        window.removeEventListener('mousemove', this._onAnchorsMouseMove);
        window.removeEventListener('mouseup', this._onAnchorsMouseUp);
        this.UI.anchors.dom.removeEventListener('mousedown', this._onAnchorsMouseDown);

        this._evtRefreshPicker.unbind();
        this._evtRefreshPicker = null;
        this._evtPickerChanged.unbind();
        this._evtPickerChanged = null;
    }

    onDeleteKey() {
        if (!this.UI.overlay.hidden) {
            if (this.STATE.selectedAnchor !== -1) {
                const deleteTime = this.STATE.anchors[this.STATE.selectedAnchor];
                this.STATE.selectedAnchor = -1;
                this.deleteAnchor(deleteTime);
            }
        }
    }

    protected _onTypeChanged(value: number) {
        value = this.STATE.typeMap[value];
        const paths: any = [];
        const values: any[] = [];
        for (let i = 0; i < this.STATE.curves.length; ++i) {
            paths.push(i.toString() + '.type');
            values.push(value);
        }
        this.emit('picker:curve:change', paths, values);
    }

    render() {
        this.renderGradient();
        this.renderAnchors();
    }

    renderGradient() {
        const ctx = this.UI.gradient.dom.getContext('2d');
        const w = this.UI.gradient.width;
        const h = this.UI.gradient.height;
        const r = this.UI.gradient.pixelRatio;

        ctx.setTransform(r, 0, 0, r, 0, 0);

        // fill background
        ctx.fillStyle = this.UI.checkerPattern;
        ctx.fillRect(0, 0, w, h);

        // fill gradient
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        for (let t = 0; t <= w; t += 2) {
            const x = t / w;
            gradient.addColorStop(x, this.Helpers.rgbaStr(this.evaluateGradient(x), 255));
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // render the tip of the selected anchor
        if (this.STATE.selectedAnchor !== -1) {
            const time = this.STATE.anchors[this.STATE.selectedAnchor];
            const coords = [time * w, h];

            const rectHeight = this.UI.draggingAnchor ? -30 : -6;

            ctx.beginPath();
            ctx.rect(coords[0] - 0.5,
                     coords[1],
                     1,
                     rectHeight);
            ctx.fillStyle = 'rgb(41, 53, 56)';
            ctx.fill();
        }
    }

    renderAnchors() {
        const ctx = this.UI.anchors.dom.getContext('2d');
        const w = this.UI.anchors.width;
        const h = this.UI.anchors.height;
        const r = this.UI.anchors.pixelRatio;

        ctx.setTransform(r, 0, 0, r, 0, 0);

        ctx.fillStyle = this.CONSTANTS.bg;
        ctx.fillRect(0, 0, w, h);

        // render plain anchors
        for (let index = 0; index < this.STATE.anchors.length; ++index) {

            if (index !== this.STATE.hoveredAnchor &&
                index !== this.STATE.selectedAnchor) {
                this.renderAnchor(ctx, this.STATE.anchors[index]);
            }
        }

        if ((this.STATE.hoveredAnchor !== -1) &&
            (this.STATE.hoveredAnchor !== this.STATE.selectedAnchor)) {
            this.renderAnchor(ctx, this.STATE.anchors[this.STATE.hoveredAnchor], "hovered");
        }

        if (this.STATE.selectedAnchor !== -1) {
            this.renderAnchor(ctx, this.STATE.anchors[this.STATE.selectedAnchor], "selected");
        }
    }

    renderAnchor(ctx: CanvasRenderingContext2D, time: number, type?: string) {
        const coords = [time * this.UI.anchors.width, this.UI.anchors.height / 2];
        const radius = (type === "selected" ? this.CONSTANTS.selectedRadius : this.CONSTANTS.anchorRadius);

        // render selected arrow
        if (type === "selected") {

            ctx.beginPath();
            ctx.rect(coords[0] - 0.5,
                     coords[1],
                     1,
                     -coords[1]);
            ctx.fillStyle = 'rgb(41, 53, 56)';
            ctx.fill();
        }

        // render selection highlight
        if (type === "selected" || type === "hovered") {
            ctx.beginPath();
            ctx.arc(coords[0], coords[1], (radius + 2), 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(coords[0], coords[1], (radius + 1), 0, 2 * Math.PI, false);
        ctx.fillStyle = this.Helpers.rgbaStr(this.evaluateGradient(time, 1), 255);
        ctx.fill();
    }

    evaluateGradient(time: number, alphaOverride?: number) {
        const result: any = [];
        for (let i = 0; i < 3; ++i) {
            result.push(this.STATE.curves[i].value(time));
        }

        if (alphaOverride) {
            result.push(alphaOverride);
        } else if (this.STATE.curves.length > 3) {
            result.push(this.STATE.curves[3].value(time));
        } else {
            result.push(1);
        }

        return result;
    }

    calcAnchorTimes() {
        // get curve anchor points
        let times: any = [];
        for (let i = 0; i < this.STATE.curves.length; i++) {
            const curve = this.STATE.curves[i];
            for (let j = 0; j < curve.keys.length; ++j) {
                times.push(curve.keys[j][0]);
            }
        }

        // sort anchors and remove duplicates
        times.sort();
        times = times.filter(function (item: any, pos: any, ary: any) {
            return !pos || item !== ary[pos - 1];
        });

        return times;
    }

    // helper function for calculating the normalized coordinate
    // x,y relative to rect
    calcNormalizedCoord(x: number, y: number, rect: DOMRect) {
        return [(x - rect.left) / rect.width,
            (y - rect.top) / rect.height];
    }

    // get the bounding client rect minus padding
    getClientRect(element: any) {
        const styles = window.getComputedStyle(element);

        const paddingTop = parseFloat(styles.paddingTop);
        const paddingRight = parseFloat(styles.paddingRight);
        const paddingBottom = parseFloat(styles.paddingBottom);
        const paddingLeft = parseFloat(styles.paddingLeft);

        const rect = element.getBoundingClientRect();

        return new DOMRect(rect.x + paddingLeft,
                           rect.y + paddingTop,
                           rect.width - paddingRight - paddingLeft,
                           rect.height - paddingTop - paddingBottom);
    }

    protected _onAnchorsMouseDown = (e: MouseEvent) => {
        if (this.STATE.hoveredAnchor === -1) {
            // user clicked in empty space, create new anchor and select it
            const coord = this.calcNormalizedCoord(e.clientX,
                                                   e.clientY,
                                                   this.getClientRect(this.UI.anchors.dom));
            this.insertAnchor(coord[0], this.evaluateGradient(coord[0]));
            this.STATE.anchors = this.calcAnchorTimes();
            this.selectAnchor(this.STATE.anchors.indexOf(coord[0]));
        } else if (this.STATE.hoveredAnchor !== this.STATE.selectedAnchor) {
            // select the hovered anchor
            this.selectAnchor(this.STATE.hoveredAnchor);
        }

        this.UI.anchors.dom.style.cursor = 'grabbing';
        this.UI.anchorAddCrossHair.style.visibility = 'hidden';

        // drag the selected anchor
        this.dragStart();
        this.UI.draggingAnchor = true;
    };

    protected _onAnchorsMouseMove = (e: MouseEvent) => {
        const coord = this.calcNormalizedCoord(e.clientX,
                                               e.clientY,
                                               this.getClientRect(this.UI.anchors.dom));

        if (this.UI.draggingAnchor) {
            this.dragUpdate(math.clamp(coord[0], 0, 1));
            this.UI.anchorAddCrossHair.style.visibility = 'hidden';
        } else if (coord[0] >= 0 &&
                   coord[0] <= 1 &&
                   coord[1] >= 0 &&
                   coord[1] <= 1) {
            let closest = -1;
            let closestDist = 0;
            for (let index = 0; index < this.STATE.anchors.length; ++index) {
                const dist = Math.abs(this.STATE.anchors[index] - coord[0]);
                if (closest === -1 || dist < closestDist) {
                    closest = index;
                    closestDist = dist;
                }
            }

            const hoveredAnchor = (closest !== -1 && closestDist < 0.02) ? closest : -1;
            if (hoveredAnchor !== this.STATE.hoveredAnchor) {
                this.selectHovered(hoveredAnchor);
                this.render();
            }

            if (hoveredAnchor === -1) {
                this.UI.anchorAddCrossHair.style.visibility = 'visible';
                this.UI.anchors.dom.style.cursor = 'none';
            } else {
                this.UI.anchorAddCrossHair.style.visibility = 'hidden';
            }


            this.UI.showCrosshairPosition.innerText = (Math.round(coord[0] * 100)).toString();

            this.UI.anchorAddCrossHair.style.left = (2.5 + 320 * coord[0]).toString() + "px";

        } else if (this.STATE.hoveredAnchor !== -1) {
            this.UI.anchorAddCrossHair.style.visibility = 'hidden';
            this.selectHovered(-1);
            this.render();
        } else {
            this.UI.anchorAddCrossHair.style.visibility = 'hidden';
        }
    };

    protected _onAnchorsMouseUp = (evt: MouseEvent) => {
        if (this.UI.draggingAnchor) {
            this.dragEnd();
            this.UI.draggingAnchor = false;
        }

        this.UI.anchors.dom.style.cursor = 'pointer';
    };

    selectHovered(index: number) {
        this.STATE.hoveredAnchor = index;
        this.UI.anchors.dom.style.cursor = (index === -1 ? '' : 'pointer');
    }

    selectAnchor(index: number) {
        this.STATE.selectedAnchor = index;
        this.STATE.changing = true;
        if (index === -1) {
            this.UI.positionEdit.value = "";
            this.color = [0, 0, 0];
        } else {
            const time = this.STATE.anchors[index];
            this.UI.positionEdit.value = Math.round(time * 100);
            this.STATE.selectedValue = this.evaluateGradient(time);
            this.color = this.STATE.selectedValue;
            this.UI.showSelectedPosition.dom.style.left = (this.STATE.anchors[index] * this.UI.gradient.width - 4).toString() + "px";
            this.UI.showSelectedPosition.value = Math.round(this.STATE.anchors[index] * 100);
        }
        this.STATE.changing = false;
        this.render();
    }

    dragStart() {
        if (this.STATE.selectedAnchor === -1) {
            return;
        }
        const time = this.STATE.anchors[this.STATE.selectedAnchor];
        // make a copy of the curve data before editing starts
        this.STATE.keystore = [];
        for (let i = 0; i < this.STATE.curves.length; ++i) {
            const keys: any[][] = [];
            this.STATE.curves[i].keys.forEach(function (element: any[]) {
                if (element[0] !== time) {
                    keys.push([element[0], element[1]]);
                }
            });
            this.STATE.keystore.push(keys);
        }
    }

    dragUpdate(time: any) {
        if (this.STATE.selectedAnchor === -1) {
            return;
        }
        for (let i = 0; i < this.STATE.curves.length; ++i) {
            const curve = this.STATE.curves[i];
            const keystore = this.STATE.keystore[i];

            // merge keystore with the drag anchor (ignoring existing anchors at
            // the current anchor location)
            curve.keys = keystore.map(function (element: any[]) {
                return [element[0], element[1]];
            })
                .filter(function (element: any[]) {
                    return element[0] !== time;
                });
            curve.keys.push([time, this.STATE.selectedValue[i]]);
            curve.sort();
        }

        this.STATE.anchors = this.calcAnchorTimes();
        this.selectAnchor(this.STATE.anchors.indexOf(time));
    }

    dragEnd() {
        if (this.STATE.selectedAnchor !== -1) {
            this.emitCurveChange();
        }
    }

    // insert an anchor at the given time with the given color
    insertAnchor(time: number, color: any[]) {
        for (let i = 0; i < this.STATE.curves.length; ++i) {
            const keys = this.STATE.curves[i].keys;

            let j = 0;
            while (j < keys.length) {
                if (keys[j][0] >= time) {
                    break;
                }
                ++j;
            }

            if (j < keys.length && keys[j][0] === time) {
                keys[j][1] = color[i];
            } else {
                keys.splice(j, 0, [time, color[i]]);
            }
        }
        this.emitCurveChange();
    }

    // delete the anchor(s) at the given time
    deleteAnchor(time: any) {
        for (let i = 0; i < this.STATE.curves.length; ++i) {
            const curve = this.STATE.curves[i];

            for (let j = 0; j < curve.keys.length; ++j) {
                if (curve.keys[j][0] === time) {
                    curve.keys.splice(j, 1);
                    break;
                }
            }
        }
        this.selectHovered(-1);
        this.emitCurveChange();
    }

    moveSelectedAnchor(time: any) {
        if (this.STATE.selectedAnchor !== -1) {
            this.dragStart();
            this.dragUpdate(time);
            this.dragEnd();
        }
    }

    colorSelectedAnchor(clr: any[], dragging?: any) {
        if (this.STATE.selectedAnchor !== -1) {
            const time = this.STATE.anchors[this.STATE.selectedAnchor];

            for (let i = 0; i < this.STATE.curves.length; ++i) {
                const curve = this.STATE.curves[i];

                for (let j = 0; j < curve.keys.length; ++j) {
                    if (curve.keys[j][0] === time) {
                        curve.keys[j][1] = clr[i];
                        break;
                    }
                }
            }
            this.STATE.selectedValue = clr;
            if (dragging) {
                this.render();
            } else {
                this.emitCurveChange();
            }
        }
    }

    emitCurveChange() {
        const paths: string[] = [];
        const values: any[][] = [];
        this.STATE.curves.forEach(function (curve: any, index: number) {
            paths.push('0.keys.' + index);
            const keys: any[] = [];
            curve.keys.forEach(function (key: any[]) {
                keys.push(key[0], key[1]);
            });
            values.push(keys);
        });
        this.emit('picker:curve:change', paths, values);
    }

    doCopy() {
        const data = {
            type: this.STATE.curves[0].type,
            keys: this.STATE.curves.map(function (c: any) {
                return [].concat(...c.keys);
            })
        };
        this._copiedData = data;
    }

    doPaste() {
        const data = this._copiedData;
        if (data !== null) {
            // only paste the number of curves we're currently editing
            const pasteData: any = {
                type: data.type,
                keys: []
            };

            for (let index = 0; index < this.STATE.curves.length; ++index) {
                if (index < data.keys.length) {
                    pasteData.keys.push(data.keys[index]);
                } else {
                    pasteData.keys.push([].concat(...this.STATE.curves[index].keys));
                }
            }

            this.setValue([pasteData]);
            this.emitCurveChange();
        }
    }

    doDelete() {
        const toDelete = this.STATE.selectedAnchor;

        if (toDelete === -1 || this.STATE.curves[0].keys.length === 1) {
            return;
        }

        for (let i = 0; i < this.STATE.curves.length; ++i) {
            const keys = this.STATE.curves[i].keys;

            keys.splice(toDelete, 1);
        }


        this.emitCurveChange();
    }

    createCheckerPattern() {
        const canvas = new Canvas();
        canvas.width = 16;
        canvas.height = 16;

        const canvasElement = canvas.dom as HTMLCanvasElement;
        const ctx = canvasElement.getContext('2d');
        ctx.fillStyle = "#949a9c";
        ctx.fillRect(0, 0, 8, 8);
        ctx.fillRect(8, 8, 8, 8);
        ctx.fillStyle = "#657375";
        ctx.fillRect(8, 0, 8, 8);
        ctx.fillRect(0, 8, 8, 8);
        return ctx.createPattern(canvasElement, 'repeat');
    }

    setValue(value: any, args?: any) {
        // sanity checks mostly for script 'curve' attributes
        if (!(value instanceof Array) ||
            value.length !== 1 ||
            value[0].keys === undefined ||
            (value[0].keys.length !== 3 && value[0].keys.length !== 4))
            return;

        // store the curve type
        const comboItems = {
            0: 'Step',
            1: 'Linear',
            2: 'Spline'
        };

        this.STATE.typeMap = {
            0: CURVE_STEP,
            1: CURVE_LINEAR,
            2: CURVE_SPLINE
        };
        const indexMap = Object.fromEntries(
            Object
                .entries(this.STATE.typeMap)
                .map(([key, value]) => [value, key])
        );
        // check if curve is using a legacy curve type
        if (value[0].type !== CURVE_STEP &&
            value[0].type !== CURVE_LINEAR &&
            value[0].type !== CURVE_SPLINE) {
            // @ts-ignore
            comboItems[3] = 'Legacy';
            this.STATE.typeMap[3] = value[0].type;
        }
        this.UI.typeCombo.options = [{ v: 0, t: 'Step' }, { v: 1, t: 'Linear' }, { v: 2, t: 'Spline' }];
        this.UI.typeCombo.value = this.UI.typeCombo.value === -1 ? indexMap[this.value.type] : this.UI.typeCombo.value;

        // store the curves
        this.STATE.curves = [];
        value[0].keys.forEach((keys: any) => {
            const curve = new Curve(keys);
            curve.type = value[0].type;
            this.STATE.curves.push(curve);
        });

        // calculate the anchor times
        this.STATE.anchors = this.calcAnchorTimes();

        // select the anchor
        if (this.STATE.anchors.length === 0) {
            this.selectAnchor(-1);
        } else {
            this.selectAnchor(math.clamp(this.STATE.selectedAnchor, 0, this.STATE.anchors.length - 1));
        }

        this.editAlpha = this.STATE.curves.length > 3;
    }

    callOpenGradientPicker(value: any, args?: any) {
        this.setValue(value, args);
        this.open();
    }

    getGradientPickerRect() {
        return this.UI.overlay.dom.getBoundingClientRect();
    }

    positionGradientPicker(x: number, y: number) {
        if (y + this.UI.panel.clientHeight > window.innerHeight) {
            y = window.innerHeight - this.UI.panel.clientHeight;
        }
        this.UI.overlay.position(x, y);
    }

    setGradientPicker(value: any, args?: any) {
        this.setValue(value, args);
    }
}

Element.register('div', GradientPicker);

export default GradientPicker;
