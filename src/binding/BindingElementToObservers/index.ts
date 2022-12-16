import { Observer } from '@playcanvas/observer';
import BindingBase from '../BindingBase';

/**
 * @name BindingElementToObservers
 * @class
 * @classdesc Provides one way binding between an IBindable element and Observers. Any changes from the element
 * will be propagated to the observers.
 * @augments BindingBase
 */
class BindingElementToObservers extends BindingBase {
    /**
     * Clone the binding and return a new instance.
     */
    clone() {
        return new BindingElementToObservers({
            history: this._history,
            historyPrefix: this._historyPrefix,
            historyPostfix: this._historyPostfix,
            historyName: this._historyName,
            historyCombine: this._historyCombine
        });
    }

    private _getHistoryActionName(paths: string[]) {
        return `${this._historyPrefix || ''}${this._historyName || paths[0]}${this._historyPostfix || ''}`;
    }

    // Sets the value (or values of isArrayOfValues is true)
    // to the observers
    private _setValue(value: any, isArrayOfValues: boolean) {
        if (this.applyingChange) return;
        if (!this._observers) return;

        this.applyingChange = true;

        // make copy of observers if we are using history
        // so that we can undo on the same observers in the future
        const observers = this._observers.slice();
        const paths = this._paths.slice();
        const context = {
            observers,
            paths
        };

        const execute = () => {
            this._setValueToObservers(observers, paths, value, isArrayOfValues);
            this.emit('history:redo', context);
        };

        if (this._history) {
            let previousValues: any[] = [];
            if (observers.length === 1 && paths.length > 1) {
                previousValues = paths.map((path) => {
                    return observers[0].has(path) ? observers[0].get(path) : undefined;
                });
            } else {
                previousValues = observers.map((observer, i) => {
                    const path = this._pathAt(paths, i);
                    return observer.has(path) ? observer.get(path) : undefined;
                });
            }

            this.emit('history:init', context);

            this._history.add({
                name: this._getHistoryActionName(paths),
                redo: execute,
                combine: this._historyCombine,
                undo: () => {
                    this._setValueToObservers(observers, paths, previousValues, true);
                    this.emit('history:undo', context);
                }
            });

        }

        execute();

        this.applyingChange = false;
    }

    private _setValueToObservers(observers: Observer[], paths: string[], value: any, isArrayOfValues: boolean) {
        // special case for 1 observer with multiple paths (like curves)
        // in that case set each value for each path
        if (observers.length === 1 && paths.length > 1) {
            for (let i = 0; i < paths.length; i++) {
                const latest: any = observers[0].latest();
                if (!latest) continue;

                let history = false;
                if (latest.history) {
                    history = latest.history.enabled;
                    latest.history.enabled = false;
                }

                const path = paths[i];
                const val = value[i];
                if (value !== undefined) {
                    this._observerSet(latest, path, val);
                } else {
                    latest.unset(path);
                }

                if (history) {
                    latest.history.enabled = true;
                }
            }
            return;
        }

        for (let i = 0; i < observers.length; i++) {
            const latest: any = observers[i].latest();
            if (!latest) continue;

            let history = false;
            if (latest.history) {
                history = latest.history.enabled;
                latest.history.enabled = false;
            }

            const path = this._pathAt(paths, i);
            const val = isArrayOfValues ? value[i] : value;
            if (value !== undefined) {
                this._observerSet(latest, path, val);
            } else {
                latest.unset(path);
            }

            if (history) {
                latest.history.enabled = true;
            }
        }
    }

    // Handles setting a value to an observer
    // in case that value is an array
    private _observerSet(observer: Observer, path: string, value: any) {
        // check if the parent of the last field in the path
        // exists in the observer because if it doesn't
        // an error is most likely going to be raised by C3
        const lastIndexDot = path.lastIndexOf('.');
        if (lastIndexDot > 0 && !observer.has(path.substring(0, lastIndexDot))) {
            return;
        }

        const isArray = Array.isArray(value);
        // we need to slice an array value before passing it to the 'set'
        // method otherwise there are cases where the Observer will be modifying
        // the same array instance
        observer.set(path, isArray && value ? value.slice() : value);
    }

