import BindingBase from '../BindingBase';
import BindingElementToObservers from '../BindingElementToObservers';
import BindingObserversToElement from '../BindingObserversToElement';

/**
 * @name BindingTwoWay
 * @class
 * @classdesc Provides two way data binding between Observers and IBindable elements. This means
 * that when the value of the Observers changes the IBindable will be updated and vice versa.
 * @augments BindingBase
 */
class BindingTwoWay extends BindingBase {
    /**
     * Creates a new BindingTwoWay instance.
     *
     * @param {object} args - The arguments.
     */
    constructor(args) {
        if (!args) args = {};

        super(args);

        this._bindingElementToObservers = args.bindingElementToObservers || new BindingElementToObservers(args);
        this._bindingObserversToElement = args.bindingObserversToElement || new BindingObserversToElement(args);

        this._applyingChange = false;
        this._bindingElementToObservers.on('applyingChange', (value) => {
            this.applyingChange = value;
        });
        this._bindingElementToObservers.on('history:init', (context) => {
            this.emit('history:init', context);
        });
        this._bindingElementToObservers.on('history:undo', (context) => {
            this.emit('history:undo', context);
        });
        this._bindingElementToObservers.on('history:redo', (context) => {
            this.emit('history:redo', context);
        });

        this._bindingObserversToElement.on('applyingChange', (value) => {
            this.applyingChange = value;
        });
    }

    link(observers, paths) {
        super.link(observers, paths);
        this._bindingElementToObservers.link(observers, paths);
        this._bindingObserversToElement.link(observers, paths);
    }


    unlink() {
        this._bindingElementToObservers.unlink();
        this._bindingObserversToElement.unlink();
        super.unlink();
    }

    clone() {
        return new BindingTwoWay({
            bindingElementToObservers: this._bindingElementToObservers.clone(),
            bindingObserversToElement: this._bindingObserversToElement.clone()
        });
    }

    setValue(value) {
        this._bindingElementToObservers.setValue(value);
    }

    setValues(values) {
        this._bindingElementToObservers.setValues(values);
    }

    addValue(value) {
        this._bindingElementToObservers.addValue(value);
    }

    addValues(values) {
        this._bindingElementToObservers.addValues(values);
    }

    removeValue(value) {
        this._bindingElementToObservers.removeValue(value);
    }

    removeValues(values) {
        this._bindingElementToObservers.removeValues(values);
    }

    set element(value) {
        this._element = value;
        this._bindingElementToObservers.element = value;
        this._bindingObserversToElement.element = value;
    }

    get element() {
        return this._element;
    }

    set applyingChange(value) {
        if (super.applyingChange === value) return;

        this._bindingElementToObservers.applyingChange = value;
        this._bindingObserversToElement.applyingChange = value;
        super.applyingChange = value;
    }

    get applyingChange() {
        return super.applyingChange;
    }

    set historyCombine(value) {
        this._bindingElementToObservers.historyCombine = value;
    }

    get historyCombine() {
        return this._bindingElementToObservers.historyCombine;
    }

    set historyPrefix(value) {
        this._bindingElementToObservers.historyPrefix = value;
    }

    get historyPrefix() {
        return this._bindingElementToObservers.historyPrefix;
    }

    set historyPostfix(value) {
        this._bindingElementToObservers.historyPostfix = value;
    }

    get historyPostfix() {
        return this._bindingElementToObservers.historyPostfix;
    }

    set historyEnabled(value) {
        this._bindingElementToObservers.historyEnabled = value;
    }

    get historyEnabled() {
        return this._bindingElementToObservers.historyEnabled;
    }
}

export default BindingTwoWay;
