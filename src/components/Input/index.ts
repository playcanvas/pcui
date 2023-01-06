import Element, { ElementArgs, IBindable } from '../Element';

/**
 * The arguments for the {@link Input} constructor.
 */
export interface InputArgs extends ElementArgs {}

class Input extends Element implements IBindable {
    protected _renderChanges: boolean;

    set value(value: any) {
        throw new Error('Not implemented!');
    }

    get value(): any {
        throw new Error('Not implemented!');
    }

    set values(value: Array<any>) {
        throw new Error('Not implemented!');
    }

    get values(): Array<any> {
        throw new Error('Not implemented!');
    }

    set renderChanges(value: boolean) {
        this._renderChanges = value;
    }

    get renderChanges(): boolean {
        return this._renderChanges;
    }
}

export default Input;
