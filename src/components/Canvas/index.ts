import { Element, ElementArgs } from '../Element';

const CLASS_ROOT = 'pcui-canvas';

/**
 * The arguments for the {@link Canvas} constructor.
 */
interface CanvasArgs extends ElementArgs {
    /**
     * Whether the canvas should use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio devicePixelRatio}.
     * Defaults to `false`.
     */
    useDevicePixelRatio?: boolean;
}

/**
 * Represents a Canvas.
 */
class Canvas extends Element {
    protected _width = 300;

    protected _height = 150;

    protected _ratio = 1;

    /**
     * Creates a new Canvas.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<CanvasArgs> = {}) {
        super({ dom: 'canvas', ...args });

        this.class.add(CLASS_ROOT);

        const { useDevicePixelRatio = false } = args;
        this._ratio = useDevicePixelRatio ? window.devicePixelRatio : 1;

        // Disable I-bar cursor on click+drag
        this.dom.onselectstart = (evt: Event) => {
            return false;
        };
    }

    /**
     * Resize the canvas using the given width and height parameters.
     *
     * @param width - The new width of the canvas.
     * @param height - The new height of the canvas.
     */
    resize(width: number, height: number) {
        if (this._width === width && this._height === height)
            return;

        this._width = width;
        this._height = height;

        const canvas = this._dom as HTMLCanvasElement;
        canvas.width = this.pixelWidth;
        canvas.height = this.pixelHeight;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        this.emit('resize', width, height);
    }

    /**
     * Sets the width of the canvas.
     */
    set width(value: number) {
        if (this._width === value)
            return;

        this._width = value;

        const canvas = this._dom as HTMLCanvasElement;
        canvas.width = this.pixelWidth;
        canvas.style.width = value + 'px';

        this.emit('resize', this._width, this._height);
    }

    /**
     * Gets the width of the canvas.
     */
    get width(): number {
        return this._width;
    }


    /**
     * Sets the height of the canvas.
     */
    set height(value: number) {
        if (this._height === value)
            return;

        this._height = value;

        const canvas = this._dom as HTMLCanvasElement;
        canvas.height = this.pixelHeight;
        canvas.style.height = value + 'px';

        this.emit('resize', this._width, this._height);
    }

    /**
     * Gets the height of the canvas.
     */
    get height(): number {
        return this._height;
    }

    /**
     * Gets the pixel height of the canvas.
     */
    get pixelWidth(): number {
        return Math.floor(this._width * this._ratio);
    }

    /**
     * Gets the pixel height of the canvas.
     */
    get pixelHeight(): number {
        return Math.floor(this._height * this._ratio);
    }

    /**
     * Gets the pixel ratio of the canvas.
     */
    get pixelRatio(): number {
        return this._ratio;
    }
}

Element.register('canvas', Canvas);

export { Canvas, CanvasArgs };
