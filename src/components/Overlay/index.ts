import { Container } from '../Container';
import { Element, ElementArgs } from '../Element';

const CLASS_OVERLAY = 'pcui-overlay';
const CLASS_OVERLAY_INNER = CLASS_OVERLAY + '-inner';
const CLASS_OVERLAY_CLICKABLE = CLASS_OVERLAY + '-clickable';
const CLASS_OVERLAY_TRANSPARENT = CLASS_OVERLAY + '-transparent';
const CLASS_OVERLAY_CONTENT = CLASS_OVERLAY + '-content';

/**
 * The arguments for the {@link Overlay} constructor.
 */
interface OverlayArgs extends ElementArgs {
    /**
     * Whether the overlay can be hidden by clicking on it.
     */
    clickable?: boolean,
    /**
     * Whether the overlay is transparent or not.
     */
    transparent?: boolean,
}

/**
 * An overlay element.
 */
class Overlay extends Container {
    protected _domClickableOverlay: HTMLDivElement;

    /**
     * Creates a new Overlay.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<OverlayArgs> = {}) {
        super(args);

        this.class.add(CLASS_OVERLAY);

        this._domClickableOverlay = document.createElement('div');
        this._domClickableOverlay.ui = this;
        this._domClickableOverlay.classList.add(CLASS_OVERLAY_INNER);
        this.dom.appendChild(this._domClickableOverlay);

        this._domClickableOverlay.addEventListener('pointerdown', this._onPointerDown);

        this.domContent = document.createElement('div');
        this.domContent.ui = this;
        this.domContent.classList.add(CLASS_OVERLAY_CONTENT);
        this.dom.appendChild(this.domContent);

        this.clickable = args.clickable || false;
        this.transparent = args.transparent || false;
    }

    destroy() {
        if (this._destroyed) return;

        this._domClickableOverlay.removeEventListener('pointerdown', this._onPointerDown);

        super.destroy();
    }

    protected _onPointerDown = (evt: MouseEvent) => {
        if (!this.clickable) return;

        // some field might be in focus
        document.body.blur();

        // wait till blur is done
        requestAnimationFrame(() => {
            this.hidden = true;
        });

        evt.preventDefault();
        evt.stopPropagation();
    };

    /**
     * Position the overlay at specific x, y coordinates.
     *
     * @param x - The x coordinate.
     * @param y - The y coordinate.
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

    /**
     * Sets whether the overlay can be hidden by clicking on it.
     */
    set clickable(value) {
        if (value) {
            this.class.add(CLASS_OVERLAY_CLICKABLE);
        } else {
            this.class.remove(CLASS_OVERLAY_CLICKABLE);
        }
    }

    /**
     * Gets whether the overlay can be hidden by clicking on it.
     */
    get clickable() {
        return this.class.contains(CLASS_OVERLAY_CLICKABLE);
    }

    /**
     * Sets whether the overlay is transparent or not.
     */
    set transparent(value) {
        if (value) {
            this.class.add(CLASS_OVERLAY_TRANSPARENT);
        } else {
            this.class.remove(CLASS_OVERLAY_TRANSPARENT);
        }
    }

    /**
     * Gets whether the overlay is transparent or not.
     */
    get transparent() {
        return this.class.contains(CLASS_OVERLAY_TRANSPARENT);
    }
}

Element.register('overlay', Overlay);

export { Overlay, OverlayArgs };
