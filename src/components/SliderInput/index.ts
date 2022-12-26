import Element, { ElementArgs, IBindable, IBindableArgs, IFlexArgs, IFocusable } from '../Element/index';
import NumericInput, { NumericInputArgs } from '../NumericInput';
import * as pcuiClass from '../../class';
import * as utils from '../../helpers/utils';

const CLASS_SLIDER = 'pcui-slider';
const CLASS_SLIDER_CONTAINER = CLASS_SLIDER + '-container';
const CLASS_SLIDER_BAR = CLASS_SLIDER + '-bar';
const CLASS_SLIDER_HANDLE = CLASS_SLIDER + '-handle';
const CLASS_SLIDER_ACTIVE = CLASS_SLIDER + '-active';

const IS_CHROME = /Chrome\//.test(navigator.userAgent);

// fields that are proxied between the slider and the numeric input
const PROXY_FIELDS = [
    'allowNull',
    'max',
    'min',
    'keyChange',
    'placeholder',
    'precision',
    'renderChanges',
    'step'
];


export interface SliderInputArgs extends ElementArgs, IBindableArgs, IFlexArgs {
    /**
     * Gets / sets the minimum value that the numeric input field can take. Defaults to 0.
     */
    min?: number,
    /**
     * Gets / sets the maximum value that the numeric input field can take. Defaults to 1.
     */
    max?: number,
    /**
     * Gets / sets the minimum value that the slider field can take.
     */
    sliderMin?: number,
    /**
     * Gets / sets the maximum value that the slider field can take.
     */
    sliderMax?: number,
    /**
     * Gets / sets the maximum number of decimals a value can take. Here for backwards
     * compatibility. Use the precision argument instead going forward.
     */
    pre?: number,
    /**
     * Gets / sets the maximum number of decimals a value can take.
     */
    precision?: number,
    /**
     * Gets / sets the amount that the value will be increased or decreased when using the arrow
     * keys. Holding Shift will use 10x the step.
     */
    step?: number,
    /**
     * Gets / sets whether the value can be null. If not then it will be 0 instead of null.
     */
    allowNull?: boolean
}

/**
 * The SliderInput shows a NumericInput and a slider widget next to it. It acts as a proxy of the
 * NumericInput.
 */
class SliderInput extends Element implements IBindable, IFocusable {
    static readonly defaultArgs: SliderInputArgs = {
        ...Element.defaultArgs,
        min: 0,
        max: 1
    };

    protected _historyCombine: boolean;

    protected _historyPostfix: any;

    protected _numericInput: NumericInput;

    protected _sliderMin: number;

    protected _sliderMax: number;

    protected _domSlider: HTMLDivElement;

    protected _domBar: HTMLDivElement;

    protected _domHandle: HTMLDivElement;

    protected _cursorHandleOffset: number;

    protected _domMouseDown: any;

    protected _domMouseMove: any;

    protected _domMouseUp: any;

    protected _domTouchStart: any;

    protected _domTouchMove: any;

    protected _domTouchEnd: any;

    protected _domKeyDown: any;

    protected _touchId: number;

    /**
     * Creates a new SliderInput.
     *
     * @param args
     */
    constructor(args: SliderInputArgs = SliderInput.defaultArgs) {
        args = { ...SliderInput.defaultArgs, ...args };
        const inputArgs: NumericInputArgs = {};
        PROXY_FIELDS.forEach((field) => {
            // @ts-ignore
            inputArgs[field] = args[field];
        });

        if (inputArgs.precision === undefined) {
            inputArgs.precision = 2;
        }

        // binding should only go to the slider
        // and the slider will propagate changes to the numeric input
        delete inputArgs.binding;

        super(args.dom ? args.dom : document.createElement('div'), args);

        this.class.add(CLASS_SLIDER);

        this._historyCombine = false;
        this._historyPostfix = null;

        this._numericInput = new NumericInput({ ...inputArgs, hideSlider: true });

        if (args.precision) {
            this.precision = args.precision;
        } else if (args.pre) {
            this.precision = args.pre;
        }

        // propagate change event
        this._numericInput.on('change', this._onValueChange.bind(this));
        // propagate focus / blur events
        this._numericInput.on('focus', () => {
            this.emit('focus');
        });

        this._numericInput.on('blur', () => {
            this.emit('blur');
        });

        this._sliderMin = (args.sliderMin !== undefined ? args.sliderMin : args.min);
        this._sliderMax = (args.sliderMax !== undefined ? args.sliderMax : args.max);

        this.dom.appendChild(this._numericInput.dom);
        this._numericInput.parent = this;

        this._domSlider = document.createElement('div');
        this._domSlider.classList.add(CLASS_SLIDER_CONTAINER);
        this.dom.appendChild(this._domSlider);

        this._domBar = document.createElement('div');
        this._domBar.classList.add(CLASS_SLIDER_BAR);
        this._domBar.ui = this;
        this._domSlider.appendChild(this._domBar);

        this._domHandle = document.createElement('div');
        this._domHandle.ui = this;
        this._domHandle.tabIndex = 0;
        this._domHandle.classList.add(CLASS_SLIDER_HANDLE);
        this._domBar.appendChild(this._domHandle);
        this._cursorHandleOffset = 0;

        this._domMouseDown = this._onMouseDown.bind(this);
        this._domMouseMove = this._onMouseMove.bind(this);
        this._domMouseUp = this._onMouseUp.bind(this);
        this._domTouchStart = this._onTouchStart.bind(this);
        this._domTouchMove = this._onTouchMove.bind(this);
        this._domTouchEnd = this._onTouchEnd.bind(this);
        this._domKeyDown = this._onKeyDown.bind(this);

        this._touchId = null;

        this._domSlider.addEventListener('mousedown', this._domMouseDown);
        this._domSlider.addEventListener('touchstart', this._domTouchStart, { passive: true });
        this._domHandle.addEventListener('keydown', this._domKeyDown);

        if (args.value !== undefined) {
            this.value = args.value;
        }
        if (args.values !== undefined) {
            this.values = args.values;
        }

        // update the handle in case a 0 value has been
        // passed through the constructor
        if (this.value === 0) {
            this._updateHandle(0);
        }
    }

