import Element from '../Element/index';
import Container from '../Container';

const CLASS_OVERLAY = 'pcui-overlay';
const CLASS_OVERLAY_INNER = CLASS_OVERLAY + '-inner';
const CLASS_OVERLAY_CLICKABLE = CLASS_OVERLAY + '-clickable';
const CLASS_OVERLAY_TRANSPARENT = CLASS_OVERLAY + '-transparent';
const CLASS_OVERLAY_CONTENT = CLASS_OVERLAY + '-content';

namespace Overlay {
    export interface Args extends Element.Args {
        /**
         * Whether the overlay can be hidden by clicking on it.
         */
        clickable?: boolean,
        /**
         * Whether the overlay is transparent or not.
         */
        transparent?: boolean,
    }
}

/**
 * An overlay element.
 */
class Overlay extends Container {

    static readonly defaultArgs: Overlay.Args = {
        ...Element.defaultArgs
    };

    protected _domClickableOverlay: HTMLDivElement;
    protected _domEventMouseDown: any;

    constructor(args: Overlay.Args = Overlay.defaultArgs) {
        args = { ...Overlay.defaultArgs, ...args };
        super(args);

        this.class.add(CLASS_OVERLAY);

        this._domClickableOverlay = document.createElement('div');
        // @ts-ignore
        this._domClickableOverlay.ui = this;
        // @ts-ignore
        this._domClickableOverlay.classList = CLASS_OVERLAY_INNER;
        this.dom.appendChild(this._domClickableOverlay);

        this._domEventMouseDown = this._onMouseDown.bind(this);
        this._domClickableOverlay.addEventListener('mousedown', this._domEventMouseDown);

        this.domContent = document.createElement('div');
        // @ts-ignore
        this.domContent.ui = this;
        this.domContent.classList.add(CLASS_OVERLAY_CONTENT);
        this.dom.appendChild(this.domContent);

        this.clickable = args.clickable || false;
        this.transparent = args.transparent || false;
    }

    protected _onMouseDown(evt: any) {
        if (!this.clickable) return;

        // some field might be in focus
        document.body.blur();

        // wait till blur is done
        requestAnimationFrame(() => {
            this.hidden = true;
        });

        evt.preventDefault();
    }

    /**
     * Position the overlay at specific x, y coordinates.
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     */
    position(x: number, y: number) {
        const area = this._domClickableOverlay.getBoundingClientRect();
        const rect = this.domContent.getBoundingClientRect();

        x = Math.max(0, Math.min(area.width - rect.width, x));
        y = Math.max(0, Math.min(area.height - rect.height, y));

        this.domContent.style.position = 'absolute';
        this.domContent.style.left = `${x}px`;
        this.domContent.style.top = `${y}px`;
    }

    destroy() {
        if (this._destroyed) return;
        this._domClickableOverlay.removeEventListener('mousedown', this._domEventMouseDown);
        super.destroy();
    }

    /**
     * Whether the overlay can be hidden by clicking on it.
     */
    set clickable(value) {
        if (value) {
            this.class.add(CLASS_OVERLAY_CLICKABLE);
        } else {
            this.class.remove(CLASS_OVERLAY_CLICKABLE);
        }
    }

    get clickable() {
        return this.class.contains(CLASS_OVERLAY_CLICKABLE);
    }

    /**
     * Whether the overlay is transparent or not.
     */
    set transparent(value) {
        if (value) {
            this.class.add(CLASS_OVERLAY_TRANSPARENT);
        } else {
            this.class.remove(CLASS_OVERLAY_TRANSPARENT);
        }
    }

    get transparent() {
        return this.class.contains(CLASS_OVERLAY_TRANSPARENT);
    }
}

Element.register('overlay', Overlay);

export default Overlay;
