import Container from '../Container';
import Label from '../Label';
import Button from '../Button';
import NumericInput from '../NumericInput';
import SelectInput from '../SelectInput';
import BooleanInput from '../BooleanInput';
import Canvas from '../../pcui/element/element-canvas';
import * as pcuiClass from '../../pcui/element-class';
import utils from '../../pcui/helpers/utils';
import { localStorageSet, localStorageGet } from '../../pcui/helpers/localStorage';
import {
    Curve,
    math
} from 'playcanvas';
import Tooltip from '../../pcui/element/element-tooltip';

const CLASS_CURVE = 'pcui-curve';
const CLASS_CURVE_PICKER = CLASS_CURVE + '-picker';
const CLASS_CURVE_PICKER_HEADER = CLASS_CURVE + '-picker-header';
const CLASS_CURVE_PICKER_TOGGLES = CLASS_CURVE + '-picker-toggles';
const CLASS_CURVE_PICKER_TOGGLE = CLASS_CURVE + '-picker-toggle';
const CLASS_CURVE_PICKER_TOGGLE_ACTIVE = CLASS_CURVE_PICKER_TOGGLE + '-active';
const CLASS_CURVE_PICKER_CANVAS = CLASS_CURVE + '-picker-canvas';
const CLASS_CURVE_PICKER_FOOTER = CLASS_CURVE + '-picker-footer';

const curvePickerDom = (parent) => [{
    root: {
        picker: new Container({
            class: CLASS_CURVE_PICKER
        })
    },
    children: [{
        root: {
            header: new Container({
                class: CLASS_CURVE_PICKER_HEADER
            })
        },
        children: [{
            typeLabel: new Label({
                text: 'Type'
            })
        },
        {
            typeSelect: new SelectInput({
                type: 'number',
                options: [{
                    v: 0,
                    t: 'Linear'
                }, {
                    v: 1,
                    t: 'Smooth Step'
                }, {
                    v: 2,
                    t: 'Legacy Spline'
                }, {
                    v: 4,
                    t: 'Spline'
                }, {
                    v: 5,
                    t: 'Step'
                }]
            })
        },
        {
            randomizeLabel: new Label({
                text: 'Randomize'
            })
        },
        {
            randomizeToggle: new BooleanInput({
                type: 'toggle'
            })
        },
        {
            root: {
                curveToggles: new Container({
                    class: CLASS_CURVE_PICKER_TOGGLES
                })
            },
            children: parent.curveToggles.map((toggle, i) => ({
                [`toggle${i}`]: new Button({
                    text: toggle,
                    class: [CLASS_CURVE_PICKER_TOGGLE, CLASS_CURVE_PICKER_TOGGLE_ACTIVE, `toggle-${i}`]
                })
            }))
        }]
    },
    {
        pickerCanvas: new Canvas({
            class: CLASS_CURVE_PICKER_CANVAS,
            useDevicePixelRatio: true,
            canvasWidth: 470,
            canvasHeight: 200
        })
    },
    {
        root: {
            footer: new Container({
                class: CLASS_CURVE_PICKER_FOOTER
            })
        },
        children: [{
            timeInput: new NumericInput({
                precision: 2,
                placeholder: 'Time'
            })
        },
        {
            valueInput: new NumericInput({
                precision: 2,
                step: 0.1,
                placeholder: 'Value'
            })
        },
        {
            resetZoomButton: new Button({
                icon: 'E308'
            })
        },
        {
            resetCurveButton: new Button({
                icon: 'E150'
            })
        },
        {
            copyButton: new Button({
                icon: 'E351'
            })
        },
        {
            pasteButton: new Button({
                icon: 'E348'
            })
        }]
    }]
}];

/**
 * @name CurveInput
 * @class
 * @classdesc Shows a curve or curveset
 * @property {boolean} renderChanges If true the input will flash when changed.
 * @augments Container
 * @mixes IFocusable
 * @mixes IBindable
 */
