import { Observer } from '@playcanvas/observer';
import { IFocusable } from '../Element/index';
import Container, { ContainerArgs } from '../Container/index';
import Label from '../Label/index';
import BindingObserversToElement from '../../binding/BindingObserversToElement/index';
import RadioButton from '../RadioButton/index';

const CLASS_ROOT = 'pcui-gridview-item';
const CLASS_ROOT_RADIO = 'pcui-gridview-radio-container';
const CLASS_SELECTED = CLASS_ROOT + '-selected';
const CLASS_TEXT = CLASS_ROOT + '-text';
const CLASS_RADIO_BUTTON = 'pcui-gridview-radiobtn';

/**
 * The arguments for the {@link GridViewItem} constructor.
 */
export interface GridViewItemArgs extends ContainerArgs {
    /**
     * The type of the {@link GridViewItem}. Can be `null` or 'radio'.
     */
    type?: string;
    /**
     * If `true`, allow selecting the item. Defaults to `true`.
     */
    allowSelect?: boolean;
    /**
     * Whether the item is selected.
     */
    selected?: boolean;
    /**
     * The text of the item. Defaults to ''.
     */
    text?: string;
}

/**
 *  Represents a grid view item used in {@link GridView}.
 */
class GridViewItem extends Container implements IFocusable {
    static readonly defaultArgs: GridViewItemArgs = {
        ...Container.defaultArgs,
        allowSelect: true,
        text: '',
        tabIndex: 0
    };

    protected _selected: boolean;

    protected _radioButton: RadioButton;

    protected _radioButtonClickEvt: any;

    protected _labelText: Label;

    protected _type: string;

    protected _domEvtFocus: any;

    protected _domEvtBlur: any;

    protected _allowSelect: boolean;

    constructor(args: GridViewItemArgs = GridViewItem.defaultArgs) {
        args = { ...GridViewItem.defaultArgs, ...args };
        super(args);

        this.allowSelect = args.allowSelect;
        this._selected = false;

        if (args.type === 'radio') {
            this.class.add(CLASS_ROOT_RADIO);

            this._radioButton = new RadioButton({
                class: CLASS_RADIO_BUTTON,
                binding: new BindingObserversToElement({})
            });

            this._radioButtonClickEvt = this._radioButtonClick.bind(this);

            // @ts-ignore Remove radio button click event listener
            this._radioButton.dom.removeEventListener('click', this._radioButton._onClick);
            this._radioButton.dom.addEventListener('click', this._radioButtonClickEvt);

            this.append(this._radioButton);
        } else {
            this.class.add(CLASS_ROOT);
        }

        this._labelText = new Label({
            class: CLASS_TEXT,
            binding: new BindingObserversToElement({})
        });

        this.append(this._labelText);

        this.text = args.text;
        this._type = args.type;

        this._domEvtFocus = this._onFocus.bind(this);
        this._domEvtBlur = this._onBlur.bind(this);

        this.dom.addEventListener('focus', this._domEvtFocus);
        this.dom.addEventListener('blur', this._domEvtBlur);
    }

    protected _radioButtonClick() {
        this._radioButton.value = this.selected;
    }

    protected _onFocus() {
        this.emit('focus');
    }

    protected _onBlur() {
        this.emit('blur');
    }

    focus() {
        this.dom.focus();
    }

    blur() {
        this.dom.blur();
    }

    link(observers: Observer|Observer[], paths: string|string[]) {
        this._labelText.link(observers, paths);
    }

    unlink() {
        this._labelText.unlink();
    }

    destroy() {
        if (this._destroyed) return;

        this.dom.removeEventListener('focus', this._domEvtFocus);
        this.dom.removeEventListener('blur', this._domEvtBlur);

        super.destroy();
    }

    /**
     * If `true` allow selecting the item. Defaults to `true`.
     */
    set allowSelect(value) {
        this._allowSelect = value;
    }

    get allowSelect() {
        return this._allowSelect;
    }

    /**
     * Whether the item is selected.
     */
    set selected(value) {
        if (value) {
            this.focus();
        }

        if (this._selected === value) return;

        this._selected = value;

        if (value) {
            // Update radio button if it exists
            if (this._radioButton)
                this._radioButton.value = value;
            else
                this.classAdd(CLASS_SELECTED);

            this.emit('select', this);
        } else {
            // Update radio button if it exists
            if (this._radioButton)
                this._radioButton.value = false;
            else
                this.classRemove(CLASS_SELECTED);

            this.emit('deselect', this);
        }
    }

    get selected() {
        return this._selected;
    }

    /**
     * The text of the item.
     */
    set text(value) {
        this._labelText.text = value;
    }

    get text() {
        return this._labelText.text;
    }

    /**
     * Returns the next visible sibling grid view item.
     */
    get nextSibling() {
        let sibling = this.dom.nextSibling;
        while (sibling) {
            if (sibling.ui instanceof GridViewItem && !sibling.ui.hidden) {
                return sibling.ui;
            }

            sibling = sibling.nextSibling;
        }

        return null;
    }

    /**
     * Returns the previous visible sibling grid view item.
     */
    get previousSibling() {
        let sibling = this.dom.previousSibling;
        while (sibling) {
            if (sibling.ui instanceof GridViewItem && !sibling.ui.hidden) {
                return sibling.ui;
            }

            sibling = sibling.previousSibling;
        }

        return null;
    }
}

export default GridViewItem;
