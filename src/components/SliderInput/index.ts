import Element, { ElementArgs, IBindable, IBindableArgs, IFlexArgs, IFocusable, IPlaceholder, IPlaceholderArgs } from '../Element';
import NumericInput from '../NumericInput';
import * as pcuiClass from '../../class';

const CLASS_SLIDER = 'pcui-slider';
const CLASS_SLIDER_CONTAINER = CLASS_SLIDER + '-container';
const CLASS_SLIDER_BAR = CLASS_SLIDER + '-bar';
const CLASS_SLIDER_HANDLE = CLASS_SLIDER + '-handle';
const CLASS_SLIDER_ACTIVE = CLASS_SLIDER + '-active';

const IS_CHROME = /Chrome\//.test(globalThis.navigator?.userAgent);

/**
 * The arguments for the {@link SliderInput} constructor.
 */
export interface SliderInputArgs extends ElementArgs, IBindableArgs, IFlexArgs, IPlaceholderArgs {
    /**
     * Sets whether any key up event will cause a change event to be fired.
     */
    keyChange?: boolean,
    /**
     * Sets the minimum value that the numeric input field can take.
     */
    min?: number,
    /**
     * Sets the maximum value that the numeric input field can take.
     */
    max?: number,
    /**
     * Sets the minimum value that the slider field can take. Defaults to 0.
     */
    sliderMin?: number,
    /**
     * Sets the maximum value that the slider field can take. Defaults to 1.
     */
    sliderMax?: number,
    /**
     * Sets the maximum number of decimals a value can take. Defaults to 2.
     */
    precision?: number,
    /**
     * Sets the amount that the value will be increased or decreased when using the arrow
     * keys. Holding Shift will use 10x the step.
     */
    step?: number,
    /**
     * Sets whether the value can be null. If not then it will be 0 instead of null.
     */
    allowNull?: boolean
}

/**
 * The SliderInput shows a NumericInput and a slider widget next to it. It acts as a proxy of the
 * NumericInput.
 */
class SliderInput extends Element implements IBindable, IFocusable, IPlaceholder {
    protected _historyCombine = false;

    protected _historyPostfix: string = null;

    protected _numericInput: NumericInput;

    protected _sliderMin: number;

    protected _sliderMax: number;

    protected _domSlider: HTMLDivElement;

    protected _domBar: HTMLDivElement;

    protected _domHandle: HTMLDivElement;

    protected _cursorHandleOffset = 0;

    protected _pointerId: number = null;

    /**
     * Creates a new SliderInput.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<SliderInputArgs> = {}) {
        super(args);

        this.class.add(CLASS_SLIDER);

        const numericInput = new NumericInput({
            allowNull: args.allowNull,
            hideSlider: true,
            min: args.min,
            max: args.max,
            keyChange: args.keyChange,
            placeholder: args.placeholder,
            precision: args.precision ?? 2,
            renderChanges: args.renderChanges,
            step: args.step
        });

        // propagate change event
        numericInput.on('change', (value: number) => {
            this._onValueChange(value);
        });

        // propagate focus / blur events
        numericInput.on('focus', () => {
            this.emit('focus');
        });
        numericInput.on('blur', () => {
            this.emit('blur');
        });

        numericInput.parent = this;
        this.dom.appendChild(numericInput.dom);

        this._numericInput = numericInput;

        this._sliderMin = args.sliderMin ?? args.min ?? 0;
        this._sliderMax = args.sliderMax ?? args.max ?? 1;

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

        this._domSlider.addEventListener('pointerdown', this._onPointerDown);
        this._domHandle.addEventListener('keydown', this._onKeyDown);

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

    destroy() {
        if (this._destroyed) return;

        this._domSlider.removeEventListener('pointerdown', this._onPointerDown);
        this._domHandle.removeEventListener('keydown', this._onKeyDown);

        super.destroy();
    }

    protected _onPointerDown = (evt: PointerEvent) => {
        if ((evt.pointerType === 'mouse' && evt.button !== 0) || !this.enabled || this.readOnly || this._pointerId !== null) return;
        evt.stopPropagation();
        this._domSlider.setPointerCapture(evt.pointerId);
        this._pointerId = evt.pointerId;
        this._onSlideStart(evt.pageX);
    };

    protected _onPointerMove = (evt: PointerEvent) => {
        if (evt.pointerId !== this._pointerId) return;
        evt.stopPropagation();
        evt.preventDefault();
        this._onSlideMove(evt.pageX);
    };

    protected _onPointerUp = (evt: PointerEvent) => {
        if (evt.pointerId !== this._pointerId || this._pointerId === null) return;
        evt.stopPropagation();
        this._domSlider.releasePointerCapture(evt.pointerId);
        this._onSlideEnd(evt.pageX);
        this._pointerId = null;
    };

    protected _onKeyDown = (evt: KeyboardEvent) => {
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
    };

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
        window.addEventListener('pointermove', this._onPointerMove);
        window.addEventListener('pointerup', this._onPointerUp);

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

        window.removeEventListener('pointermove', this._onPointerMove);
        window.removeEventListener('pointerup', this._onPointerUp);

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

    set renderChanges(value) {
        this._numericInput.renderChanges = value;
    }

    get renderChanges() {
        return this._numericInput.renderChanges;
    }

    /**
     * Gets / sets the minimum value that the numeric input field can take.
     */
    set min(value) {
        this._numericInput.min = value;
    }

    get min() {
        return this._numericInput.min;
    }

    /**
     * Gets / sets the maximum value that the numeric input field can take.
     */
    set max(value) {
        this._numericInput.max = value;
    }

    get max() {
        return this._numericInput.max;
    }

    /**
     * Gets / sets the amount that the value will be increased or decreased when using the arrow keys. Holding Shift will use 10x the step.
     */
    set step(value) {
        this._numericInput.step = value;
    }

    get step() {
        return this._numericInput.step;
    }

    /**
     * Gets / sets the maximum number of decimals a value can take.
     */
    set precision(value) {
        this._numericInput.precision = value;
    }

    get precision() {
        return this._numericInput.precision;
    }

    set keyChange(value) {
        this._numericInput.keyChange = value;
    }

    get keyChange() {
        return this._numericInput.keyChange;
    }

    set placeholder(value) {
        this._numericInput.placeholder = value;
    }

    get placeholder() {
        return this._numericInput.placeholder;
    }
}

Element.register('slider', SliderInput, { renderChanges: true });

export default SliderInput;
