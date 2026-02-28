import { Observer } from '@playcanvas/observer';

import { BindingObserversToElement } from '../../binding/BindingObserversToElement';
import { Container, ContainerArgs } from '../Container';
import { IFocusable } from '../Element';
import { Label } from '../Label';
import { RadioButton } from '../RadioButton';

const CLASS_ROOT = 'pcui-gridview-item';
const CLASS_ROOT_RADIO = 'pcui-gridview-radio-container';
const CLASS_SELECTED = `${CLASS_ROOT}-selected`;
const CLASS_TEXT = `${CLASS_ROOT}-text`;
const CLASS_RADIO_BUTTON = 'pcui-gridview-radiobtn';

/**
 * The arguments for the {@link GridViewItem} constructor.
 */
interface GridViewItemArgs extends ContainerArgs {
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
    /**
     * Sets the tabIndex of the {@link GridViewItem}. Defaults to 0.
     */
    tabIndex?: number;
}

/**
 *  Represents a grid view item used in {@link GridView}.
 */
class GridViewItem extends Container implements IFocusable {
    /**
     * Determines whether the item can be selected. Defaults to `true`.
     */
    public allowSelect = true;

    protected _selected: boolean;

    protected _radioButton: RadioButton;

    protected _labelText: Label;

    protected _type: string;

    /**
     * Creates a new GridViewItem.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<GridViewItemArgs> = {}) {
        super({ tabIndex: 0, ...args });

        this.allowSelect = args.allowSelect ?? true;
        this._type = args.type ?? null;
        this._selected = false;

        if (args.type === 'radio') {
            this.class.add(CLASS_ROOT_RADIO);

            this._radioButton = new RadioButton({
                class: CLASS_RADIO_BUTTON,
                binding: new BindingObserversToElement()
            });

            // @ts-ignore Remove radio button click event listener
            this._radioButton.dom.removeEventListener('click', this._radioButton._onClick);
            this._radioButton.dom.addEventListener('click', this._onRadioButtonClick);

            this.append(this._radioButton);
        } else {
            this.class.add(CLASS_ROOT);
        }

        this._labelText = new Label({
            class: CLASS_TEXT,
            binding: new BindingObserversToElement(),
            text: args.text ?? ''
        });

        this.append(this._labelText);

        this.dom.addEventListener('focus', this._onFocus);
        this.dom.addEventListener('blur', this._onBlur);
    }

    destroy() {
        if (this._destroyed) return;

        this.dom.removeEventListener('focus', this._onFocus);
        this.dom.removeEventListener('blur', this._onBlur);

        super.destroy();
    }

    protected _onRadioButtonClick = () => {
        this._radioButton.value = this.selected;
    };

    protected _onFocus = () => {
        this.emit('focus');
    };

    protected _onBlur = () => {
        this.emit('blur');
    };

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

    /**
     * Sets whether the item is selected.
     */
    set selected(value) {
        if (this._selected === value) return;

        this._selected = value;

        if (value) {
            if (this._radioButton) {
                this._radioButton.value = value;
            } else {
                this.class.add(CLASS_SELECTED);
            }

            this.emit('select', this);
        } else {
            if (this._radioButton) {
                this._radioButton.value = false;
            } else {
                this.class.remove(CLASS_SELECTED);
            }

            this.emit('deselect', this);
        }
    }

    /**
     * Gets whether the item is selected.
     */
    get selected() {
        return this._selected;
    }

    /**
     * Sets the text of the item.
     */
    set text(value) {
        this._labelText.text = value;
    }

    /**
     * Gets the text of the item.
     */
    get text() {
        return this._labelText.text;
    }

    /**
     * Gets the next visible sibling grid view item.
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
     * Gets the previous visible sibling grid view item.
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

export { GridViewItem, GridViewItemArgs };
