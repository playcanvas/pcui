import { CLASS_MULTIPLE_VALUES } from '../../class';
import { Element } from '../Element';
import { InputElement, InputElementArgs } from '../InputElement';

const CLASS_NUMERIC_INPUT = 'pcui-numeric-input';
const CLASS_NUMERIC_INPUT_SLIDER_CONTROL = `${CLASS_NUMERIC_INPUT}-slider-control`;
const CLASS_NUMERIC_INPUT_SLIDER_CONTROL_ACTIVE = `${CLASS_NUMERIC_INPUT_SLIDER_CONTROL}-active`;
const CLASS_NUMERIC_INPUT_SLIDER_CONTROL_HIDDEN = `${CLASS_NUMERIC_INPUT_SLIDER_CONTROL}-hidden`;

const REGEX_COMMA = /,/g;

/**
 * The arguments for the {@link NumericInput} constructor.
 */
interface NumericInputArgs extends InputElementArgs {
    /**
     * Sets the minimum value this field can take.
     */
    min?: number,
    /**
     * Sets the maximum value this field can take.
     */
    max?: number,
    /**
     * Sets the decimal precision of this field. Defaults to 2.
     */
    precision?: number,
    /**
     * Sets the amount that the value will be increased or decreased when using the arrow keys and the slider input.
     */
    step?: number,
    /**
     * Sets the amount that the value will be increased or decreased when holding shift using the arrow keys and the slider input. Defaults to {@link NumericInput#step} * 0.1.
     */
    stepPrecision?: number,
    /**
     * Hide the input mouse drag slider.
     */
    hideSlider?: boolean,
    /**
     * Sets whether the value can be `null`. If not then it will be 0 instead of `null`.
     */
    allowNull?: boolean
}

/**
 * The NumericInput represents an input element that holds numbers.
 */
class NumericInput extends InputElement {
    protected _min: number;

    protected _max: number;

    protected _allowNull: boolean;

    protected _precision: number;

    protected _step: number;

    protected _stepPrecision: number;

    protected _oldValue: number;

    protected _historyCombine: boolean;

    protected _historyPostfix: string;

    protected _sliderPrevValue: number;

    protected _sliderControl: Element;

    protected _sliderMovement: number;

    protected _sliderUsed = false;

