// Object.assign(pcui, (function () {
//     'use strict';

    import Element from '../../components/Element';

    const CLASS_CANVAS = 'pcui-canvas';

    /**
     * @name pcui.Canvas
     * @classdesc A canvas element.
     * @property {Number} canvasWidth The width of the HTML canvas
     * @property {Number} canvasHeight The height of the HTML canvas
     * @extends pcui.Element
     */
    class Canvas extends Element {
        constructor(args) {
            if (!args) args = {};
            super(document.createElement('canvas'), args);

            this.class.add(CLASS_CANVAS);

            this._pixelWidth = 300;
            this._pixelHeight = 150;
            this._pixelRatio = args.useDevicePixelRatio !== undefined && args.useDevicePixelRatio ? window.devicePixelRatio : 1;
        }

        /**
         * @name pcui.Canvas#resize
         * @description Resizes the HTML canvas
         * @param {Number} width The width
         * @param {Number} height The height
         */
        resize(width, height) {
            const pixelWidth = Math.floor(this._pixelRatio * width);
            const pixelHeight = Math.floor(this._pixelRatio * height);
            if (pixelWidth === this._pixelWidth && pixelHeight === this._pixelHeight) {
                return;
            }
            this._pixelWidth = pixelWidth;
            this._pixelHeight = pixelHeight;
            this.dom.width = pixelWidth;
            this.dom.height = pixelHeight;
            this.width = width;
            this.height = height;

            this.emit('resize', this.width, this.height);
        }

        get width() {
            return super.width;
        }

        set width(value) {
            const pixelWidth = Math.floor(this._pixelRatio * value);
            if (pixelWidth === this._pixelWidth) {
                return;
            }
            this._pixelWidth = pixelWidth;
            this.dom.width = pixelWidth;
            super.width = value;
            this.emit('resize', this.width, this.height);
        }

        get height() {
            return super.height;
        }

        set height(value) {
            const pixelHeight = Math.floor(this._pixelRatio * value);
            if (pixelHeight === this._pixelHeight) {
                return;
            }
            this._pixelHeight = pixelHeight;
            this.dom.height = pixelHeight;
            super.height = value;
            this.emit('resize', this.width, this.height);
        }

        get pixelWidth() {
            return this._pixelWidth;
        }

        get pixelHeight() {
            return this._pixelHeight;
        }

        get pixelRatio() {
            return this._pixelRatio;
        }
    }

    // /**
    //  * @event
    //  * @name pcui.Element#resize
    //  * @description
    //  */

    export default Canvas;

//     return {
//         Canvas: Canvas
//     };
// })());
