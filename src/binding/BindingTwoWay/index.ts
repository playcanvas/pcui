import BindingBase, { BindingBaseArgs } from '../BindingBase';
import BindingElementToObservers from '../BindingElementToObservers';
import BindingObserversToElement from '../BindingObserversToElement';
import { Observer } from '@playcanvas/observer';
import { IBindable } from '../../components/Element';

export interface BindingTwoWayArgs extends BindingBaseArgs {
    /**
     * BindingElementToObservers instance.
     */
    bindingElementToObservers?: BindingElementToObservers;

    /**
     * BindingObserversToElement instance.
     */
    bindingObserversToElement?: BindingObserversToElement;
}

/**
 * Provides two way data binding between Observers and {@link IBindable} elements. This means that
 * when the value of the Observers changes the IBindable will be updated and vice versa.
 */
class BindingTwoWay extends BindingBase {
    _bindingElementToObservers: any;

    _bindingObserversToElement: any;

    /**
     * Creates a new BindingTwoWay instance.
     *
     * @param args - The arguments.
     */
    constructor(args: BindingTwoWayArgs = {}) {
        super(args);

        this._bindingElementToObservers = args.bindingElementToObservers || new BindingElementToObservers(args);
        this._bindingObserversToElement = args.bindingObserversToElement || new BindingObserversToElement(args);

        this._applyingChange = false;
        this._bindingElementToObservers.on('applyingChange', (value: any) => {
            this.applyingChange = value;
        });
        this._bindingElementToObservers.on('history:init', (context: any) => {
            this.emit('history:init', context);
        });
        this._bindingElementToObservers.on('history:undo', (context: any) => {
            this.emit('history:undo', context);
        });
        this._bindingElementToObservers.on('history:redo', (context: any) => {
            this.emit('history:redo', context);
        });

        this._bindingObserversToElement.on('applyingChange', (value: any) => {
            this.applyingChange = value;
        });
    }

    link(observers: Observer|Observer[], paths: string|string[]) {
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

    setValue(value: any) {
        this._bindingElementToObservers.setValue(value);
    }

    setValues(values: any[]) {
        this._bindingElementToObservers.setValues(values);
    }

    addValue(value: any) {
        this._bindingElementToObservers.addValue(value);
    }

    addValues(values: any[]) {
        this._bindingElementToObservers.addValues(values);
    }

    removeValue(value: any) {
        this._bindingElementToObservers.removeValue(value);
    }

    removeValues(values: any[]) {
        this._bindingElementToObservers.removeValues(values);
    }

    set element(value: IBindable | undefined) {
        this._element = value;
        this._bindingElementToObservers.element = value;
        this._bindingObserversToElement.element = value;
    }

    get element() : IBindable | undefined {
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
