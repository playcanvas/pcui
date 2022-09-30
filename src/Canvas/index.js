import Element from '../Element';

/**
 * @name Canvas
 * @augments Element
 * @class
 * @property {number} id the id to be given to the canvas in the dom
 * @classdesc Represents a Canvas
 */
class Canvas extends Element {
    /**
     * Creates a new Canvas.
     *
     * @param {object} args - The arguments. Extends the Element arguments. Any settable property can also be set through the constructor.
     */
    constructor(args) {
        if (!args) args = {};

        super(args.dom ? args.dom : document.createElement('canvas'), args);

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

    onselectstart() {
        return false;
    }

    resize(width, height) {
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

    set width(value) {
        if (this._width === value)
            return;

        this._width = value;
        this.dom.width = this.pixelWidth;
        this.dom.style.width = value * 'px';
        this.emit('resize', this._width, this._height);
    }

    get width() {
        return this._width;
    }

    set height(value) {
        if (this._height === value)
            return;

        this._height = value;
        this.dom.height = this.pixelHeight;
        this.dom.style.height = value + 'px';
        this.emit('resize', this._width, this._height);
    }

    get height() {
        return this._height;
    }

    get pixelWidth() {
        return Math.floor(this._width * this._ratio);
    }

    get pixelHeight() {
        return Math.floor(this._height * this._ratio);
    }

    get pixelRatio() {
        return this._ratio;
    }
}

Element.register('canvas', Canvas);

export default Canvas;
