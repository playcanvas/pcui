import './style.scss';
import Element from '../Element';
import TextInput from '../TextInput';
import * as pcuiClass from '../../class';

const CLASS_NUMERIC_INPUT = 'pcui-numeric-input';
const CLASS_NUMERIC_INPUT_SLIDER_CONTROL = CLASS_NUMERIC_INPUT + '-slider-control';
const CLASS_NUMERIC_INPUT_SLIDER_CONTROL_ACTIVE = CLASS_NUMERIC_INPUT_SLIDER_CONTROL + '-active';
const CLASS_NUMERIC_INPUT_SLIDER_CONTROL_HIDDEN = CLASS_NUMERIC_INPUT_SLIDER_CONTROL + '-hidden';

/**
 * @name NumericInput
 * @classdesc The NumericInput represents an input element that holds numbers.
 * @property {number} [min=0] Gets / sets the minimum value this field can take.
 * @property {number} [max=1] Gets / sets the maximum value this field can take.
 * @property {number} [precision=2] Gets / sets the maximum number of decimals a value can take.
 * @property {number} [step=0.01] Gets / sets the amount that the value will be increased or decreased when using the arrow keys. Holding Shift will use 10x the step.
 * @property {boolean} [hideSlider=true] Hide the input mouse drag slider.
 * @augments TextInput
 */
class NumericInput extends TextInput {
    /**
     * Creates a new NumericInput.
     *
     * @param {object} args - The arguments. Extends the pcui.TextInput constructor arguments.
     * @param {boolean} [args.allowNull] - Gets / sets whether the value can be null. If not then it will be 0 instead of null.
     */
    constructor(args) {
        // make copy of args
        args = Object.assign({}, args);
        const value = args.value;
        // delete value because we want to set it after
        // the other arguments
        delete args.value;
        const renderChanges = args.renderChanges || false;
        delete args.renderChanges;

        super(args);

        this.class.add(CLASS_NUMERIC_INPUT);

        this._min = args.min !== undefined ? args.min : null;
        this._max = args.max !== undefined ? args.max : null;
        this._allowNull = args.allowNull || false;
        this._precision = args.precision !== undefined ? args.precision : 2;

        if (args.step !== undefined) {
            this._step = args.step;
        } else {
            if (this._precision !== null) {
                this._step = 1 / Math.pow(10, this._precision);
            } else {
                this._step  = 1;
            }
        }

        this._oldValue = undefined;
        this.value = value;
        this._sliderPrevValue = value;

        this.renderChanges = renderChanges;

        if (!args.hideSlider) {
            this._sliderControl = new Element();
            this._sliderControl.class.add(CLASS_NUMERIC_INPUT_SLIDER_CONTROL);
            this._dom.append(this._sliderControl._dom);

            this._sliderControl._dom.addEventListener('mousedown', () => {
                this._sliderControl._dom.requestPointerLock();
                this._sliderPrevValue = this.value;
            });

            this._sliderControl._dom.addEventListener('mouseup', () => {
                document.exitPointerLock();
                if (this._binding) {
                    const undoValue = this._sliderPrevValue;
                    const redoValue = this.value;
                    const undo = () => {
                        var history = this._binding._bindingElementToObservers._history;
                        this._binding._bindingElementToObservers._history = null;
                        this.value = undoValue;
                        this._binding._bindingElementToObservers._history = history;
                    };
                    const redo = () => {
                        var history = this._binding._bindingElementToObservers._history;
                        this._binding._bindingElementToObservers._history = null;
                        this.value = redoValue;
                        this._binding._bindingElementToObservers._history = history;
                    };

                    this._binding._bindingElementToObservers._history.add({
                        name: this._binding.paths[0],
                        undo,
                        redo
                    });
                    redo();
                }
            });
        }
        this._updatePosition = this._updatePosition.bind(this);

        document.addEventListener('pointerlockchange', this._pointerLockChangeAlert.bind(this), false);
        document.addEventListener('mozpointerlockchange', this._pointerLockChangeAlert.bind(this), false);
    }

    _updatePosition(evt) {
        let movement = 0;
        if (evt.constructor === WheelEvent) {
            movement = evt.deltaY;
        } else if (evt.constructor === MouseEvent) {
            movement = evt.movementX;
        }
        // move one step every 100 pixels
        movement = movement / 100 * this._step;
        this.value += movement;
    }

    _onInputChange(evt) {
        // get the content of the input and pass it
        // through our value setter
        this.value = this._domInput.value;
    }

