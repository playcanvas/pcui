import { Observer } from '@playcanvas/observer';
import Element, { ElementArgs, IBindable, IBindableArgs, IFocusable, IPlaceholder, IPlaceholderArgs } from '../Element';
import NumericInput from '../NumericInput';
import * as pcuiClass from '../../class';

const CLASS_VECTOR_INPUT = 'pcui-vector-input';

/**
 * The arguments for the {@link VectorInput} constructor.
 */
export interface VectorInputArgs extends ElementArgs, IPlaceholderArgs, IBindableArgs {
    /**
     * The number of dimensions in the vector. Can be between 2 to 4. Defaults to 3.
     */
    dimensions?: number;
    /**
     * The minimum value of each vector element.
     */
    min?: number;
    /**
     * The maximum value of each vector element.
     */
    max?: number;
    /**
     * The incremental step when using arrow keys or dragger for each vector element.
     */
    step?: number;
    /**
     * The decimal precision of each vector element.
     */
    precision?: number;
    /**
     *  The incremental step when holding Shift and using arrow keys or dragger for each vector element.
     */
    stepPrecision?: number;
}

/**
 * A vector input. The vector can have 2 to 4 dimensions with each dimension being a {@link NumericInput}.
 */
class VectorInput extends Element implements IBindable, IFocusable, IPlaceholder {
    static readonly defaultArgs: VectorInputArgs = {
        ...Element.defaultArgs,
        dimensions: 3
    };

    protected _inputs: NumericInput[] = [];

    protected _applyingChange = false;

    constructor(args: VectorInputArgs = VectorInput.defaultArgs) {
        args = { ...VectorInput.defaultArgs, ...args };

        // set binding after inputs have been created
        const binding = args.binding;
        delete args.binding;

        super(args.dom ? args.dom : document.createElement('div'), args);

        this.class.add(CLASS_VECTOR_INPUT);

        const dimensions = Math.max(2, Math.min(4, args.dimensions));

        for (let i = 0; i < dimensions; i++) {
            const input = new NumericInput({
                min: args.min,
                max: args.max,
                precision: args.precision,
                step: args.step,
                stepPrecision: args.stepPrecision,
                renderChanges: args.renderChanges,
                placeholder: args.placeholder ? (Array.isArray(args.placeholder) ? args.placeholder[i] : args.placeholder) : null
            });
            input.on('change', () => {
                this._onInputChange();
            });
            input.on('focus', () => {
                this.emit('focus');
            });
            input.on('blur', () => {
                this.emit('blur');
            });
            this.dom.appendChild(input.dom);
            input.parent = this;

            this._inputs.push(input);
        }

        // set the binding after the inputs have been created
        // because we rely on them in the overridden setter
        if (binding) {
            this.binding = binding;
        }

        if (args.value !== undefined) {
            this.value = args.value;
        }
    }

    protected _onInputChange() {
        if (this._applyingChange) return;

        // check if any of our inputs have the MULTIPLE_VALUES class and if so inherit it for us as well
        const multipleValues = this._inputs.some(input => input.class.contains(pcuiClass.MULTIPLE_VALUES));

        if (multipleValues) {
            this.class.add(pcuiClass.MULTIPLE_VALUES);
        } else {
            this.class.remove(pcuiClass.MULTIPLE_VALUES);
        }

        this.emit('change', this.value);
    }

    protected _updateValue(value: number[]) {
        this.class.remove(pcuiClass.MULTIPLE_VALUES);

        if (JSON.stringify(this.value) === JSON.stringify(value)) return false;

        this._applyingChange = true;

        this._inputs.forEach((input, i) => {
            // disable binding for each individual input when we use
            // the 'value' setter for the whole vector value. That is because
            // we do not want the individual inputs to emit their own binding events
            // since we are setting the whole vector value here
            const binding = input.binding;
            let applyingChange = false;
            if (binding) {
                applyingChange = binding.applyingChange;
                binding.applyingChange = true;
            }
            input.value = (value && value[i] !== undefined ? value[i] : null);
            if (binding) {
                binding.applyingChange = applyingChange;
            }
        });

        this.emit('change', this.value);

        this._applyingChange = false;

        return true;
    }

