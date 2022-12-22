import { IBindable } from '../../components/Element/index';
import { Events, History, Observer } from '@playcanvas/observer';

export interface BindingBaseArgs {
    /**
     * The IBindable element.
     */
    element?: IBindable,
    /**
     * The history object which will be used to record undo / redo actions.
     * If none is provided then no history will be recorded.
     */
    history?: History,
    /**
     * A prefix that will be used for the name of every history action.
     */
    historyPrefix?: string,
    /**
     * A postfix that will be used for the name of every history action.
     */
    historyPostfix?: string,
    /**
     * The name of each history action.
     */
    historyName?: string,
    /**
     * Whether to combine history actions.
     */
    historyCombine?: boolean
}

/**
 * Base class for data binding between IBindable Elements and Observers.
 */
class BindingBase extends Events {
    protected _observers: Array<Observer>;

    protected _paths: Array<string>;

    protected _applyingChange: boolean;

    protected _element?: IBindable;

    protected _history?: History;

    protected _historyPrefix?: string;

    protected _historyPostfix?: string;

    protected _historyName?: string;

    protected _historyCombine: boolean;

    protected _linked: boolean;

    /**
     * Creates a new binding.
     *
     * @param args
     */
    constructor(args: BindingBaseArgs) {
        super();

        // the observers we are binding to
        this._observers = [];
        // the paths to use for the observers
        this._paths = [];

        this._applyingChange = false;
        this._element = args.element;

        this._history = args.history;
        this._historyPrefix = args.historyPrefix;
        this._historyPostfix = args.historyPostfix;
        this._historyName = args.historyName;
        this._historyCombine = args.historyCombine || false;

        this._linked = false;
    }

    // Returns the path at the specified index
    // or the path at the first index if it doesn't exist.
    protected _pathAt(paths: string[], index: number) {
        return paths[index] || paths[0];
    }

    /**
     * Links the specified observers to the specified paths.
     *
     * @param observers - The observer(s).
     * @param paths - The path(s). The behavior of the binding depends on how many paths are passed.
     * If an equal amount of paths and observers are passed then the binding will map each path to each observer at each index.
     * If more observers than paths are passed then the path at index 0 will be used for all observers.
     * If one observer and multiple paths are passed then all of the paths will be used for the observer (e.g. for curves).
     */
    link(observers: Observer[]|Observer, paths: string[]|string) {
        if (this._observers) {
            this.unlink();
        }

        this._observers = Array.isArray(observers) ? observers : [observers];
        this._paths = Array.isArray(paths) ? paths : [paths];

        this._linked = true;
    }

    /**
     * Unlinks the observers and paths.
     */
    unlink() {
        this._observers = [];
        this._paths = [];
        this._linked = false;
    }

    /**
     * Clones the binding. To be implemented by derived classes.
     */
    clone() {
        throw new Error('pcui.BindingBase#clone: Not implemented');
    }

    /**
     * Sets a value to the linked observers at the linked paths.
     *
     * @param value - The value
     */
    setValue(value: any) {
    }

    /**
     * Sets an array of values to the linked observers at the linked paths.
     *
     * @param values - The values.
     */
    setValues(values: any[]) {
    }

    /**
     * Adds (inserts) a value to the linked observers at the linked paths.
     *
     * @param value - The value.
     */
    addValue(value: any) {
    }

    /**
     * Adds (inserts) multiple values to the linked observers at the linked paths.
     *
     * @param values - The values.
     */
    addValues(values: any[]) {
    }

    /**
     * Removes a value from the linked observers at the linked paths.
     *
     * @param value - The value.
     */
    removeValue(value: any) {
    }

    /**
     * Removes multiple values from the linked observers from the linked paths.
     *
     * @param values - The values.
     */
    removeValues(values: any[]) {
    }

    /**
     * The element
     */
    set element(value: IBindable | undefined) {
        this._element = value;
    }

    get element(): IBindable | undefined {
        return this._element;
    }

    /**
     * Whether the binding is currently applying a change either to the observers or the element.
     */
    set applyingChange(value) {
        if (this._applyingChange === value) return;

        this._applyingChange = value;
        this.emit('applyingChange', value);
    }

    get applyingChange() {
        return this._applyingChange;
    }

    /**
     * Whether the binding is linked to observers.
     */
    get linked() {
        return this._linked;
    }

    /**
     * If a history module is used whether to combine history actions when applying changes to observers.
     */
    set historyCombine(value) {
        this._historyCombine = value;
    }

    get historyCombine() {
        return this._historyCombine;
    }

    /**
     * The name of the history action when applying changes to observers.
     */
    set historyName(value) {
        this._historyName = value;
    }

    get historyName() {
        return this._historyName;
    }

    /**
     * A string to prefix the historyName with.
     */
    set historyPrefix(value) {
        this._historyPrefix = value;
    }

    get historyPrefix() {
        return this._historyPrefix;
    }

    /**
     * A string to postfix the historyName with.
     */
    set historyPostfix(value) {
        this._historyPostfix = value;
    }

    get historyPostfix() {
        return this._historyPostfix;
    }

    /**
     * Whether history is enabled for the binding. A valid history object must have been provided first.
     */
    set historyEnabled(value) {
        if (this._history) {
            // @ts-ignore
            this._history.enabled = value;
        }
    }

    get historyEnabled() {
        // @ts-ignore
        return this._history && this._history.enabled;
    }

    /**
     * The linked observers
     */
    get observers() {
        return this._observers;
    }

    /**
     * The linked paths
     */
    get paths() {
        return this._paths;
    }
}

export default BindingBase;
