import Events from './events';

/**
 * @name BindingBase
 * @classdesc Base class for data binding between IBindable Elements and Observers.
 * @property {Element} element The element
 * @property {Observer[]} observers The linked observers
 * @property {string[]} paths The linked paths
 * @property {boolean} applyingChange Whether the binding is currently applying a change either to the observers or the element.
 * @property {boolean} linked Whether the binding is linked to observers.
 * @property {boolean} historyCombine If a history module is used whether to combine history actions when applying changes to observers.
 * @property {string} historyName The name of the history action when applying changes to observers.
 * @property {string} historyPrefix A string to prefix the historyName with.
 * @property {string} historyPostfix A string to postfix the historyName with.
 */
class BindingBase extends Events {
    /**
     * Creates a new binding.
     *
     * @param {object} args - The arguments.
     * @param {IBindable} [args.element] - The IBindable element.
     * @param {History} [args.history] - The history object which will be used to record undo / redo actions.
     * If none is provided then no history will be recorded.
     * @param {string} [args.historyPrefix] - A prefix that will be used for the name of every history action.
     * @param {string} [args.historyPostfix] - A postfix that will be used for the name of every history action.
     * @param {string} [args.historyName] The name of each history action.
     * @param {Boolean} [args.historyCombine] Whether to combine history actions.
     */
    constructor(args) {
        super();

        if (!args) args = {};

        // the observers we are binding to
        this._observers = null;
        // the paths to use for the observers
        this._paths = null;

        this._applyingChange = false;
        this._element = args.element || null;

        this._history = args.history || null;
        this._historyPrefix = args.historyPrefix || null;
        this._historyPostfix = args.historyPostfix || null;
        this._historyName = args.historyName || null;
        this._historyCombine = args.historyCombine || false;

        this._linked = false;
    }

    // Returns the path at the specified index
    // or the path at the first index if it doesn't exist.
    _pathAt(paths, index) {
        return paths[index] || paths[0];
    }

    /**
     * @name BindingBase#link
     * @description Links the specified observers to the specified paths.
     * @param {Observer[]|Observer} observers - The observer(s).
     * @param {string[]|string} paths - The path(s). The behaviour of the binding depends on how many paths are passed.
     * If an equal amount of paths and observers are passed then the binding will map each path to each observer at each index.
     * If more observers than paths are passed then the path at index 0 will be used for all observers.
     * If one observer and multiple paths are passed then all of the paths will be used for the observer (e.g. for curves).
     */
    link(observers, paths) {
        if (this._observers) {
            this.unlink();
        }

        this._observers = Array.isArray(observers) ? observers : [observers];
        this._paths = Array.isArray(paths) ? paths : [paths];

        this._linked = true;
    }

    /**
     * @name BindingBase#unlink
     * @description Unlinks the observers and paths.
     */
    unlink() {
        this._observers = null;
        this._paths = null;
        this._linked = false;
    }

    /**
     * @name BindingBase#clone
     * @description Clones the binding. To be implemented by derived classes.
     */
    clone() {
        throw new Error('pcui.BindingBase#clone: Not implemented');
    }

    /**
     * @name BindingBase#setValue
     * @description Sets a value to the linked observers at the linked paths.
     * @param {Any} value - The value
     */
    setValue(value) {
    }

    /**
     * @name BindingBase#setValues
     * @description Sets an array of values to the linked observers at the linked paths.
     * @param {Any[]} values - The values
     */
    setValues(values) {
    }

    /**
     * @name BindingBase#addValue
     * @description Adds (inserts) a value to the linked observers at the linked paths.
     * @param {Any} value - The value
     */
    addValue(value) {
    }

    /**
     * @name BindingBase#addValues
     * @description Adds (inserts) multiple values to the linked observers at the linked paths.
     * @param {Any[]} values - The values
     */
    addValues(values) {
    }

    /**
     * @name BindingBase#removeValue
     * @description Removes a value from the linked observers at the linked paths.
     * @param {Any} value - The value
     */
    removeValue(value) {
    }

    /**
     * @name BindingBase#removeValues
     * @description Removes multiple values from the linked observers from the linked paths.
     * @param {Any[]} values - The values
     */
    removeValues(values) {
    }

    get element() {
        return this._element;
    }

    set element(value) {
        this._element = value;
    }

    get applyingChange() {
        return this._applyingChange;
    }

    set applyingChange(value) {
        if (this._applyingChange === value) return;

        this._applyingChange = value;
        this.emit('applyingChange', value);
    }

    get linked() {
        return this._linked;
    }

    get historyCombine() {
        return this._historyCombine;
    }

    set historyCombine(value) {
        this._historyCombine = value;
    }

    get historyName() {
        return this._historyName;
    }

    set historyName(value) {
        this._historyName = value;
    }

    get historyPrefix() {
        return this._historyPrefix;
    }

    set historyPrefix(value) {
        this._historyPrefix = value;
    }

    get historyPostfix() {
        return this._historyPostfix;
    }

    set historyPostfix(value) {
        this._historyPostfix = value;
    }

    get observers() {
        return this._observers;
    }

    get paths() {
        return this._paths;
    }
}

export default BindingBase;