    link(observers: Observer|Observer[], paths: string|string[]) {
        super.link(observers, paths);
        observers = Array.isArray(observers) ? observers : [observers];
        paths = Array.isArray(paths) ? paths : [paths];

        const useSinglePath = paths.length === 1 || observers.length !== paths.length;
        if (useSinglePath) {
            for (let i = 0; i < this._inputs.length; i++) {
                // link observers to path.i for each dimension
                this._inputs[i].link(observers, paths[0] + `.${i}`);
            }
        } else {
            for (let i = 0; i < this._inputs.length; i++) {
                // link observers to paths[i].i for each dimension
                this._inputs[i].link(observers, paths.map(path => `${path}.${i}`));
            }

        }
    }

    unlink() {
        super.unlink();
        for (const input of this._inputs) {
            input.unlink();
        }
    }

    focus() {
        this._inputs[0].focus();
    }

    blur() {
        for (const input of this._inputs) {
            input.blur();
        }
    }

    set value(value) {
        if (typeof value === 'string') {
            try {
                // try to parse the string
                value = JSON.parse(value);
                // if the string could be converted to an array but some of its values aren't numbers
                // then use a default array also
                if (Array.isArray(value) && value.some(i => !Number.isFinite(i))) {
                    throw new Error('VectorInput value set to string which doesn\'t contain an array of numbers');
                }
            } catch (e) {
                console.error(e);
                value = [];
            }
        }
        if (!Array.isArray(value)) {
            value = [];
        }

        const changed = this._updateValue(value);

        if (changed && this._binding) {
            this._binding.setValue(value);
        }
    }

    get value() {
        return this._inputs.map(input => input.value);
    }

    /* eslint accessor-pairs: 0 */
    set values(values: Array<any>) {
        // create an array for each dimension (e.g. one array for x one for y one for z)
        values = this._inputs.map((_, i) => values.map((arr) => {
            return arr ? arr[i] : undefined;
        }));

        this._inputs.forEach((input, i) => {
            input.values = values[i];
        });
    }

    // override binding setter to set a binding clone to
    // each input
    set binding(value) {
        super.binding = value;
        for (const input of this._inputs) {
            input.binding = value ? value.clone() : null;
        }
    }

    // we have to override the getter too because
    // we have overridden the setter
    get binding() {
        return super.binding;
    }

    set placeholder(value: any) {
        for (let i = 0; i < this._inputs.length; i++) {
            this._inputs[i].placeholder = value[i] || value || null;
        }
    }

    get placeholder() {
        return this._inputs.map(input => input.placeholder);
    }

    /**
     * Get the array of number inputs owned by this vector.
     */
    get inputs() {
        return this._inputs.slice();
    }

    set renderChanges(value) {
        for (const input of this._inputs) {
            input.renderChanges = value;
        }
    }

    get renderChanges() {
        return this._inputs[0].renderChanges;
    }

    /**
     * Gets / sets the minimum value accepted by all inputs of the vector.
     */
    set min(value) {
        for (const input of this._inputs) {
            input.min = value;
        }
    }

    get min() {
        return this._inputs[0].min;
    }

    /**
     * Gets / sets the maximum value accepted by all inputs of the vector.
     */
    set max(value) {
        for (const input of this._inputs) {
            input.max = value;
        }
    }

    get max() {
        return this._inputs[0].max;
    }

    /**
     * Gets / sets the maximum number of decimal places supported by all inputs of the vector.
     */
    set precision(value) {
        for (const input of this._inputs) {
            input.precision = value;
        }
    }

    get precision() {
        return this._inputs[0].precision;
    }

    /**
     * Gets / sets the amount that the value will be increased or decreased when using the arrow
     * keys and the slider input for all inputs of the vector.
     */
    set step(value) {
        for (const input of this._inputs) {
            input.step = value;
        }
    }

    get step() {
        return this._inputs[0].step;
    }
}

Element.register('vec2', VectorInput, { dimensions: 2, renderChanges: true });
Element.register('vec3', VectorInput, { dimensions: 3, renderChanges: true });
Element.register('vec4', VectorInput, { dimensions: 4, renderChanges: true });

export default VectorInput;
