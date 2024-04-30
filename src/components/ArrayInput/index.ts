import { Observer } from '@playcanvas/observer';
import * as utils from '../../helpers/utils';
import Element, { ElementArgs, IBindable, IBindableArgs, IFocusable } from '../Element';
import Container from '../Container';
import Panel from '../Panel';
import NumericInput from '../NumericInput';
import Button from '../Button';

const CLASS_ARRAY_INPUT = 'pcui-array-input';
const CLASS_ARRAY_EMPTY = 'pcui-array-empty';
const CLASS_ARRAY_SIZE = CLASS_ARRAY_INPUT + '-size';
const CLASS_ARRAY_CONTAINER = CLASS_ARRAY_INPUT + '-items';
const CLASS_ARRAY_ELEMENT = CLASS_ARRAY_INPUT + '-item';
const CLASS_ARRAY_DELETE = CLASS_ARRAY_ELEMENT + '-delete';

/**
 * The arguments for the {@link ArrayInput} constructor.
 */
export interface ArrayInputArgs extends ElementArgs, IBindableArgs {
    /**
     * The type of values that the array can hold. Can be one of the following:
     *
     * - `boolean`
     * - `number`
     * - `string`
     * - `vec2`
     * - `vec3`
     * - `vec4`
     *
     * Defaults to `string`.
     */
    type?: 'boolean' | 'number' | 'string' | 'vec2' | 'vec3' | 'vec4';
    /**
     * Arguments for each array Element.
     */
    elementArgs?: Array<any>;
    /**
     * If `true` then editing the number of elements that the array has will not be allowed.
     */
    fixedSize?: boolean;
    /**
     * If `true` then the array will be rendered using panels. Defaults to `false`.
     */
    usePanels?: boolean;
    /**
     * Used to specify the default values for each element in the array. Defaults to `null`.
     */
    getDefaultFn?: () => any;
}

/**
 * Element that allows editing an array of values.
 */
class ArrayInput extends Element implements IFocusable, IBindable {
    /**
     * Fired when an array element is linked to observers.
     *
     * @event
     * @example
     * ```ts
     * arrayInput.on('linkElement', (element: Element, index: number, path: string) => {
     *     console.log(`Element ${index} is now linked to ${path}`);
     * });
     * ```
     */
    public static readonly EVENT_LINK_ELEMENT: 'linkElement';

    /**
     * Fired when an array element is unlinked from observers.
     *
     * @event
     * @example
     * ```ts
     * arrayInput.on('unlinkElement', (element: Element, index: number) => {
     *     console.log(`Element ${index} is now unlinked`);
     * });
     * ```
     */
    public static readonly EVENT_UNLINK_ELEMENT: 'unlinkElement';

    static DEFAULTS = {
        boolean: false,
        number: 0,
        string: '',
        vec2: [0, 0],
        vec3: [0, 0, 0],
        vec4: [0, 0, 0, 0]
    };

    protected _container: Container;

    protected _usePanels: boolean;

    protected _fixedSize: boolean;

    protected _inputSize: NumericInput;

    protected _suspendSizeChangeEvt = false;

    protected _containerArray: Container;

    protected _arrayElements: any;

    protected _suspendArrayElementEvts = false;

    protected _arrayElementChangeTimeout: number = null;

    protected _getDefaultFn: any;

    protected _valueType: string;

    protected _elementType: string;

    protected _elementArgs: any;

    protected _values: any[];

    protected _renderChanges: boolean;