class CurveInput extends Container {
    /**
     * Creates a new pcui.CurveInput.
     *
     * @param {object} args - The arguments.
     * @param {number} [args.lineWidth] - The width of the rendered lines in pixels.
     * @param {string[]} [args.curves] - The names of the curves that the curve input controls.
     * @param {number} [args.min] - The minimum value that curves can take.
     * @param {number} [args.max] - The maximum value that curves can take.
     * @param {number} [args.verticalValue] - The default maximum and minimum values to show if min and max are undefined.
     * @param {boolean} [args.hideRandomize] - Whether to hide the randomize button in the curve picker.
     */
    constructor(args) {
        let i;

        args = Object.assign({
            tabIndex: 0
        }, args);

        super(args);

        this.class.add(CLASS_CURVE);

        this._canvas = new Canvas({
            useDevicePixelRatio: true
        });
        this._canvas.width = 470;
        this._canvas.height = 22;
        this.dom.appendChild(this._canvas.dom);
        this._canvas.parent = this;
        this._canvas.on('resize', this._renderCurves.bind(this));

        // make sure canvas is the same size as the container element
        // 20 times a second
        this.on('showToRoot', () => {
            this._clearResizeInterval();
            this._createResizeInterval();
        });

        this.on('hideToRoot', () => {
            this._clearResizeInterval();
        });

        this._pickerChanging = false;
        this._combineHistory = false;
        this._historyPostfix = null;

        this._domEventKeyDown = this._onKeyDown.bind(this);
        this._domEventFocus = this._onFocus.bind(this);
        this._domEventBlur = this._onBlur.bind(this);

        this.dom.addEventListener('keydown', this._domEventKeyDown);
        this.dom.addEventListener('focus', this._domEventFocus);
        this.dom.addEventListener('blur', this._domEventBlur);

        this.on('click', () => {
            if (!this.enabled || this.readOnly || this.class.contains(pcuiClass.MULTIPLE_VALUES)) return;
            this._openCurvePicker();
        });

        this._lineWidth = args.lineWidth || 1;

        this._min = 0;
        if (args.min !== undefined) {
            this._min = args.min;
        } else if (args.verticalValue !== undefined) {
            this._min = -args.verticalValue;
        }

        this._max = 1;
        if (args.max !== undefined) {
            this._max = args.max;
        } else if (args.verticalValue !== undefined) {
            this._max = args.verticalValue;
        }

        // default value
        this._value = this._getDefaultValue();

        if (args.value) {
            this.value = args.value;
        }

        this.renderChanges = args.renderChanges || false;

        this.on('change', () => {
            if (this.renderChanges) {
                this.flash();
            }
        });

        this.curveToggles = args.curves;

        this.buildDom(curvePickerDom(this));

        // arguments for the curve picker
        this._pickerArgs = {
            min: args.min,
            max: args.max,
            verticalValue: args.verticalValue,
            curves: args.curves,
            hideRandomize: args.hideRandomize
        };

        // curve picker variables

        // color variables
        this.colors = {
            bg: '#293538',
            gridLines: '#20292b',
            anchors: ['rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(133, 133, 252)', 'rgb(255, 255, 255)'],
            curves: ['rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(133, 133, 252)', 'rgb(255, 255, 255)'],
            curveFilling: ['rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(133, 133, 252, 0.5)', 'rgba(255, 255, 255, 0.5)'],
            text: 'white',
            highlightedLine: 'yellow'
        };

        // canvas variables
        this.padding = 10;
        this.axisSpacing = 20;
        this.anchorRadius = 4;
        this.curveHoverRadius = 8;
        this.anchorHoverRadius = 8;
        this.textSize = 10;

        // input related variables
        this.curves = []; // holds all the curves
        this.enabledCurves = []; // holds the rendered order of the curves
        this.numCurves = args.curves.length; // number of pairs of curves
        this.betweenCurves = this._randomizeToggle.value;
        this.curveType = 0;
        this.curveNames = [];
        this.verticalValue = 5;
        this.verticalTopValue = 5;
        this.verticalBottomValue = -5;
        this.maxVertical = null;
        this.minVertical = null;
        this.hoveredAnchor = null;
        this.hoveredCurve = null;
        this.selectedAnchor = null;
        this.selectedAnchorIndex = -1;
        this.selectedCurve = null;
        this.selectedCurveIndex = -1;
        this.dragging = false;
        this.scrolling = false;
        this.gradient = false;
        this.mouseY = 0;

        this.swizzle = [0, 1, 2, 3];

        this._pickerCanvas.width = 470;
        this._pickerCanvas.height = 200;

        this._pickerCanvasContext = this._pickerCanvas.element.getContext('2d');
        this._pickerCanvasContext.setTransform(this._pickerCanvas.pixelRatio, 0, 0, this._pickerCanvas.pixelRatio, 0, 0);

        this.value = args.curves
            .map((_, i) => {
                this._toggleCurve(this.curves[i], true);
                return [
                    {
                        type: 1,
                        keys: [0, 0],
                        betweenCurves: false
                    },
                    {
                        type: 1,
                        keys: [0, 0],
                        betweenCurves: false
                    }
                ];
            })
            .flat();

        this._renderPicker();

        this._typeSelect.on('change', (value) => {
            this.curveType = Number(value);
            this.curves.forEach((curve) => {
                curve.type = value;
            });
            this._renderPicker();
        });

        this._randomizeToggle.on('change', (value) => {
            this.changing = true;

            this.betweenCurves = value;

            var paths, values;

            if (!this.suspendEvents) {
                paths = ['0.betweenCurves'];
                values = [this.betweenCurves];
            }

            if (!this.betweenCurves) {
                for (i = 0; i < this.numCurves; i++) {
                    if (!this.curves[i + this.numCurves]) continue;

                    // disable the secondary graph
                    this._toggleCurve(this.curves[i + this.numCurves], false);
                    if (!this.suspendEvents) {
                        paths.push(this._getKeysPath(this.curves[i + this.numCurves]));
                        values.push(this._serializeCurveKeys(this.curves[i]));
                    }

                }
            } else {
                // enable the secondary graphs if their respective primary graphs are enabled
                for (i = 0; i < this.numCurves; i++) {
                    if (!this.curves[i + this.numCurves]) continue;

                    if (!this.suspendEvents) {
                        paths.push(this._getKeysPath(this.curves[i + this.numCurves]));
                        values.push(this._serializeCurveKeys(this.curves[i + this.numCurves]));
                    }

                    var isEnabled = this.enabledCurves.indexOf(this.curves[i]) >= 0;
                    this._toggleCurve(this.curves[i + this.numCurves], false);
                    if (isEnabled) {
                        this._toggleCurve(this.curves[i + this.numCurves], true);
                    }
                }
            }
            if (!this.suspendEvents)
                // this._onPickerChange(paths, values);

                this._renderPicker();
        });
        this._timeInput.on('change', (newValue) => {
            if (this.selectedAnchor) {
                this._updateAnchor(this.selectedCurve, this.selectedAnchor, newValue, this.selectedAnchor[1]);
                this._renderPicker();
            }
        });
        this._valueInput.on('change', (newValue) => {
            if (this.selectedAnchor) {
                this._updateAnchor(this.selectedCurve, this.selectedAnchor, this.selectedAnchor[0], newValue);
                this._renderPicker();
            }
        });

        this._copyButton.on('click', () => {
            var data = {
                primaryKeys: [],
                secondaryKeys: [],
                betweenCurves: this.betweenCurves,
                curveType: this.curveType
            };

            for (i = 0; i < this.numCurves; i++) {
                data.primaryKeys.push(this._serializeCurveKeys(this.curves[i]));
            }

            for (i = 0; i < this.numCurves; i++) {
                if (! this.curves[this.numCurves + i]) continue;

                if (this.betweenCurves) {
                    data.secondaryKeys.push(this._serializeCurveKeys(this.curves[this.numCurves + i]));
                } else {
                    data.secondaryKeys.push(this._serializeCurveKeys(this.curves[i]));
                }
            }

            localStorageSet('playcanvas_editor_clipboard_curves', data);
        });

        this._pasteButton.on('click', () => {
            var data = localStorageGet('playcanvas_editor_clipboard_curves');
            if (! data) return;

            var paths = [];
            var values = [];

            this.curveType = data.curveType;
            this.betweenCurves = data.betweenCurves && !this._randomizeToggle.hidden;

            var copyKeys = (i, data) => {
                if (data && this.curves[i]) {
                    var keys = data;

                    // clamp keys to min max values
                    if (this.minVertical != null || this.maxVertical != null) {
                        keys = [];
                        for (var j = 0, len = data.length; j < len; j += 2) {
                            keys.push(data[j]);

                            var value = data[j + 1];
                            if (this.minVertical != null && value < this.minVertical)
                                keys.push(this.minVertical);
                            else if (this.maxVertical != null && value > this.maxVertical)
                                keys.push(this.maxVertical);
                            else
                                keys.push(value);
                        }
                    }

                    this.curves[i] = new Curve(keys);
                    this.curves[i].type = this.curveType;

                    paths.push(this._getKeysPath(this.curves[i]));
                    values.push(keys);

                    if (this._typeSelect.value !== this.curveType) {
                        paths.push(i.toString() + '.type');
                        values.push(this.curveType);
                    }
                }
            };

            for (i = 0; i < this.numCurves; i++) {
                copyKeys(i, data.primaryKeys[i]);
            }

            for (i = 0; i < this.numCurves; i++) {
                copyKeys(i + this.numCurves, data.secondaryKeys[i]);
            }

            this.enabledCurves.length = 0;
            for (i = 0; i < this.numCurves; i++)  {
                if (this[`_toggle${i}`].class.contains(CLASS_CURVE_PICKER_TOGGLE_ACTIVE)) {
                    this.enabledCurves.push(this.curves[i]);
                    if (this.betweenCurves) {
                        this.enabledCurves.push(this.curves[i + this.numCurves]);
                    }
                }
            }

            this._setHovered(null, null);
            this._setSelected(this.enabledCurves[0], null);

            var suspend = this.suspendEvents;
            this.suspendEvents = true;

            if (this._randomizeToggle.value !== this.betweenCurves) {
                this._randomizeToggle.value = this.betweenCurves;
                paths.push('0.betweenCurves');
                values.push(this.betweenCurves);
            }

            if (this._typeSelect.value !== this.curveType) {
                this._typeSelect.value = this.curveType;
            }

            this.suspendEvents = suspend;

            if (!this.suspendEvents) {
                // this._onPickerChange(paths, values);
            }

            if (this._shouldResetZoom())
                this._resetZoom();

            this._renderPicker();
        });

        var resetZoomTooltip = new Tooltip({
            title: 'Reset Zoom'
        });
        resetZoomTooltip.attach({
            target: this._resetZoomButton
        });

        var resetCurveTooltip = new Tooltip({
            title: 'Reset Curve'
        });
        resetCurveTooltip.attach({
            target: this._resetCurveButton
        });

        var copyTooltip = new Tooltip({
            title: 'Copy'
        });
        copyTooltip.attach({
            target: this._copyButton
        });

        var pasteTooltip = new Tooltip({
            title: 'Paste'
        });
        pasteTooltip.attach({
            target: this._pasteButton
        });

        this._pickerCanvas.element.addEventListener('mousedown', this._onMouseDown.bind(this), { passive: false });
        window.addEventListener('mouseup', this._onMouseUp.bind(this), { passive: false });
        window.addEventListener('mousemove', this._onMouseMove.bind(this), { passive: false });
        this._pickerCanvas.element.addEventListener('wheel', this._onMouseWheel.bind(this), { passive: false });
        this._pickerCanvas.element.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false });

        this._resetCurveButton.on('click', () => {
            this._resetCurve(this.selectedCurve);
        });
        this._resetZoomButton.on('click', () => {
            this._resetZoom();
        });
        args.curves.forEach((curve, i) => {
            var curveToggle = this[`_toggle${i}`];
            curveToggle.on('click', () => {
                var isActive = curveToggle.class.contains(CLASS_CURVE_PICKER_TOGGLE_ACTIVE);
                if (isActive) {
                    curveToggle.class.remove(CLASS_CURVE_PICKER_TOGGLE_ACTIVE);
                } else {
                    curveToggle.class.add(CLASS_CURVE_PICKER_TOGGLE_ACTIVE);
                }
                this._toggleCurve(this.curves[i], !isActive);
            });
        });

        window.curveInput = this;
        window.parent.curveInput = this;
    }

    _renderPicker() {
        this._renderGrid();
        this._renderPickerCurves();
        this._renderHighlightedAnchors();
        this._renderMask();
        this._renderText();

        // if (gradient) {
        //     renderColorGradient();
        // }
    }

    _renderGrid() {
        var i;

        // draw background
        this._pickerCanvasContext.fillStyle = this.colors.bg;
        this._pickerCanvasContext.fillRect(0, 0, this._pickerCanvas.width, this._pickerCanvas.height);

        // draw grid
        for (i = 0; i < 5; i++) {
            var y = this._gridTop() + this._gridHeight() * i / 4;
            this._drawLine([this._gridLeft(), y], [this._gridRight(), y], this.colors.gridLines);
        }

        for (i = 0; i < 11; i++) {
            var x = this._gridLeft() + this._gridWidth() * i / 10;
            this._drawLine([x, this._gridTop()], [x, this._gridBottom()], this.colors.gridLines);
        }
    }

    _gridWidth() {
        return this._pickerCanvas.width - 2 * this.padding - this.axisSpacing;
    }

    _gridHeight() {
        return this._pickerCanvas.height - 2 * this.padding - this.axisSpacing;
    }

    _gridLeft() {
        return this.padding + this.axisSpacing;
    }

    _gridRight() {
        return this._gridLeft() + this._gridWidth();
    }

    _gridTop() {
        return this.padding;
    }

    _gridBottom() {
        return this._gridTop() + this._gridHeight();
    }

    _drawLine(start, end, color) {
        this._pickerCanvasContext.beginPath();
        this._pickerCanvasContext.moveTo(start[0], start[1]);
        this._pickerCanvasContext.lineTo(end[0], end[1]);
        this._pickerCanvasContext.strokeStyle = color;
        this._pickerCanvasContext.stroke();
    }

    // Draws text at the specified coordinates
    _drawText(text, x, y) {
        this._pickerCanvasContext.font = this.textSize + 'px Verdana';
        this._pickerCanvasContext.fillStyle = this.colors.text;
        this._pickerCanvasContext.fillText(text.toString(), x, y);
    }

    _renderText() {
        // draw vertical axis values
        const left = this._gridLeft() - this.textSize * 2;
        this._drawText(+this.verticalTopValue.toFixed(2), left, this._gridTop() + this.textSize * 0.5);
        this._drawText(+((this.verticalTopValue + this.verticalBottomValue) * 0.5).toFixed(2), left, this._gridTop() + (this._gridHeight() + this.textSize) * 0.5);
        this._drawText(+this.verticalBottomValue.toFixed(2), left, this._gridBottom() + this.textSize * 0.5);

        // draw horizontal axis values
        this._drawText('0.0', left + this.textSize * 2, this._gridBottom() + 2 * this.textSize);
        this._drawText('1.0', this._gridRight() - this.textSize * 2, this._gridBottom() + 2 * this.textSize);
    }


    _renderPickerCurves() {
        // holds indices of graphs that were rendered to avoid
        // rendering the same graphs twice
        var renderedCurveIndices = {};

        // draw this.curves in the order in which they were enabled
        for (var i = 0; i < this.enabledCurves.length; i++) {
            var curve = this.enabledCurves[i];
            var index = this.curves.indexOf(curve);

            if (!renderedCurveIndices[index]) {
                renderedCurveIndices[index] = true;

                var otherCurve = this._getOtherCurve(curve);
                this._drawCurvePair(curve, this.betweenCurves ? otherCurve : null);

                this._drawCurveAnchors(curve);

                if (this.betweenCurves && otherCurve) {
                    var otherIndex = this.curves.indexOf(otherCurve);
                    if (!renderedCurveIndices[otherIndex]) {
                        this._drawCurveAnchors(otherCurve);
                        renderedCurveIndices[otherIndex] = true;
                    }
                }
            }
        }
    }

    // If the specified curve is the primary returns the secondary
    // otherwise if the specified curve is the secondary returns the primary
    _getOtherCurve(curve) {
        var ind = this.curves.indexOf(curve);
        if (ind < this.numCurves) {
            return this.curves[this.numCurves + ind];
        }
        return this.curves[ind - this.numCurves];

    }

    // Draws a pair of this.curves with their in-between filling. If the second
    // curve is null then only the first curve will be rendered
    _drawCurvePair(curve1, curve2) {
        var colorIndex = this.swizzle[this.curves.indexOf(curve1) % this.numCurves];

        this._pickerCanvasContext.strokeStyle = this.colors.curves[colorIndex];
        this._pickerCanvasContext.fillStyle = this.colors.curveFilling[colorIndex];
        this._pickerCanvasContext.beginPath();

        var time = 0;
        var value = curve1.value(time);
        var x;
        var coords = this._calculateAnchorCoords([time, value]);
        this._pickerCanvasContext.moveTo(coords[0], coords[1]);

        var precision = 1;
        var width = this._pickerCanvas._pixelWidth;

        for (x = precision; x <= Math.ceil(width / precision); x++) {
            time = x * precision / width;
            value = curve1.value(time);
            coords = this._calculateAnchorCoords([time, value]);
            this._pickerCanvasContext.lineTo(coords[0], coords[1]);
        }

        if (curve2) {
            for (x = Math.ceil(width / precision); x >= 0; x--) {
                time = x * precision / width;
                value = curve2.value(time);
                coords = this._calculateAnchorCoords([time, value]);
                this._pickerCanvasContext.lineTo(coords[0], coords[1]);
            }

            this._pickerCanvasContext.closePath();
            this._pickerCanvasContext.fill();
        }

        this._pickerCanvasContext.stroke();
    }

    // Returns the coordinates of the specified anchor on this grid
    _calculateAnchorCoords(anchor) {
        var time = anchor[0];
        var value = anchor[1];

        var coords = [0, 0];
        coords[0] = this._gridLeft() + time * this._gridWidth();

        var top = this._gridTop();
        coords[1] = top + this._gridHeight() * (value - this.verticalTopValue) / (this.verticalBottomValue - this.verticalTopValue);

        return coords;
    }


    // Draws the anchors for the specified curve
    _drawCurveAnchors(curve) {
        var colorIndex = this.swizzle[this.curves.indexOf(curve) % this.numCurves];
        curve.keys.forEach((anchor) => {
            if (anchor !== this.hoveredAnchor && anchor !== this.selectedAnchor) {
                var color = this.colors.anchors[colorIndex];
                var lineColor = this.colors.curves[colorIndex];
                this._drawAnchor(this._calculateAnchorCoords(anchor), color, lineColor);
            }
        });
    }

    // Draws an anchor point at the specified coordinates
    _drawAnchor(coords, fillColor, lineColor) {
        this._pickerCanvasContext.beginPath();
        this._pickerCanvasContext.arc(coords[0], coords[1], this.anchorRadius, 0, 2 * Math.PI, false);
        this._pickerCanvasContext.fillStyle = fillColor;
        this._pickerCanvasContext.fill();
        var lineWidth = this._pickerCanvasContext.lineWidth;
        this._pickerCanvasContext.lineWidth = 2;
        this._pickerCanvasContext.strokeStyle = lineColor;
        this._pickerCanvasContext.stroke();
        this._pickerCanvasContext.lineWidth = lineWidth;
    }

    // renders a quad in the same color as the bg color
    // to hide the portion of the curves that is outside the grid
    _renderMask() {
        this._pickerCanvasContext.fillStyle = this.colors.bg;

        var offset = this.anchorRadius + 1;

        // top
        this._pickerCanvasContext.fillRect(0, 0, this._pickerCanvasContext.width, this._gridTop() - offset);

        // bottom
        this._pickerCanvasContext.fillRect(0, this._gridBottom() + offset, this._pickerCanvasContext.width, 33 - offset);
    }

    _renderHighlightedAnchors() {
        // draw highlighted anchors on top of the others
        if (this.hoveredAnchor) {
            this._drawAnchor(
                this._calculateAnchorCoords(this.hoveredAnchor),
                this.colors.anchors[this.curves.indexOf(this.hoveredCurve) % this.numCurves],
                this.colors.highlightedLine
            );
        }

        if (this.selectedAnchor && this.selectedAnchor !== this.hoveredAnchor) {
            this._drawAnchor(
                this._calculateAnchorCoords(this.selectedAnchor),
                this.colors.anchors[this.curves.indexOf(this.selectedCurve) % this.numCurves],
                this.colors.highlightedLine
            );
        }
    }

    // Draws color gradient for a set of curves
    _renderColorGradient() {
        // var ctx = gradientCanvas.element.getContext('2d');
        // var t;
        // var rgb = [];
        // var precision = 2;

        // var keys = [];
        // for (var i = 0; i < curves.length; i++) {
        //     var k = curves[i].keys;
        //     var ka = [];
        //     for (var j = 0, len = k.length; j < len; j++ ) {
        //         ka.push(k[j][0], k[j][1]);
        //     }
        //     keys.push(ka);
        // }

        // var curveset = new pc.CurveSet(keys);
        // curveset.type = curveType;

        // ctx.fillStyle = checkerboardPattern;
        // ctx.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);

        // var gradient = ctx.createLinearGradient(0, 0, gradientCanvas.width, gradientCanvas.height);

        // for (t = 0; t <= gradientCanvas.width; t += precision) {

        //     curveset.value(t / gradientCanvas.width, rgb);
        //     var rgba = Math.round((rgb[swizzle[0]] || 0) * 255) + ',' +
        //                Math.round((rgb[swizzle[1]] || 0) * 255) + ',' +
        //                Math.round((rgb[swizzle[2]] || 0) * 255) + ',' +
        //                (isNaN(rgb[swizzle[3]]) ? 1 : rgb[swizzle[3]]);

        //     gradient.addColorStop(t / gradientCanvas.width, 'rgba(' + rgba + ')');
        // }

        // ctx.fillStyle = gradient;
        // ctx.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);
    }

    // zoom in - out based on delta
    _adjustZoom(delta) {
        var maxDelta = 1;
        if (delta > maxDelta) delta = maxDelta;
        else if (delta < -maxDelta) delta = -maxDelta;

        var speed = delta * (this.verticalTopValue - this.verticalBottomValue) / 10;

        var verticalTop = this.verticalTopValue - speed;
        var verticalBottom = this.verticalBottomValue + speed;

        // if we have a hovered or selected anchor then try to focus on
        // that when zooming in
        var focus = this.hoveredAnchor || this.selectedAnchor;
        if (delta > 0 && focus) {
            var value = focus[1];
            var mid = (this.verticalTopValue + this.verticalBottomValue) / 2;
            verticalTop += (value - mid) * delta;
            verticalBottom += (value - mid) * delta;
        } else if (delta > 0 && this.minVertical != null) {
            this.verticalBottom = this.verticalBottomValue;
        }

        // keep limits
        if (this.maxVertical != null && verticalTop > this.maxVertical)
            verticalTop = this.maxVertical;

        if (this.minVertical != null && verticalBottom < this.minVertical)
            verticalBottom = this.minVertical;

        // try not to bring values too close together
        if (+(verticalTop - verticalBottom).toFixed(2) <= 0.01)
            return;

        this.verticalTopValue = verticalTop;
        this.verticalBottomValue = verticalBottom;

        this._renderPicker();
    }

    _resetZoom() {
        var minMax = this._getCurvesMinMax(this.enabledCurves);

        var oldVerticalTop = this.verticalTopValue;
        var oldVerticalBottom = this.verticalBottomValue;

        var maxLimit = Math.ceil(2 * Math.max(Math.abs(minMax[0]), Math.abs(minMax[1])));
        if (maxLimit === 0) {
            maxLimit = this.verticalValue;
        }

        this.verticalTopValue = maxLimit;
        if (this.maxVertical != null) {
            this.verticalTopValue = Math.min(maxLimit, this.maxVertical);
        }

        this.verticalBottomValue = -this.verticalTopValue;
        if (this.minVertical != null) {
            this.verticalBottomValue = Math.max(this.minVertical, this.verticalBottomValue);
        }

        this._renderPicker();

        return oldVerticalTop !== this.verticalTopValue || oldVerticalBottom !== this.verticalBottomValue;
    }

    _scroll(delta) {
        var range = this.verticalTopValue - this.verticalBottomValue;
        var fraction = delta / this._gridHeight();
        var diff = range * fraction;

        if (this.maxVertical != null && this.verticalTopValue + diff > this.maxVertical) {
            diff = this.maxVertical - this.verticalTopValue;
        }

        if (this.minVertical != null && this.verticalBottomValue + diff < this.minVertical) {
            diff = this.minVertical - this.verticalBottomValue;
            if (this.maxVertical != null && this.verticalTopValue + diff > this.maxVertical) {
                diff = this.maxVertical - this.verticalTopValue;
            }
        }

        this.verticalTopValue += diff;
        this.verticalBottomValue += diff;

        this._renderPicker();
    }

    _getCurvesMinMax(curves) {
        var maxValue = -Infinity;
        var minValue = Infinity;

        curves.forEach(function (curve) {
            curve.keys.forEach(function (anchor) {
                var value = anchor[1];
                if (value > maxValue) {
                    maxValue = value;
                }

                if (value < minValue) {
                    minValue = value;
                }
            });
        });

        if (maxValue === -Infinity) {
            maxValue = this.maxVertical != null ? this.maxVertical : this.verticalValue;
        }

        if (minValue === Infinity) {
            minValue = this.minVertical != null ? this.minVertical : -this.verticalValue;
        }

        return [minValue, maxValue];
    }

    _updateFields(anchor) {
        var suspend = this.suspendEvents;
        this.suspendEvents = true;

        this._timeInput.suspendEvents = true;
        this._timeInput.value = anchor ? +anchor[0].toFixed(3) : 0;
        this._timeInput.suspendEvents = suspend;

        this._valueInput.suspendEvents = true;
        this._valueInput.value = anchor ? +anchor[1].toFixed(3) : 0;
        this._valueInput.suspendEvents = suspend;

        this.suspendEvents = suspend;
    }

    _getTargetCoords(e) {
        var rect = this._pickerCanvas.element.getBoundingClientRect();
        var left = Math.floor(rect.left);
        var top = Math.floor(rect.top);

        return [e.clientX - left, e.clientY - top];
    }

    // Returns true if the specidifed coordinates are within the grid bounds
    _areCoordsInGrid(coords) {
        return coords[0] >= this._gridLeft() &&
            coords[0] <= this._gridRight() &&
            coords[1] >= this._gridTop() &&
            coords[1] <= this._gridBottom();
    }

    _areCoordsClose(coords1, coords2, range) {
        return Math.abs(coords1[0] - coords2[0]) <= range &&
            Math.abs(coords1[1] - coords2[1]) <= range;
    }

    // If there are any anchors with the same time, collapses them to one
    _collapseAnchors() {
        var changedCurves = {};

        var paths, values;
        if (!this.suspendEvents) {
            paths = [];
            values = [];
        }

        this.enabledCurves.forEach(function (curve) {
            for (var i = curve.keys.length - 1; i > 0; i--) {
                var key = curve.keys[i];
                var prevKey = curve.keys[i - 1];
                if (key[0].toFixed(3) === prevKey[0].toFixed(3)) {
                    curve.keys.splice(i, 1);

                    changedCurves[i] = true;

                    if (this.selectedAnchor === key) {
                        this._setSelected(this.selectedCurve, prevKey);
                    }

                    if (this.hoveredAnchor === key) {
                        this._setHovered(this.hoveredCurve, prevKey);
                    }
                }
            }
        });


        if (!this.suspendEvents) {
            for (var index in changedCurves) {
                var curve = this.curves[parseInt(index, 10)];
                if (curve) {
                    var val = this._serializeCurveKeys(curve);
                    paths.push(this._getKeysPath(curve));
                    values.push(val.slice(0));

                    // if randomize is false set secondary graph the same as the first
                    if (!this.betweenCurves) {
                        var other = this._getOtherCurve(curve);
                        if (other) {
                            paths.push(this._getKeysPath(other));
                            values.push(val);
                        }
                    }
                }
            }

            if (paths.length) {
                // this._onPickerChange(paths, values);
            }
        }

    }

    // Creates and returns an anchor and fires change event
    _createAnchor(curve, time, value) {
        var anchor = curve.add(time, value);

        if (!this.suspendEvents)
            this._onCurveKeysChanged(curve);

        return anchor;
    }

    // Updates the time / value of an anchor and fires change event
    _updateAnchor(curve, anchor, time, value) {
        anchor[0] = time;
        anchor[1] = value;
        curve.sort();

        // reset selected anchor index because it
        // might have changed after sorting the curve keys
        if (this.selectedCurve === curve && this.selectedAnchor) {
            this.selectedAnchorIndex = curve.keys.indexOf(this.selectedAnchor);
        }

        if (!this.suspendEvents)
            this._onCurveKeysChanged(curve);
    }

    // Deletes an anchor from the curve and fires change event
    _deleteAnchor(curve, anchor) {
        var index = curve.keys.indexOf(anchor);
        if (index >= 0) {
            curve.keys.splice(index, 1);
        }

        // Have at least one key in the curve
        if (curve.keys.length === 0) {
            this._createAnchor(curve, 0, 0);
        } else {
            if (!this.suspendEvents)
                this._onCurveKeysChanged(curve);
        }
    }

    _getKeysPath(curve) {
        var curveIndex = this.curves.indexOf(curve);
        if (this.numCurves > 1) {
            return curveIndex >= this.numCurves ? '1.keys.' + (curveIndex - this.numCurves) : '0.keys.' + curveIndex;
        }
        return curveIndex === 0 ? '0.keys' : '1.keys';

    }

    _serializeCurveKeys(curve) {
        var result = [];
        curve.keys.forEach(function (k) {
            result.push(k[0], k[1]);
        });
        return result;
    }

    _onCurveKeysChanged(curve) {
        var paths = [this._getKeysPath(curve)];
        var values = [this._serializeCurveKeys(curve)];

        // if randomize is false set secondary graph the same as the first
        if (!this.betweenCurves) {
            var other = this._getOtherCurve(curve);
            if (other) {
                paths.push(this._getKeysPath(other));
                values.push(values[0].slice(0));
            }
        }

        // this._onPickerChange(paths, values);
    }

    // Make the specified curve appear in front of the others
    _sendCurveToFront(curve) {
        var index = this.enabledCurves.indexOf(curve);
        if (index >= 0) {
            this.enabledCurves.splice(index, 1);
        }

        this.enabledCurves.push(curve);
    }

    // Sets the hovered graph and anchor
    _setHovered(curve, anchor) {
        this.hoveredCurve = curve;
        this.hoveredAnchor = anchor;

        // Change the mouse cursor to a pointer
        if (curve || anchor) {
            this._pickerCanvas.element.style.cursor = 'pointer';
            this._updateFields(anchor);
        } else {
            this._pickerCanvas.element.style.cursor = '';
            this._updateFields(this.selectedAnchor);
        }
    }

    // Sets the selected anchor and curve
    _setSelected(curve, anchor) {
        this.selectedCurve = curve;
        this.selectedAnchor = anchor;

        this._updateFields(anchor);

        // make the selected curve appear in front of all the others
        if (curve) {
            // set selected curve index
            this.selectedCurveIndex = this.curves.indexOf(curve);

            // set selected anchor index
            this.selectedAnchorIndex = anchor ? curve.keys.indexOf(anchor) : -1;

            // render curve pair in front of the others
            if (this.betweenCurves) {
                var otherCurve = this._getOtherCurve(curve);
                if (otherCurve) {
                    this._sendCurveToFront(otherCurve);
                }
            }


            this._sendCurveToFront(curve);
        } else {
            this.selectedCurveIndex = -1;
            this.selectedAnchorIndex = -1;
        }
    }

    // Return the hovered anchor and graph
    _getHoveredAnchor(coords) {
        var result = {
            graph: null,
            anchor: null
        };

        var hoveredTime = this._calculateAnchorTime(coords);

        // go through all the curves from front to back
        // and check if the mouse cursor is hovering on them
        for (var j = this.enabledCurves.length - 1; j >= 0; j--) {
            var curve = this.enabledCurves[j];

            if (!result.curve) {
                // get the value at the current hovered time
                var value = curve.value(hoveredTime);

                // convert hoveredTime, value to coords
                var curvePointCoords = this._calculateAnchorCoords([hoveredTime, value]);

                if (this._areCoordsClose(coords, curvePointCoords, this.curveHoverRadius)) {
                    result.curve = curve;
                }
            }

            for (var i = 0, imax = curve.keys.length; i < imax; i++) {
                var anchor = curve.keys[i];
                var anchorCoords = this._calculateAnchorCoords(anchor);

                if (this._areCoordsClose(coords, anchorCoords, this.anchorHoverRadius)) {
                    result.anchor = anchor;
                    result.curve = curve;
                    return result;
                }
            }
        }

        return result;
    }

    // Enables / disables a curve
    _toggleCurve(curve, toggle) {
        if (toggle) {
            // when we enable a curve make it the selected one
            this._setSelected(curve, null);
        } else {
            var otherCurve;

            // remove the curve from the enabledCurves array
            var index = this.enabledCurves.indexOf(curve);
            if (index >= 0) {
                this.enabledCurves.splice(index, 1);
            }

            // remove its matching curve too
            if (this.betweenCurves) {
                otherCurve = this._getOtherCurve(curve);
                if (otherCurve) {
                    index = this.enabledCurves.indexOf(otherCurve);
                    if (index >= 0) {
                        this.enabledCurves.splice(index, 1);
                    }
                }
            }


            // if the selected curve was disabled select the next enabled one
            if (this.selectedCurve === curve || this.selectedCurve === otherCurve) {
                this._setSelected(null, null);

                if (this.enabledCurves.length) {
                    this.selectedCurve = this.enabledCurves[this.enabledCurves.length - 1];
                    this.selectedCurveIndex = this.curves.indexOf(this.selectedCurve);

                    // make sure we select the primary curve
                    if (this.betweenCurves && this.selectedCurveIndex >= this.numCurves) {
                        this.selectedCurveIndex -= this.numCurves;
                        this.selectedCurve = this.curves[this.selectedCurveIndex];
                    }
                }
            }

            if (this.hoveredCurve === curve || this.hoveredCurve === otherCurve) {
                this.hoveredCurve = null;
            }
        }

        this._renderPicker();
    }

    // Returns true if it would be a good idea to reset the zoom
    _shouldResetZoom() {
        var minMax = this._getCurvesMinMax(this.enabledCurves);

        // if min value is less than the bottom vertical value...
        if (minMax[0] < this.verticalBottomValue) {
            return true;
        }

        // ... or if max is bigger than the top vertical value...
        if (minMax[1] > this.verticalTopValue) {
            return true;
        }

        // // ... or if min and max are between the [25%, 75%] interval of the editor, return true
        // if (minMax[1] < Math.ceil(pc.math.lerp(verticalBottomValue, verticalTopValue, 0.75)) &&
        //     minMax[0] > Math.ceil(pc.math.lerp(verticalBottomValue, verticalTopValue, 0.25))) {
        //     return true;
        // }

        // don't reset zoom
        return false;
    }

    // Calculate the anchor value based on the specified coordinates
    _calculateAnchorValue(coords) {
        var top = this._gridTop();
        var height = this._gridHeight();

        return math.lerp(this.verticalTopValue, this.verticalBottomValue, (coords[1] - top) / height);
    }

    // Calculate the anchor time based on the specified coordinates
    _calculateAnchorTime(coords) {
        return math.clamp((coords[0] - this._gridLeft()) / this._gridWidth(), 0, 1);
    }

    // Handles mouse down
    _onMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target !== this._pickerCanvas.element) {
            return;
        }

        // TODO
        // toggleTextSelection(false);

        var point = this._getTargetCoords(e);
        var inGrid = this._areCoordsInGrid(point);

        // collapse anchors on mouse down because we might
        // have placed another anchor on top of another by directly
        // editing its time through the input fields
        var suspend = this.suspendEvents;
        this.suspendEvents = true;
        this._collapseAnchors();
        this.suspendEvents = suspend;

        // select or add anchor on left click
        if (e.button === 0) {
            this.dragging = true;
            this.changing = true;
            this.scrolling = false;

            // if we are clicking on an empty area
            if (!this.hoveredAnchor) {

                if (!inGrid) {
                    return;
                }

                var curve = this.hoveredCurve || this.selectedCurve;

                // create a new anchor
                if (curve) {

                    var time = this._calculateAnchorTime(point);
                    var value = this._calculateAnchorValue(point);
                    var anchor = this._createAnchor(curve, time, value);

                    // combine changes from now on until mouse is up
                    // editor.emit('picker:curve:change:start');

                    // select the new anchor and make it hovered
                    this._setSelected(curve, anchor);
                    this._setHovered(curve, anchor);
                }
            } else {
                // if we are hovered over a graph or an anchor then select it
                this._setSelected(this.hoveredCurve, this.hoveredAnchor);
                this._onCurveKeysChanged(this.selectedCurve);
            }
        } else if (e.button === 2) {
            if (!this.dragging) {
                this.scrolling = true;
                this.mouseY = e.y;

                // panel.classList.add('scroll');
            }
        }

        this._renderPicker();
    }

    // Handles mouse move
    _onMouseMove(e) {
        e.preventDefault();
        e.stopPropagation();
        var coords = this._getTargetCoords(e);

        // if we are dragging the selected anchor
        if (this.selectedAnchor && this.dragging) {
            // clamp coords to grid
            coords[0] = math.clamp(coords[0], this._gridLeft(), this._gridRight());
            coords[1] = math.clamp(coords[1], this._gridTop(), this._gridBottom());

            var time = this._calculateAnchorTime(coords);
            var value = this._calculateAnchorValue(coords);

            // if there is another point with the same time
            // then make the two points have the same values
            var keys = this.selectedCurve.keys;
            for (var i = 0, len = keys.length; i < len; i++) {
                if (keys[i] !== this.selectedAnchor && keys[i][0] === time) {
                    value = keys[i][1];
                }
            }

            this._updateAnchor(this.selectedCurve, this.selectedAnchor, time, value);
            this._updateFields(this.selectedAnchor);

            // combine changes from now on
            // editor.emit('picker:curve:change:start');

            this._renderPicker();
        } else {

            if (this.scrolling) {
                this._scroll(e.y - this.mouseY);
                this.mouseY = e.y;
            }

            // mouse is moving without selected anchors so just check for hovered anchors or hovered curves
            var hovered = this._getHoveredAnchor(coords);
            if (hovered.curve !== this.hoveredCurve || hovered.anchor !== this.hoveredAnchor) {
                this._setHovered(hovered.curve, hovered.anchor);
                this._renderPicker();
            }
        }
    }

    // Handles mouse up
    _onMouseUp(e) {
        e.preventDefault();
        e.stopPropagation();
        // this._toggleTextSelection(true);

        if (e.button === 0) {
            if (this.changing) {
                // collapse anchors on mouse up because we might have
                // placed an anchor on top of another one
                this._collapseAnchors();

                this.dragging = false;
                this.changing = false;

                this._renderPicker();
            }

            // editkr.emit('picker:curve:change:end');
        } else if (e.button === 2 && !this.dragging) {
            this.scrolling = false;
            // panel.classList.remove('scroll');

            // delete anchor on right click
            if (this.hoveredAnchor) {
                this._deleteAnchor(this.hoveredCurve, this.hoveredAnchor);

                // clean up selected anchor
                if (this.selectedAnchor === this.hoveredAnchor) {
                    this._setSelected(this.selectedCurve, null);
                }

                // clean up hovered anchor
                this._setHovered(null, null);

                this._renderPicker();
            }
        }
    }


    // Handle mouse wheel
    _onMouseWheel(e) {
        e.preventDefault();
        if (e.deltaY > 0) {
            this._adjustZoom(-0.3);
        } else if (e.deltaY < 0) {
            this._adjustZoom(0.3);
        }
        return false;
    }

    _resetCurve(curve) {
        if (!curve) {
            return;
        }
        var suspend = this.suspendEvents;
        this.suspendEvents = true;

        curve.keys.length = 0;
        this._createAnchor(curve, 0, 0);
        this._timeInput.suspendEvents = true;
        this._timeInput.value = 0;
        this._timeInput.suspendEvents = suspend;
        this._valueInput.suspendEvents = true;
        this._valueInput.value = 0;
        this._valueInput.suspendEvents = suspend;
        this._setSelected(curve, null);

        var paths = [this._getKeysPath(curve)];
        var values = [this._serializeCurveKeys(curve)];

        // reset secondary curve too
        var otherCurve = this._getOtherCurve(curve);
        if (otherCurve) {
            otherCurve.keys.length = 0;
            this._createAnchor(otherCurve, 0, 0);

            paths.push(this._getKeysPath(otherCurve));
            values.push(this._serializeCurveKeys(otherCurve));
        }

        this.suspendEvents = suspend;
        this._renderPicker();

        // if (! this.suspendEvents)
            // this._onPickerChange(paths, values);
    }


    // END OF PICKER METHODS

    _createResizeInterval() {
        this._resizeInterval = setInterval(() => {
            this._canvas.resize(this.width, this.height);
        }, 1000 / 20);
    }

    _clearResizeInterval() {
        if (this._resizeInterval) {
            clearInterval(this._resizeInterval);
            this._resizeInterval = null;
        }
    }

    _onKeyDown(evt) {
        // escape blurs the field
        if (evt.keyCode === 27) {
            this.blur();
        }

        // enter opens the gradient picker
        if (evt.keyCode !== 13 || !this.enabled || this.readOnly || this.class.contains(pcuiClass.MULTIPLE_VALUES)) {
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();

        this._openCurvePicker();
    }

    _onFocus(evt) {
        this.emit('focus');
    }

    _onBlur(evt) {
        this.emit('blur');
    }

    _getDefaultValue() {
        return [{
            type: 4,
            keys: [0, 0],
            betweenCurves: false
        }];
    }

    _openCurvePicker() {
        // TODO: don't use global functions
        // editor.call('picker:curve', utils.deepCopy(this.value), this._pickerArgs);

        // position picker
        // const rectPicker = editor.call('picker:curve:rect');
        // const rectField = this.dom.getBoundingClientRect();
        // editor.call('picker:curve:position', rectField.right - rectPicker.width, rectField.bottom);

        // let evtChangeStart = editor.on('picker:curve:change:start', () => {
        //     if (this._pickerChanging) return;
        //     this._pickerChanging = true;

        //     if (this._binding) {
        //         this._combineHistory = this._binding.historyCombine;
        //         this._historyPostfix = this._binding.historyPostfix;

        //         this._binding.historyCombine = true;
        //         // assign a history postfix which will limit how far back
        //         // the history will be combined. We only want to combine
        //         // history between this curve:change:start and curve:change:end events
        //         // not further back
        //         this._binding.historyPostfix = `(${Date.now()})`;
        //     }
        // });

        // let evtChangeEnd = editor.on('picker:curve:change:end', () => {
        //     if (!this._pickerChanging) return;
        //     this._pickerChanging = false;

        //     if (this._binding) {
        //         this._binding.historyCombine = this._combineHistory;
        //         this._binding.historyPostfix = this._historyPostfix;

        //         this._combineHistory = false;
        //         this._historyPostfix = null;
        //     }
        // });

        // let evtPickerChanged = editor.on('picker:curve:change', this._onPickerChange.bind(this));

        // let evtRefreshPicker = this.on('change', value => {
        //     const args = Object.assign({
        //         keepZoom: true
        //     }, this._pickerArgs);

        //     editor.call('picker:curve:set', value, args);
        // });

        // editor.once('picker:curve:close', function () {
        //     evtRefreshPicker.unbind();
        //     evtRefreshPicker = null;
        //     evtPickerChanged.unbind();
        //     evtPickerChanged = null;
        //     evtChangeStart.unbind();
        //     evtChangeStart = null;
        //     evtChangeEnd.unbind();
        //     evtChangeEnd = null;
        // });
    }

    _onPickerChange(paths, values) {
        if (!this.value) return;

        // maybe we should deepCopy the value instead but not doing
        // it now for performance
        const value = utils.deepCopy(this.value);

        // patch our value with the values coming from the picker
        // which will trigger a change to the binding if one exists
        for (let i = 0; i < paths.length; i++) {
            const parts = paths[i].split('.');
            const curve = value[parseInt(parts[0], 10)];
            if (!curve) continue;

            if (parts.length === 3) {
                curve[parts[1]][parseInt(parts[2], 10)] = values[i];
            } else {
                curve[parts[1]] = values[i];
            }
        }

        this.value = value;
    }

    _getMinMaxValues(value) {
        let minValue = Infinity;
        let maxValue = -Infinity;

        if (value) {
            if (!Array.isArray(value)) {
                value = [value];
            }

            value.forEach((value) => {
                if (!value || !value.keys || !value.keys.length) return;

                if (Array.isArray(value.keys[0])) {
                    value.keys.forEach((data) => {
                        for (let i = 1; i < data.length; i += 2) {
                            if (data[i] > maxValue) {
                                maxValue = data[i];
                            }

                            if (data[i] < minValue) {
                                minValue = data[i];
                            }
                        }
                    });
                } else {
                    for (let i = 1; i < value.keys.length; i += 2) {
                        if (value.keys[i] > maxValue) {
                            maxValue = value.keys[i];
                        }

                        if (value.keys[i] < minValue) {
                            minValue = value.keys[i];
                        }
                    }
                }
            });
        }

        if (minValue === Infinity) {
            minValue = this._min;
        }

        if (maxValue === -Infinity) {
            maxValue = this._max;
        }

        // try to limit minValue and maxValue
        // between the min / max values for the curve field
        if (minValue > this._min) {
            minValue = this._min;
        }

        if (maxValue < this._max) {
            maxValue = this._max;
        }

        return [minValue, maxValue];
    }

    // clamp val between min and max only if it's less / above them but close to them
    // this is mostly to allow splines to go over the limit but if they are too close to
    // the edge then they will avoid rendering half-height lines
    _clampEdge(val, min, max) {
        if (val < min && val > min - 2) return min;
        if (val > max && val < max + 2) return max;
        return val;
    }

    _convertValueToCurves(value) {
        if (!value || !value.keys || !value.keys.length) return null;

        if (value.keys[0].length !== undefined) {
            return value.keys.map((data) => {
                const curve = new Curve(data);
                curve.type = value.type;
                return curve;
            });
        }

        const curve = new Curve(value.keys);
        curve.type = value.type;
        return [curve];
    }

    _renderCurves() {
        const canvas = this._canvas.dom;
        const context = canvas.getContext('2d');
        const value = this.value;

        const width = this._canvas.width;
        const height = this._canvas.height;
        const ratio = this._canvas.pixelRatio;

        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        // draw background
        context.clearRect(0, 0, width, height);

        const curveColors = ['rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(133, 133, 252)', 'rgb(255, 255, 255)'];
        const fillColors = ['rgba(255, 0, 0, 0.5)', 'rgba(0, 255, 0, 0.5)', 'rgba(133, 133, 252, 0.5)', 'rgba(255, 255, 255, 0.5)'];

        const minMax = this._getMinMaxValues(value);

        if (!value || !value[0]) return;

        // draw curves
        const primaryCurves = value.slice(0, this.numCurves).map((curve) => this._convertValueToCurves(curve)).flat();

        if (!primaryCurves) return;

        const secondaryCurves = value.slice(this.numCurves, this.numCurves * 2).map((curve) => this._convertValueToCurves(curve)).flat();

        const minValue = minMax[0];
        const maxValue = minMax[1];

        context.lineWidth = this._lineWidth;

        // prevent divide by 0
        if (width === 0) return;

        for (let i = 0; i < primaryCurves.length; i++) {
            context.strokeStyle = curveColors[i];
            context.fillStyle = fillColors[i];

            context.beginPath();
            context.moveTo(0, this._clampEdge(height * (1 - (primaryCurves[i].value(0) - minValue) / (maxValue - minValue)), 1, height - 1));

            const precision = 1;

            for (let x = 0; x < Math.floor(width / precision); x++) {
                const val = primaryCurves[i].value(x * precision / width);
                context.lineTo(x * precision, this._clampEdge(height * (1 - (val - minValue) / (maxValue - minValue)), 1, height - 1));
            }

            if (secondaryCurves) {
                for (let x = Math.floor(width / precision); x >= 0; x--) {
                    const val = secondaryCurves[i].value(x * precision / width);
                    context.lineTo(x * precision, this._clampEdge(height * (1 - (val - minValue) / (maxValue - minValue)), 1, height - 1));
                }

                context.closePath();
                context.fill();
            }

            context.stroke();
        }
    }

    focus() {
        this.dom.focus();
    }

    blur() {
        this.dom.blur();
    }

    destroy() {
        if (this._destroyed) return;
        this.dom.removeEventListener('keydown', this._domEventKeyDown);
        this.dom.removeEventListener('focus', this._domEventFocus);
        this.dom.removeEventListener('blur', this._domEventBlur);

        this._clearResizeInterval();

        super.destroy();
    }


    get value() {
        return this._value;
    }

    set value(value) {
        // TODO: maybe we should check for equality
        // but since this value will almost always be set using
        // the picker it's not worth the effort
        this._value = Array.isArray(value) ? utils.deepCopy(value) : [utils.deepCopy(value)];

        this.class.remove(pcuiClass.MULTIPLE_VALUES);

        this.emit('change', value);

        if (this._binding) {
            this._binding.setValues(this._value);
        }

        this.betweenCurves = value.betweenCurves || false;
        this.numCurves = value.length / 2;

        this.curves.length = 0;
        value.forEach((data) => {
            if (this.numCurves === 1) {
                var c = new Curve(data.keys);
                c.type = this.curveType;
                this.curves.push(c);
            } else {
                data.keys.forEach((keys) => {
                    var c = new Curve(keys);
                    c.type = this.curveType;
                    this.curves.push(c);
                });
            }
        });

        this.enabledCurves.length = 0;
        for (var i = 0; i < this.numCurves; i++) {
            // if (this.curveToggles[i].class.contains('active')) {
            this.enabledCurves.push(this.curves[i]);
            if (this.betweenCurves) {
                this.enabledCurves.push(this.curves[i + this.numCurves]);
            }
            // }
        }

        this._renderCurves();
    }

    /* eslint accessor-pairs: 0 */
    set values(values) {
        // we do not support multiple values so just
        // add the multiple values class which essentially disables
        // the input
        this.class.add(pcuiClass.MULTIPLE_VALUES);
        this._renderCurves();
    }
}

export default CurveInput;