    private _addValues(values: any[]) {
        if (this.applyingChange) return;
        if (!this._observers) return;

        this.applyingChange = true;

        // make copy of observers if we are using history
        // so that we can undo on the same observers in the future
        const observers = this._observers.slice();
        const paths = this._paths.slice();

        const records: any[] = [];
        for (let i = 0; i < observers.length; i++) {
            const path = this._pathAt(paths, i);
            const observer = observers[i];

            values.forEach((value) => {
                if (observer.get(path).indexOf(value) === -1)  {
                    records.push({
                        observer: observer,
                        path: path,
                        value: value
                    });
                }
            });
        }

        const execute = () => {
            for (let i = 0; i < records.length; i++) {
                const latest = records[i].observer.latest();
                if (!latest) continue;

                const path = records[i].path;

                let history = false;
                if (latest.history) {
                    history = latest.history.enabled;
                    latest.history.enabled = false;
                }

                latest.insert(path, records[i].value);

                if (history) {
                    latest.history.enabled = true;
                }
            }
        };

        if (this._history && records.length) {
            this._history.add({
                name: this._getHistoryActionName(paths),
                redo: execute,
                combine: this._historyCombine,
                undo: () => {
                    for (let i = 0; i < records.length; i++) {
                        const latest = records[i].observer.latest();
                        if (!latest) continue;

                        const path = records[i].path;

                        let history = false;
                        if (latest.history) {
                            history = latest.history.enabled;
                            latest.history.enabled = false;
                        }

                        latest.removeValue(path, records[i].value);

                        if (history) {
                            latest.history.enabled = true;
                        }
                    }
                }
            });
        }

        execute();

        this.applyingChange = false;
    }

    private _removeValues(values: any[]) {
        if (this.applyingChange) return;
        if (!this._observers) return;

        this.applyingChange = true;

        // make copy of observers if we are using history
        // so that we can undo on the same observers in the future
        const observers = this._observers.slice();
        const paths = this._paths.slice();

        const records: any[] = [];
        for (let i = 0; i < observers.length; i++) {
            const path = this._pathAt(paths, i);
            const observer = observers[i];

            values.forEach((value) => {
                const ind = observer.get(path).indexOf(value);
                if (ind !== -1)  {
                    records.push({
                        observer: observer,
                        path: path,
                        value: value,
                        index: ind
                    });
                }
            });
        }

        const execute = () => {
            for (let i = 0; i < records.length; i++) {
                const latest = records[i].observer.latest();
                if (!latest) continue;

                const path = records[i].path;

                let history = false;
                if (latest.history) {
                    history = latest.history.enabled;
                    latest.history.enabled = false;
                }

                latest.removeValue(path, records[i].value);

                if (history) {
                    latest.history.enabled = true;
                }
            }
        };

        if (this._history && records.length) {
            this._history.add({
                name: this._getHistoryActionName(paths),
                redo: execute,
                combine: this._historyCombine,
                undo: () => {
                    for (let i = 0; i < records.length; i++) {
                        const latest = records[i].observer.latest();
                        if (!latest) continue;

                        const path = records[i].path;

                        let history = false;
                        if (latest.history) {
                            history = latest.history.enabled;
                            latest.history.enabled = false;
                        }

                        if (latest.get(path).indexOf(records[i].value) === -1) {
                            latest.insert(path, records[i].value, records[i].index);
                        }

                        if (history) {
                            latest.history.enabled = true;
                        }
                    }
                }
            });
        }

        execute();

        this.applyingChange = false;
    }

    setValue(value: any) {
        this._setValue(value, false);
    }

    setValues(values: any[]) {
        // make sure we deep copy arrays because they will not be cloned when set to the observers
        values = values.slice().map(val => (Array.isArray(val) ? val.slice() : val));
        this._setValue(values, true);
    }

    addValue(value: any) {
        this._addValues([value]);
    }

    addValues(values: any[]) {
        this._addValues(values);
    }

    removeValue(value: any) {
        this._removeValues([value]);
    }

    removeValues(values: any[]) {
        this._removeValues(values);
    }
}

export default BindingElementToObservers;