    _onInputKeyDown(evt) {
        if (!this.enabled || this.readOnly) return super._onInputKeyDown(evt);

        // increase / decrease value with arrow keys
        if (evt.keyCode === 38 || evt.keyCode === 40) {
            const inc = (evt.shiftKey ? 10 : 1) * (evt.keyCode === 40 ? -1 : 1);
            this.value += this.step * inc;
            return;
        }

        super._onInputKeyDown(evt);
    }

    _isScrolling() {
        if (!this._sliderControl) return false;
        return (document.pointerLockElement === this._sliderControl._dom ||
            document.mozPointerLockElement === this._sliderControl._dom);
    }

    _pointerLockChangeAlert() {
        if (this._isScrolling()) {
            this._sliderControl._dom.addEventListener("mousemove", this._updatePosition, false);
            this._sliderControl._dom.addEventListener("wheel", this._updatePosition, false);
            this._sliderControl.class.add(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_ACTIVE);
        } else {
            this._sliderControl._dom.removeEventListener("mousemove", this._updatePosition, false);
            this._sliderControl._dom.removeEventListener("wheel", this._updatePosition, false);
            this._sliderControl.class.remove(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_ACTIVE);
        }
    }

    _normalizeValue(value) {
        try {
            if (typeof value === 'string') {
                // sanitize input to only allow short mathmatical expressions to be evaluated
                value = value.match(/^[*/+\-0-9().]+$/);
                if (value !== null && value[0].length < 20) {
                    value = Function('"use strict";return (' + value[0] + ')')();
                }
            }
        } catch (error) {
            value = null;
        }

        if (value === null || isNaN(value)) {
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
            value = parseFloat(Number(value).toFixed(this.precision), 10);
        }

        return value;
    }

    _updateValue(value, force) {
        const different = (value !== this._oldValue || force);

        // always set the value to the input because
        // we always want it to show an actual number or nothing
        this._oldValue = value;
        this._domInput.value = value;

        this.class.remove(pcuiClass.MULTIPLE_VALUES);

        if (different) {
            this.emit('change', value);
        }

        return different;
    }

    get value() {
        const val = super.value;
        return val !== '' ? parseFloat(val, 10) : null;
    }

    set value(value) {
        value = this._normalizeValue(value);

        const forceUpdate = this.class.contains(pcuiClass.MULTIPLE_VALUES) && value === null && this._allowNull;
        const changed = this._updateValue(value, forceUpdate);

        if (changed && this._binding) {
            var history = this._binding._bindingElementToObservers._history;
            if (this._isScrolling()) {
                this._binding._bindingElementToObservers._history = null;
            }
            this._binding.setValue(value);
            this._binding._bindingElementToObservers._history = history;
        }
        if (this._sliderControl) {
            this._sliderControl.class.remove(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_HIDDEN);
        }
    }

    set values(values) {
        let different = false;
        const value = this._normalizeValue(values[0]);
        for (let i = 1; i < values.length; i++) {
            if (value !== this._normalizeValue(values[i])) {
                different = true;
                break;
            }
        }

        if (different) {
            this._updateValue(null);
            this.class.add(pcuiClass.MULTIPLE_VALUES);
            if (this._sliderControl) {
                this._sliderControl.class.add(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_HIDDEN);
            }
        } else {
            this._updateValue(values[0]);
            if (this._sliderControl) {
                this._sliderControl.class.remove(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_HIDDEN);
            }
        }
    }

    get min() {
        return this._min;
    }

    set min(value) {
        if (this._min === value) return;
        this._min = value;

        // reset value
        if (this._min !== null) {
            this.value = this.value; // eslint-disable-line no-self-assign
        }
    }

    get max() {
        return this._max;
    }

    set max(value) {
        if (this._max === value) return;
        this._max = value;

        // reset value
        if (this._max !== null) {
            this.value = this.value; // eslint-disable-line no-self-assign
        }
    }

    get precision() {
        return this._precision;
    }

    set precision(value) {
        if (this._precision === value) return;
        this._precision = value;

        // reset value
        if (this._precision !== null) {
            this.value = this.value; // eslint-disable-line no-self-assign
        }
    }

    get step() {
        return this._step;
    }

    set step(value) {
        this._step = value;
    }

    destroy() {
        super.destroy();
        document.removeEventListener('pointerlockchange', this._pointerLockChangeAlert, false);
        document.removeEventListener('mozpointerlockchange', this._pointerLockChangeAlert, false);

    }
}

export default NumericInput;
