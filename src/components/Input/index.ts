import Element from '../Element/index';

namespace Input {
    export interface Args extends Element.Args {}
}

class Input extends Element implements Element.IBindable {
    protected _renderChanges: boolean;

    set value(value: any) {
        throw 'Not implemented!';
    }
    get value() : any {
        throw 'Not implemented!';
    }

    set values(value: Array<any>) {
        throw 'Not implemented!';
    }
    get values() : Array<any> {
        throw 'Not implemented!';
    }

    set renderChanges(value: boolean) {
        this._renderChanges = value;
    }
    get renderChanges() : boolean {
        return this._renderChanges;
    }
}

export default Input;