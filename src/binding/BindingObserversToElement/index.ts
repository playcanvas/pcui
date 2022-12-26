import { Observer } from '@playcanvas/observer';
import BindingBase, { BindingBaseArgs } from '../BindingBase';

export interface BindingObserversToElementArgs extends BindingBaseArgs {
    /**
     * Custom update function.
     */
    customUpdate?: any
}

/**
 * Provides one way binding between Observers and an {@link IBindable} element and Observers. Any
 * changes from the observers will be propagated to the element.
 */
class BindingObserversToElement extends BindingBase {
    _customUpdate: any;

    _events: any[];

    _updateElementHandler: any;

    _updateTimeout: any;

    /**
     * Creates a new BindingObserversToElement instance.
     *
     * @param root0
     * @param root0.customUpdate
     */
    constructor({ customUpdate, ...args }: any = {}) {
        super(args);

        this._customUpdate = args.customUpdate;
        this._events = [];
        this._updateElementHandler = this._updateElement.bind(this);
        this._updateTimeout = null;
    }

    private _linkObserver(observer: Observer, path: string) {
        this._events.push(observer.on(path + ':set', this._deferUpdateElement.bind(this)));
        this._events.push(observer.on(path + ':unset', this._deferUpdateElement.bind(this)));
        this._events.push(observer.on(path + ':insert', this._deferUpdateElement.bind(this)));
        this._events.push(observer.on(path + ':remove', this._deferUpdateElement.bind(this)));
    }

    private _deferUpdateElement() {
        if (this.applyingChange) return;
        this.applyingChange = true;

        this._updateTimeout = setTimeout(this._updateElementHandler);
    }

    private _updateElement() {
        if (this._updateTimeout) {
            clearTimeout(this._updateTimeout);
            this._updateTimeout = null;
        }

        this._updateTimeout = null;
        this.applyingChange = true;

        if (!this._element) return;
        if (typeof this._customUpdate === 'function') {
            this._customUpdate(this._element, this._observers, this._paths);
        } else if (this._observers.length === 1) {
            if (this._paths.length > 1) {
                // if using multiple paths for the single observer (e.g. curves)
                // then return an array of values for each path
                this._element.value = this._paths.map((path) => {
                    return this._observers[0].has(path) ? this._observers[0].get(path) : undefined;
                });
            } else {
                this._element.value = (this._observers[0].has(this._paths[0]) ? this._observers[0].get(this._paths[0]) : undefined);
            }
        } else {
            this._element.values = this._observers.map((observer, i) => {
                const path = this._pathAt(this._paths, i);
                return observer.has(path) ? observer.get(path) : undefined;
            });
        }

        this.applyingChange = false;
    }

    /**
     * Link the binding to a set of observers and paths.
     *
     * @param observers
     * @param paths
     */
    link(observers: Observer|Observer[], paths: string|string[]) {
        super.link(observers, paths);

        // don't render changes when we link
        if (this._element) {
            const renderChanges = this._element.renderChanges;
            this._element.renderChanges = false;
            this._updateElement();
            this._element.renderChanges = renderChanges;
        }

        if (this._observers.length === 1) {
            if (this._paths.length > 1) {
                for (let i = 0; i < this._paths.length; i++) {
                    this._linkObserver(this._observers[0], this._paths[i]);
                }
                return;
            }
        }

        for (let i = 0; i < this._observers.length; i++) {
            this._linkObserver(this._observers[i], this._pathAt(this._paths, i));
        }
    }

    /**
     * Unlink the binding from its set of observers.
     */
    unlink() {
        for (let i = 0; i < this._events.length; i++) {
            this._events[i].unbind();
        }
        this._events.length = 0;

        if (this._updateTimeout) {
            clearTimeout(this._updateTimeout);
            this._updateTimeout = null;
        }

        super.unlink();
    }

    /**
     * Clone the BindingObserversToElement instance.
     */
    clone() {
        return new BindingObserversToElement({
            customUpdate: this._customUpdate
        });
    }
}

export default BindingObserversToElement;
