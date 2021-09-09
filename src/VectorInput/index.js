import Element, { ElementArgs } from '../Element';
import NumericInput from '../NumericInput';
import * as pcuiClass from '../class';

import './style.scss';

const CLASS_VECTOR_INPUT = 'pcui-vector-input';

/**
 * @name VectorInputArgs
 * @class
 * @classdesc The class for all VectorInput arguments extending ElementArgs.
 * @augments ElementArgs
 * @property {number} [dimensions=3] - The number of dimensions in the vector. Can be between 2 to 4. Defaults to 3.
 * @property {number} [min] - The minimum value for each vector element.
 * @property {number} [max] - The maximum value for each vector element.
 * @property {number} [precision] - The decimal precision for each vector element.
 * @property {number} [step] - The incremental step when using arrow keys for each vector element.
 * @property {boolean} [renderChanges] - If true each vector element will flash on changes.
 * @property {string[]|string} [placeholder] - The placeholder string for each vector element.
 */
export class VectorInputArgs extends ElementArgs {
}

/**
 * @name VectorInput
 * @class
 * @classdesc A vector input
 * @augments Element
 * @mixes IBindable
 * @mixes IFocusable
 * @param {VectorInputArgs} [args] - The arguments.
 */
class VectorInput extends Element {
    /**
     * Creates a new pcui.VectorInput.
     *
     * @param {VectorInputArgs} [args] - The arguments.
     */
    constructor(args) {
        args = Object.assign({}, args);

        // set binding after inputs have been created
        const binding = args.binding;
        delete args.binding;

        super(args.dom ? args.dom : document.createElement('div'), args);

        this.class.add(CLASS_VECTOR_INPUT);

        const dimensions = Math.max(2, Math.min(4, args.dimensions || 3));

        const onInputChange = this._onInputChange.bind(this);
        this._inputs = new Array(dimensions);
        for (let i = 0; i < this._inputs.length; i++) {
            this._inputs[i] = new NumericInput({
                min: args.min,
                max: args.max,
                precision: args.precision,
                step: args.step,
                renderChanges: args.renderChanges,
                placeholder: args.placeholder ? (Array.isArray(args.placeholder) ? args.placeholder[i] : args.placeholder) : null
            });
            this._inputs[i].on('change', onInputChange);
            this._inputs[i].on('focus', () => {
                this.emit('focus');
            });
            this._inputs[i].on('blur', () => {
                this.emit('blur');
            });
            this.dom.appendChild(this._inputs[i].dom);
            this._inputs[i].parent = this;
        }

        // set the binding after the inputs have been created
        // because we rely on them in the overriden setter
        if (binding) {
            this.binding = binding;
        }

        this._applyingChange = false;

        if (args.value !== undefined) {
            this.value = args.value;
        }

    }

    _onInputChange() {
        if (this._applyingChange) return;

        // check if any of our inputs have the multiple_values class
        // and if so inherit it for us as well
        let showingMultipleValues = false;
        for (let i = 0; i < this._inputs.length; i++) {
            if (this._inputs[i].class.contains(pcuiClass.MULTIPLE_VALUES)) {
                showingMultipleValues = true;
                break;
            }
        }

        if (showingMultipleValues) {
            this.class.add(pcuiClass.MULTIPLE_VALUES);
        } else {
            this.class.remove(pcuiClass.MULTIPLE_VALUES);
        }

        this.emit('change', this.value);
    }

    _updateValue(value) {
        this.class.remove(pcuiClass.MULTIPLE_VALUES);

        if (JSON.stringify(this.value) === JSON.stringify(value)) return false;

        this._applyingChange = true;

        for (let i = 0; i < this._inputs.length; i++) {
            // disable binding for each individual input when we use
            // the 'value' setter for the whole vector value. That is because
            // we do not want the individual inputs to emit their own binding events
            // since we are setting the whole vector value here
            const binding = this._inputs[i].binding;
            let applyingChange = false;
            if (binding) {
                applyingChange = binding.applyingChange;
                binding.applyingChange = true;
            }
            this._inputs[i].value = (value && value[i] !== undefined ? value[i] : null);
            if (binding) {
                binding.applyingChange = applyingChange;
            }
        }

        this.emit('change', this.value);

        this._applyingChange = false;

        return true;
    }

    link(observers, paths) {
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
                this._inputs[i].link(observers, paths.map((path) => `${path}.${i}`));
            }

        }
    }

    unlink() {
        super.unlink();
        for (let i = 0; i < this._inputs.length; i++) {
            this._inputs[i].unlink();
        }
    }

    focus() {
        this._inputs[0].focus();
    }

    blur() {
        for (let i = 0; i < this._inputs.length; i++) {
            this._inputs[i].blur();
        }
    }

    get value() {
        const value = new Array(this._inputs.length);
        for (let i = 0; i < this._inputs.length; i++) {
            value[i] = this._inputs[i].value;
        }

        return value;
    }

    set value(value) {
        if (typeof value === 'string') {
            try {
                // try to parse the string
                value = JSON.parse(value);
                // if the string could be converted to an array but some of it's values aren't numbers
                // then use a default array also
                if (Array.isArray(value) && value.some((i) => !Number.isFinite(i))) {
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

    /* eslint accessor-pairs: 0 */
    set values(values) {
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
        for (let i = 0; i < this._inputs.length; i++) {
            this._inputs[i].binding = (value ? value.clone() : null);
        }
    }

    // we have to override the getter too because
    // we have overriden the setter
    get binding() {
        return super.binding;
    }

    get placeholder() {
        return this._inputs.map((input) => input.placeholder);
    }

    set placeholder(value) {
        for (let i = 0; i < this._inputs.length; i++) {
            this._inputs[i].placeholder = value[i] || value || null;
        }
    }

    get inputs() {
        return this._inputs.slice();
    }
}

// add proxied properties
[
    'min',
    'max',
    'precision',
    'step',
    'renderChanges'
].forEach((property) => {
    Object.defineProperty(VectorInput.prototype, property, {
        get: function () {
            return this._inputs[0][property];
        },
        set: function (value) {
            for (let i = 0; i < this._inputs.length; i++) {
                this._inputs[i][property] = value;
            }
        }
    });
});

Element.register('vec2', VectorInput, { dimensions: 2, renderChanges: true });
Element.register('vec3', VectorInput, { dimensions: 3, renderChanges: true });
Element.register('vec4', VectorInput, { dimensions: 4, renderChanges: true });

export default VectorInput;