    /**
     * Creates a new ArrayInput.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<ArrayInputArgs> = {}) {
        const container = new Container({
            dom: args.dom,
            flex: true
        });

        const elementArgs = { ...args, dom: container.dom };
        // remove binding because we want to set it later
        delete elementArgs.binding;

        super(elementArgs);

        this._container = container;
        this._container.parent = this;

        this.class.add(CLASS_ARRAY_INPUT, CLASS_ARRAY_EMPTY);

        this._usePanels = args.usePanels ?? false;

        this._fixedSize = !!args.fixedSize;

        this._inputSize = new NumericInput({
            class: [CLASS_ARRAY_SIZE],
            placeholder: 'Array Size',
            value: 0,
            hideSlider: true,
            step: 1,
            precision: 0,
            min: 0,
            readOnly: this._fixedSize
        });
        this._inputSize.on('change', (value: number) => {
            this._onSizeChange(value);
        });
        this._inputSize.on('focus', () => {
            this.emit('focus');
        });
        this._inputSize.on('blur', () => {
            this.emit('blur');
        });
        this._container.append(this._inputSize);

        this._containerArray = new Container({
            class: CLASS_ARRAY_CONTAINER,
            hidden: true
        });
        this._containerArray.on('append', () => {
            this._containerArray.hidden = false;
        });
        this._containerArray.on('remove', () => {
            this._containerArray.hidden = this._arrayElements.length === 0;
        });
        this._container.append(this._containerArray);

        this._getDefaultFn = args.getDefaultFn ?? null;

        // @ts-ignore
        let valueType = args.elementArgs && args.elementArgs.type || args.type;
        if (!ArrayInput.DEFAULTS.hasOwnProperty(valueType)) {
            valueType = 'string';
        }

        this._valueType = valueType;
        this._elementType = args.type ?? 'string';
        if (args.elementArgs) {
            this._elementArgs = args.elementArgs;
        } else {
            delete elementArgs.dom;
            this._elementArgs = elementArgs;
        }

        this._arrayElements = [];

        // set binding now
        this.binding = args.binding;

        this._values = [];

        if (args.value) {
            this.value = args.value;
        }

        this.renderChanges = args.renderChanges || false;
    }

    destroy() {
        if (this._destroyed) return;

        this._arrayElements.length = 0;

        super.destroy();
    }

    protected _onSizeChange(size: number) {
        // if size is explicitly 0 then add empty class
        // size can also be null with multi-select so do not
        // check just !size
        if (size === 0) {
            this.class.add(CLASS_ARRAY_EMPTY);
        } else {
            this.class.remove(CLASS_ARRAY_EMPTY);
        }

        if (size === null) return;
        if (this._suspendSizeChangeEvt) return;

        // initialize default value for each new array element
        let defaultValue: any;
        const initDefaultValue = () => {
            if (this._getDefaultFn) {
                defaultValue = this._getDefaultFn();
            } else {
                defaultValue = ArrayInput.DEFAULTS[this._valueType as keyof typeof ArrayInput.DEFAULTS];
                if (this._valueType === 'curveset') {
                    defaultValue = utils.deepCopy(defaultValue);
                    if (Array.isArray(this._elementArgs.curves)) {
                        for (let i = 0; i < this._elementArgs.curves.length; i++) {
                            defaultValue.keys.push([0, 0]);
                        }
                    }
                } else if (this._valueType === 'gradient') {
                    defaultValue = utils.deepCopy(defaultValue);
                    if (this._elementArgs.channels) {
                        for (let i = 0; i < this._elementArgs.channels; i++) {
                            defaultValue.keys.push([0, 1]);
                        }
                    }
                }
            }
        };

        // resize array
        const values = this._values.map((array) => {
            if (!array) {
                array = new Array(size);
                for (let i = 0; i < size; i++) {
                    if (defaultValue === undefined) initDefaultValue();
                    array[i] = utils.deepCopy(defaultValue);
                }
            } else if (array.length < size) {
                const newArray = new Array(size - array.length);
                for (let i = 0; i < newArray.length; i++) {
                    if (defaultValue === undefined) initDefaultValue();
                    newArray[i] = utils.deepCopy(defaultValue);
                }
                array = array.concat(newArray);
            } else {
                const newArray = new Array(size);
                for (let i = 0; i < size; i++) {
                    newArray[i] = utils.deepCopy(array[i]);
                }
                array = newArray;
            }

            return array;
        });

        if (!values.length) {
            const array = new Array(size);
            for (let i = 0; i < size; i++) {
                if (defaultValue === undefined) initDefaultValue();
                array[i] = utils.deepCopy(defaultValue);
            }
            values.push(array);
        }

        this._updateValues(values, true);
    }

    protected _createArrayElement() {
        const args = Object.assign({}, this._elementArgs);
        if (args.binding) {
            args.binding = args.binding.clone();
        } else if (this._binding) {
            args.binding = this._binding.clone();
        }

        // set renderChanges after value is set
        // to prevent flashing on initial value set
        args.renderChanges = false;

        let container;
        if (this._usePanels) {
            container = new Panel({
                headerText: `[${this._arrayElements.length}]`,
                removable: !this._fixedSize,
                collapsible: true,
                class: [CLASS_ARRAY_ELEMENT, CLASS_ARRAY_ELEMENT + '-' + this._elementType]
            });
        } else {
            container = new Container({
                flex: true,
                flexDirection: 'row',
                alignItems: 'center',
                class: [CLASS_ARRAY_ELEMENT, CLASS_ARRAY_ELEMENT + '-' + this._elementType]
            });
        }

        if (this._elementType === 'json' && args.attributes) {
            args.attributes = args.attributes.map((attr: any) => {
                if (!attr.path) return attr;

                // fix paths to include array element index
                attr = Object.assign({}, attr);
                const parts = attr.path.split('.');
                parts.splice(parts.length - 1, 0, this._arrayElements.length);
                attr.path = parts.join('.');

                return attr;
            });
        }

        const element = Element.create(this._elementType, args);
        container.append(element);

        element.renderChanges = this.renderChanges;

        const entry = {
            container: container,
            element: element
        };

        this._arrayElements.push(entry);

        if (!this._usePanels) {
            if (!this._fixedSize) {
                const btnDelete = new Button({
                    icon: 'E289',
                    size: 'small',
                    class: CLASS_ARRAY_DELETE,
                    tabIndex: -1 // skip buttons on tab
                });
                btnDelete.on('click', () => {
                    this._removeArrayElement(entry);
                });

                container.append(btnDelete);
            }
        } else {
            container.on('click:remove', () => {
                this._removeArrayElement(entry);
            });
        }

        element.on('change', (value: any) => {
            this._onArrayElementChange(entry, value);
        });

        this._containerArray.append(container);

        return entry;
    }

    protected _removeArrayElement(entry: any) {
        const index = this._arrayElements.indexOf(entry);
        if (index === -1) return;

        // remove row from every array in values
        const values = this._values.map((array) => {
            if (!array) return null;
            array.splice(index, 1);
            return array;
        });

        this._updateValues(values, true);
    }

    protected _onArrayElementChange(entry: any, value: any) {
        if (this._suspendArrayElementEvts) return;

        const index = this._arrayElements.indexOf(entry);
        if (index === -1) return;

        // Set the value to the same row of every array in values.
        this._values.forEach((array) => {
            if (array && array.length > index) {
                if (this._valueType === 'curveset') {
                    // curveset is passing the value in an array
                    array[index] = Array.isArray(value) ? value[0] : value;
                } else {
                    array[index] = value;
                }
            }
        });

        // use a timeout here because when our values change they will
        // first emit change events on each array element. However since the
        // whole array changed we are going to fire a 'change' event later from
        // our '_updateValues' function. We only want to emit a 'change' event
        // here when only the array element changed value and not the whole array so
        // wait a bit and fire the change event later otherwise the _updateValues function
        // will cancel this timeout and fire a change event for the whole array instead
        this._arrayElementChangeTimeout = window.setTimeout(() => {
            this._arrayElementChangeTimeout = null;
            this.emit('change', this.value);
        });
    }

    protected _linkArrayElement(element: any, index: number) {
        const observers = this._binding.observers;
        const paths = this._binding.paths;
        const useSinglePath = paths.length === 1 || observers.length !== paths.length;
        element.unlink();
        element.value = null;

        this.emit('unlinkElement', element, index);

        const path = (useSinglePath ? paths[0] + `.${index}` : paths.map((path: string) => `${path}.${index}`));
        element.link(observers, path);

        this.emit('linkElement', element, index, path);
    }

    protected _updateValues(values: any, applyToBinding: boolean) {
        this._values = values || [];

        this._suspendArrayElementEvts = true;
        this._suspendSizeChangeEvt = true;

        // apply values to the binding
        if (applyToBinding && this._binding) {
            this._binding.setValues(values);
        }

        // each row of this array holds
        // all the values for that row
        const valuesPerRow: any[] = [];
        // holds the length of each array
        const arrayLengths: any[] = [];

        values.forEach((array: any) => {
            if (!array) return;

            arrayLengths.push(array.length);

            array.forEach((item: any, i: number) => {
                if (!valuesPerRow[i]) {
                    valuesPerRow[i] = [];
                }

                valuesPerRow[i].push(item);
            });
        });

        let lastElementIndex = -1;
        for (let i = 0; i < valuesPerRow.length; i++) {
            // if the number of values on this row does not match
            // the number of arrays then stop adding rows
            if (valuesPerRow[i].length !== values.length) {
                break;
            }

            // create row if it doesn't exist
            if (!this._arrayElements[i]) {
                this._createArrayElement();
            }

            // bind to observers for that row or just display the values
            if (this._binding && this._binding.observers) {
                this._linkArrayElement(this._arrayElements[i].element, i);
            } else {
                if (valuesPerRow[i].length > 1) {
                    this._arrayElements[i].element.values = valuesPerRow[i];
                } else {
                    this._arrayElements[i].element.value = valuesPerRow[i][0];
                }
            }

            lastElementIndex = i;
        }

        // destroy elements that are no longer in our values
        for (let i = this._arrayElements.length - 1; i > lastElementIndex; i--) {
            this._arrayElements[i].container.destroy();
            this._arrayElements.splice(i, 1);
        }


        this._inputSize.values = arrayLengths;

        this._suspendSizeChangeEvt = false;
        this._suspendArrayElementEvts = false;

        if (this._arrayElementChangeTimeout) {
            window.clearTimeout(this._arrayElementChangeTimeout);
            this._arrayElementChangeTimeout = null;
        }

        this.emit('change', this.value);
    }

    focus() {
        this._inputSize.focus();
    }

    blur() {
        this._inputSize.blur();
    }

    unlink() {
        super.unlink();
        this._arrayElements.forEach((entry: { element: Element; }) => {
            entry.element.unlink();
        });
    }

    link(observers: Observer|Observer[], paths: string|string[]) {
        super.link(observers, paths);
        this._arrayElements.forEach((entry: { element: Element; }, index: number) => {
            this._linkArrayElement(entry.element, index);
        });
    }

    /**
     * Executes the specified function for each array element.
     *
     * @param fn - The function with signature (element, index) => bool to execute. If the function
     * returns `false` then the iteration will early out.
     */
    forEachArrayElement(fn: (element: Element, index: number) => false | void) {
        this._containerArray.forEachChild((element, i) => {
            return fn(element.dom.firstChild.ui, i);
        });
    }