    protected _onMouseDown(evt: MouseEvent) {
        if (evt.button !== 0 || !this.enabled || this.readOnly) return;
        this._onSlideStart(evt.pageX);
    }

    protected _onMouseMove(evt: MouseEvent) {
        evt.stopPropagation();
        evt.preventDefault();
        this._onSlideMove(evt.pageX);
    }

    protected _onMouseUp(evt: MouseEvent) {
        evt.stopPropagation();
        evt.preventDefault();
        this._onSlideEnd(evt.pageX);
    }

    protected _onTouchStart(evt: TouchEvent) {
        if (!this.enabled || this.readOnly) return;

        for (let i = 0; i < evt.changedTouches.length; i++) {
            const touch = evt.changedTouches[i];
            // @ts-ignore
            if (!touch.target.ui || touch.target.ui !== this)
                continue;

            this._touchId = touch.identifier;
            this._onSlideStart(touch.pageX);
            break;
        }
    }

    protected _onTouchMove(evt: TouchEvent) {
        for (let i = 0; i < evt.changedTouches.length; i++) {
            const touch = evt.changedTouches[i];

            if (touch.identifier !== this._touchId)
                continue;

            evt.stopPropagation();
            evt.preventDefault();

            this._onSlideMove(touch.pageX);
            break;
        }
    }

    protected _onTouchEnd(evt: TouchEvent) {
        for (let i = 0; i < evt.changedTouches.length; i++) {
            const touch = evt.changedTouches[i];

            if (touch.identifier !== this._touchId)
                continue;

            evt.stopPropagation();
            evt.preventDefault();

            this._onSlideEnd(touch.pageX);
            this._touchId = null;
            break;
        }
    }

    protected _onKeyDown(evt: KeyboardEvent) {
        if (evt.key === 'Escape') {
            this.blur();
            return;
        }

        if (!this.enabled || this.readOnly) return;

        // move slider with left / right arrow keys
        if (evt.key !== 'ArrowLeft' && evt.key !== 'ArrowRight') return;

        evt.stopPropagation();
        evt.preventDefault();
        let x = evt.key === 'ArrowLeft' ? -1 : 1;
        if (evt.shiftKey) {
            x *= 10;
        }

        this.value += x * this.step;
    }

    protected _updateHandle(value: number) {
        const left = Math.max(0, Math.min(1, ((value || 0) - this._sliderMin) / (this._sliderMax - this._sliderMin))) * 100;
        const handleWidth = this._domHandle.getBoundingClientRect().width;
        this._domHandle.style.left = `calc(${left}% + ${handleWidth / 2}px)`;
    }

    protected _onValueChange(value: number) {
        this._updateHandle(value);
        if (!this._suppressChange) {
            this.emit('change', value);
        }

        if (this._binding) {
            this._binding.setValue(value);
        }
    }

    // Calculates the distance in pixels between
    // the cursor x and the middle of the handle.
    // If the cursor is not on the handle sets the offset to 0
    protected _calculateCursorHandleOffset(pageX: number) {
        // not sure why but the left side needs a margin of a couple of pixels
        // to properly determine if the cursor is on the handle (in Chrome)
        const margin = IS_CHROME ? 2 : 0;
        const rect = this._domHandle.getBoundingClientRect();
        const left = rect.left - margin;
        const right = rect.right;
        if (pageX >= left && pageX <= right) {
            this._cursorHandleOffset = pageX - (left + (right - left) / 2);
        } else {
            this._cursorHandleOffset = 0;
        }

        return this._cursorHandleOffset;
    }

