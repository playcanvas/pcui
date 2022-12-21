import Element, { ElementArgs } from '../Element/index';

export interface CanvasArgs extends ElementArgs {
    /**
     * Tab index of the canvas.
     */
    tabindex?: any;
    /**
     * Whether the canvas should use the device pixel ratio.
     */
    useDevicePixelRatio?: boolean;
    /**
     * The id to be given to the canvas in the dom.
     */
    id?: string
}

/**
 * Represents a Canvas
 */
class Canvas extends Element {
    static readonly defaultArgs: CanvasArgs = {
        ...Element.defaultArgs,
        dom: 'canvas'
    };

    protected _width: number;

    protected _height: number;

    protected _ratio: number;

    constructor(args: CanvasArgs = Canvas.defaultArgs) {
        args = { ...Canvas.defaultArgs, ...args };
        super(args.dom, args);

        this.dom.classList.add('pcui-canvas');

        if (args.id !== undefined)
            this.dom.id = args.id;

        if (args.tabindex !== undefined)
            this.dom.setAttribute('tabindex', args.tabindex);

        this._width = 300;
        this._height = 150;
        this._ratio = (args.useDevicePixelRatio !== undefined && args.useDevicePixelRatio) ? window.devicePixelRatio : 1;

        // Disable I-bar cursor on click+drag
        this.dom.onselectstart = this.onselectstart;
    }

    private onselectstart() {
        return false;
    }

    /**
     * Resize the canvas using the given width and height parameters.
     *
     * @param width
     * @param height
     */
    resize(width: number, height: number) {
        if (this._width === width && this._height === height)
            return;

        this._width = width;
        this._height = height;
        this.dom.width = this.pixelWidth;
        this.dom.height = this.pixelHeight;
        this.dom.style.width = width + 'px';
        this.dom.style.height = height + 'px';
        this.emit('resize', width, height);
    }

    /**
     * Gets / sets the width of the canvas.
     */
    set width(value: number) {
        if (this._width === value)
            return;

        this._width = value;
        this.dom.width = this.pixelWidth;
        this.dom.style.width = value + 'px';
        this.emit('resize', this._width, this._height);
    }

    get width(): number {
        return this._width;
    }


    /**
     * Gets / sets the height of the canvas.
     */
    set height(value: number) {
        if (this._height === value)
            return;

        this._height = value;
        this.dom.height = this.pixelHeight;
        this.dom.style.height = value + 'px';
        this.emit('resize', this._width, this._height);
    }

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

export default Canvas;