    /**
     * Creates a new NumericInput.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<NumericInputArgs> = {}) {
        const textInputArgs = { ...args };
        // delete value because we want to set it after the other arguments
        delete textInputArgs.value;
        delete textInputArgs.renderChanges;

        super(textInputArgs);

        this.class.add(CLASS_NUMERIC_INPUT);

        this._min = args.min ?? null;
        this._max = args.max ?? null;
        this._allowNull = args.allowNull ?? false;
        this._precision = args.precision ?? 7;

        if (Number.isFinite(args.step)) {
            this._step = args.step;
        } else if (args.precision) {
            this._step = 10 / Math.pow(10, args.precision);
        } else {
            this._step = 1;
        }

        if (Number.isFinite(args.stepPrecision)) {
            this._stepPrecision = args.stepPrecision;
        } else {
            this._stepPrecision = this._step * 0.1;
        }

        this._oldValue = undefined;
        if (Number.isFinite(args.value)) {
            this.value = args.value;
        } else if (!this._allowNull) {
            this.value = 0;
        }

        this._historyCombine = false;
        this._historyPostfix = null;
        this._sliderPrevValue = 0;

        this.renderChanges = args.renderChanges;

        if (!args.hideSlider) {
            this._sliderControl = new Element();
            this._sliderControl.class.add(CLASS_NUMERIC_INPUT_SLIDER_CONTROL);
            this.dom.append(this._sliderControl.dom);

            this._sliderControl.dom.addEventListener('mousedown', this._onSliderMouseDown);
            this._sliderControl.dom.addEventListener('mouseup', this._onSliderMouseUp);

            document.addEventListener('pointerlockchange', this._onPointerLockChange, false);
        }
    }

    destroy() {
        if (this.destroyed) return;

        if (this._sliderControl) {
            this._sliderControl.dom.removeEventListener('mousedown', this._onSliderMouseDown);
            this._sliderControl.dom.removeEventListener('mouseup', this._onSliderMouseUp);

            this._sliderControl.dom.removeEventListener('mousemove', this._onSliderMouseMove, false);
            this._sliderControl.dom.removeEventListener('wheel', this._onSliderMouseWheel);

            document.removeEventListener('pointerlockchange', this._onPointerLockChange, false);
        }

        super.destroy();
    }

    protected _updatePosition(movement: number, shiftKey: boolean) {
        // move one step or stepPrecision every 100 pixels
        this._sliderMovement += movement / 100 * (shiftKey ? this._stepPrecision : this._step);
        this.value = this._sliderPrevValue + this._sliderMovement;
    }

    protected _onSliderMouseWheel = (evt: WheelEvent) => {
        this._updatePosition(evt.deltaY, evt.shiftKey);
    };

    protected _onSliderMouseMove = (evt: MouseEvent) => {
        this._updatePosition(evt.movementX, evt.shiftKey);
    };

    protected _onSliderMouseDown = (evt: MouseEvent) => {
        this._sliderControl.dom.requestPointerLock();
        this._sliderMovement = 0.0;
        this._sliderPrevValue = this.value;
        this._sliderUsed = true;
        if (this.binding) {
            this._historyCombine = this.binding.historyCombine;
            this._historyPostfix = this.binding.historyPostfix;

            this.binding.historyCombine = true;
            this.binding.historyPostfix = `(${Date.now()})`;
        }

        this.emit('slider:mousedown', evt);
    };

    protected _onSliderMouseUp = () => {
        document.exitPointerLock();
        if (!this._sliderUsed) return;
        this._sliderUsed = false;
        this.value = this._sliderPrevValue + this._sliderMovement;

        if (this.binding) {
            this.binding.historyCombine = this._historyCombine;
            this.binding.historyPostfix = this._historyPostfix;

            this._historyCombine = false;
            this._historyPostfix = null;
        }
        this.focus();

        this.emit('slider:mouseup');
    };

    protected _onInputChange(evt: Event) {
        // get the content of the input, normalize it and set it as the current value
        this.value = this._normalizeValue(this._domInput.value);
    }

    protected _onInputKeyDown(evt: KeyboardEvent) {
        if (!this.enabled || this.readOnly) return;

        // increase / decrease value with arrow keys
        if (evt.key === 'ArrowUp' || evt.key === 'ArrowDown') {
            const inc = evt.key === 'ArrowDown' ? -1 : 1;
            this.value += (evt.shiftKey ? this._stepPrecision : this._step) * inc;
        }

        super._onInputKeyDown(evt);
    }

    protected _getPointerLockElementByShadowRoot(pointerLockElement: any): boolean {
        const shadowRoot = pointerLockElement.shadowRoot;
        if (shadowRoot) {
            const pointerLockElement = shadowRoot.pointerLockElement;
            return this._getPointerLockElementByShadowRoot(pointerLockElement);
        }
        return pointerLockElement === this._sliderControl.dom;
    }

    protected _isScrolling() {
        if (!this._sliderControl) return false;
        if (document.pointerLockElement && document.pointerLockElement.shadowRoot) {
            return this._getPointerLockElementByShadowRoot(document.pointerLockElement);
        }
        return document.pointerLockElement === this._sliderControl.dom;
    }

    protected _onPointerLockChange = () => {
        if (this._isScrolling()) {
            this._sliderControl.dom.addEventListener('mousemove', this._onSliderMouseMove, false);
            this._sliderControl.dom.addEventListener('wheel', this._onSliderMouseWheel, { passive: true });
            this._sliderControl.class.add(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_ACTIVE);
        } else {
            this._sliderControl.dom.removeEventListener('mousemove', this._onSliderMouseMove, false);
            this._sliderControl.dom.removeEventListener('wheel', this._onSliderMouseWheel);
            this._sliderControl.class.remove(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_ACTIVE);
        }
    };

    protected _normalizeValue(value: any) {
        try {
            if (typeof value === 'string') {
                // check for 0
                if (value === '0') return 0;

                // replace commas with dots (for some international keyboards)
                value = value.replace(REGEX_COMMA, '.');

                // remove spaces
                value = value.replace(/\s/g, '');

                const currentValue = this._oldValue || 0;

                // Handle percentages with a simple, non-backtracking regex
                value = value.replace(/(\d+(?:\.\d+)?%)/g, (match: string) => {
                    const percent = parseFloat(match.slice(0, -1));
                    const calculatedValue = (percent / 100) * currentValue;
                    return calculatedValue.toString();
                });

                // sanitize input to only allow short mathematical expressions
                value = value.match(/^[*/+\-0-9().]+$/);
                if (value !== null && value[0].length < 20) {
                    let expression = value[0];
                    const operators = ['+', '-', '/', '*'];
                    operators.forEach((operator) => {
                        const expressionArr = expression.split(operator);
                        expressionArr.forEach((_: any, i: number) => {
                            expressionArr[i] = expressionArr[i].replace(/^0+/, '');
                        });
                        expression = expressionArr.join(operator);
                    });
                    // eslint-disable-next-line
                    value = Function(`"use strict";return (${expression})`)();
                }
            }

            if (value === null || value === undefined || value === '') {
                if (this._allowNull) {
                    return null;
                }
                value = 0;
            }

            value = Number(value);

            if (isNaN(value)) {
                if (this._allowNull) {
                    return null;
                }
                value = 0;
            }

            // clamp between min max
            if (this.min !== null && value < this.min) {
                value = this.min;
            }
            if (this.max !== null && value > this.max) {
                value = this.max;
            }

            // fix precision
            if (this.precision !== null) {
                value = parseFloat(Number(value).toFixed(this.precision));
            }

            return value;
        } catch (error) {
            if (this._allowNull) {
                return null;
            }
            return 0;
        }
    }

    protected _updateValue(value: number, force?: boolean) {
        const different = (value !== this._oldValue || force);

        // always set the value to the input because
        // we always want it to show an actual number or nothing
        this._oldValue = value;
        if (value === null) {
            this._domInput.value = '';
        } else {
            this._domInput.value = String(value);
        }

        this.class.remove(CLASS_MULTIPLE_VALUES);

        if (different) {
            this.emit('change', value);
        }

        return different;
    }

    set value(value: number) {
        value = this._normalizeValue(value);
        const forceUpdate = this.class.contains(CLASS_MULTIPLE_VALUES) && value === null && this._allowNull;
        const changed = this._updateValue(value, forceUpdate);

        if (changed && this.binding) {
            this.binding.setValue(value);
        }
        if (this._sliderControl) {
            this._sliderControl.class.remove(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_HIDDEN);
        }
    }

    get value() : number {
        const val = this._domInput.value;
        return val !== '' ? parseFloat(val) : null;
    }

    /* eslint accessor-pairs: 0 */
    set values(values: number[]) {
        const normalizedValues = values.map(v => this._normalizeValue(v));
        const different = normalizedValues.some(v => v !== normalizedValues[0]);

        if (different) {
            this._updateValue(null);
            this.class.add(CLASS_MULTIPLE_VALUES);
            if (this._sliderControl) {
                this._sliderControl.class.add(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_HIDDEN);
            }
        } else {
            this._updateValue(normalizedValues[0]);
            if (this._sliderControl) {
                this._sliderControl.class.remove(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_HIDDEN);
            }
        }
    }

    /**
     * Sets the minimum value this field can take.
     */
    set min(value) {
        if (this._min === value) return;
        this._min = value;

        // reset value
        if (this._min !== null) {
            this.value = this.value; // eslint-disable-line no-self-assign
        }
    }

    /**
     * Gets the minimum value this field can take.
     */
    get min() {
        return this._min;
    }

    /**
     * Sets the maximum value this field can take.
     */
    set max(value) {
        if (this._max === value) return;
        this._max = value;

        // reset value
        if (this._max !== null) {
            this.value = this.value; // eslint-disable-line no-self-assign
        }
    }

    /**
     * Gets the maximum value this field can take.
     */
    get max() {
        return this._max;
    }

    /**
     * Sets the precision of the input.
     */
    set precision(value) {
        if (this._precision === value) return;
        this._precision = value;

        // reset value
        if (this._precision !== null) {
            this.value = this.value; // eslint-disable-line no-self-assign
        }
    }

    /**
     * Gets the precision of the input.
     */
    get precision() {
        return this._precision;
    }

    /**
     * Sets the amount that the value will be increased or decreased when using the arrow keys and the slider input.
     */
    set step(value) {
        this._step = value;
    }

    /**
     * Gets the amount that the value will be increased or decreased when using the arrow keys and the slider input.
     */
    get step() {
        return this._step;
    }
}

Element.register('number', NumericInput, { renderChanges: true });

export { NumericInput, NumericInputArgs };