    protected _onSlideStart(pageX: number) {
        this._domHandle.focus();
        if (this._touchId === null) {
            window.addEventListener('mousemove', this._domMouseMove);
            window.addEventListener('mouseup', this._domMouseUp);
        } else {
            window.addEventListener('touchmove', this._domTouchMove);
            window.addEventListener('touchend', this._domTouchEnd);
        }

        this.class.add(CLASS_SLIDER_ACTIVE);

        // calculate the cursor - handle offset. If there is
        // an offset that means the cursor is on the handle so
        // do not move the handle until the cursor moves.
        if (!this._calculateCursorHandleOffset(pageX)) {
            this._onSlideMove(pageX);
        }

        if (this.binding) {
            this._historyCombine = this.binding.historyCombine;
            this._historyPostfix = this.binding.historyPostfix;

            this.binding.historyCombine = true;
            this.binding.historyPostfix = `(${Date.now()})`;
        }
    }

    protected _onSlideMove(pageX: number) {
        const rect = this._domBar.getBoundingClientRect();
        // reduce pageX by the initial cursor - handle offset
        pageX -= this._cursorHandleOffset;
        const x = Math.max(0, Math.min(1, (pageX - rect.left) / rect.width));

        const range = this._sliderMax - this._sliderMin;
        let value = (x * range) + this._sliderMin;
        value = parseFloat(value.toFixed(this.precision));

        this.value = value;
    }

    protected _onSlideEnd(pageX: number) {
        // when slide ends only move the handle if the cursor is no longer
        // on the handle
        if (!this._calculateCursorHandleOffset(pageX)) {
            this._onSlideMove(pageX);
        }

        this.class.remove(CLASS_SLIDER_ACTIVE);

        if (this._touchId === null) {
            window.removeEventListener('mousemove', this._domMouseMove);
            window.removeEventListener('mouseup', this._domMouseUp);
        } else {
            window.removeEventListener('touchmove', this._domTouchMove);
            window.removeEventListener('touchend', this._domTouchEnd);
        }

        if (this.binding) {
            this.binding.historyCombine = this._historyCombine;
            this.binding.historyPostfix = this._historyPostfix;

            this._historyCombine = false;
            this._historyPostfix = null;
        }

    }

    focus() {
        this._numericInput.focus();
    }

    blur() {
        this._domHandle.blur();
        this._numericInput.blur();
    }

    destroy() {
        if (this._destroyed) return;
        this._domSlider.removeEventListener('mousedown', this._domMouseDown);
        this._domSlider.removeEventListener('touchstart', this._domTouchStart);

        this._domHandle.removeEventListener('keydown', this._domKeyDown);

        this.dom.removeEventListener('mouseup', this._domMouseUp);
        this.dom.removeEventListener('mousemove', this._domMouseMove);
        this.dom.removeEventListener('touchmove', this._domTouchMove);
        this.dom.removeEventListener('touchend', this._domTouchEnd);
        super.destroy();
    }

    /**
     * Gets / sets the minimum value that the slider field can take.
     */
    set sliderMin(value) {
        if (this._sliderMin === value) return;

        this._sliderMin = value;
        this._updateHandle(this.value);
    }

    get sliderMin() {
        return this._sliderMin;
    }

    /**
     * Gets / sets the maximum value that the slider field can take.
     */
    set sliderMax(value) {
        if (this._sliderMax === value) return;

        this._sliderMax = value;
        this._updateHandle(this.value);
    }

    get sliderMax() {
        return this._sliderMax;
    }

    set value(value) {
        this._numericInput.value = value;
        if (this._numericInput.class.contains(pcuiClass.MULTIPLE_VALUES)) {
            this.class.add(pcuiClass.MULTIPLE_VALUES);
        } else {
            this.class.remove(pcuiClass.MULTIPLE_VALUES);
        }
    }

    get value() {
        return this._numericInput.value;
    }

    /* eslint accessor-pairs: 0 */
    set values(values: Array<number>) {
        this._numericInput.values = values;
        if (this._numericInput.class.contains(pcuiClass.MULTIPLE_VALUES)) {
            this.class.add(pcuiClass.MULTIPLE_VALUES);
        } else {
            this.class.remove(pcuiClass.MULTIPLE_VALUES);
        }
    }

    set renderChanges(value: boolean) {
        this._numericInput.renderChanges = value;
    }


    get renderChanges() {
        return this._numericInput.renderChanges;
    }

    /**
     * Gets / sets the minimum value that the numeric input field can take.
     */
    set min(value: number) {
        this._numericInput.min = value;
    }

    get min() {
        return this._numericInput.min;
    }

    /**
     * Gets / sets the maximum value that the numeric input field can take.
     */
    set max(value: number) {
        this._numericInput.max = value;
    }

    get max() {
        return this._numericInput.max;
    }

    /**
     * Gets / sets the amount that the value will be increased or decreased when using the arrow keys. Holding Shift will use 10x the step.
     */

    set step(value: number) {
        this._numericInput.step = value;
    }

    get step() {
        return this._numericInput.step;
    }

    /**
     * Gets / sets the maximum number of decimals a value can take.
     */
    set precision(value: number) {
        this._numericInput.precision = value;
    }

    get precision() {
        return this._numericInput.precision;
    }
}

utils.proxy(SliderInput, '_numericInput', PROXY_FIELDS);

Element.register('slider', SliderInput, { renderChanges: true });

export default SliderInput;