    // override binding setter to create
    // the same type of binding on each array element too
    set binding(value) {
        super.binding = value;

        this._arrayElements.forEach((entry: { element: Element; }) => {
            entry.element.binding = value ? value.clone() : null;
        });
    }

    get binding() {
        return super.binding;
    }

    set value(value) {
        if (!Array.isArray(value)) {
            value = [];
        }

        const current = this.value || [];
        if (utils.arrayEquals(current, value)) return;

        // update values and binding
        this._updateValues(new Array(this._values.length || 1).fill(value), true);
    }

    get value() {
        // construct value from values of array elements
        return this._arrayElements.map((entry: { element: { value: any; }; }) => entry.element.value);
    }

    /* eslint accessor-pairs: 0 */
    set values(values: any) {
        if (utils.arrayEquals(this._values, values)) return;
        // update values but do not update binding
        this._updateValues(values, false);
    }

    set renderChanges(value) {
        this._renderChanges = value;
        this._arrayElements.forEach((entry: { element: { renderChanges: any; }; }) => {
            entry.element.renderChanges = value;
        });
    }

    get renderChanges() {
        return this._renderChanges;
    }
}

for (const type in ArrayInput.DEFAULTS) {
    Element.register(`array:${type}`, ArrayInput, { type: type, renderChanges: true });
}
Element.register('array:select', ArrayInput, { type: 'select', renderChanges: true });

export default ArrayInput;
