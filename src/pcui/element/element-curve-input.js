import Container from './element-container';
import Label from './element-label';
import Button from './element-button';
import NumericInput from './element-numeric-input';
import SelectInput from './element-select-input';
import BooleanInput from './element-boolean-input';
import Canvas from './element-canvas';
import utils from 'helpers/utils';
import { Curve } from '../../engine/math/curve';

const CLASS_CURVE = 'pcui-curve';
const CLASS_CURVE_PICKER = CLASS_CURVE + '-picker';
const CLASS_CURVE_PICKER_HEADER = CLASS_CURVE + '-picker-header';
const CLASS_CURVE_PICKER_TOGGLES = CLASS_CURVE + '-picker-toggles';
const CLASS_CURVE_PICKER_CANVAS = CLASS_CURVE + '-picker-canvas';
const CLASS_CURVE_PICKER_FOOTER = CLASS_CURVE + '-picker-footer';

const curvePickerDom = (parent) => [
    {
        root: {
            picker: new Container({
                class: CLASS_CURVE_PICKER
            })
        },
        children: [
            {
                root: {
                    header: new Container({
                        class: CLASS_CURVE_PICKER_HEADER
                    })
                },
                children: [
                    {
                        typeLabel: new Label({
                            text: 'Type'
                        })
                    },
                    {
                        typeSelect: new SelectInput({
                            type: 'number',
                            options: [
                                {
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
                                }
                            ]
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
                        children: parent.curveToggles.map(toggle => ({
                            [`toggle-${toggle}`]: new Button({
                                text: toggle
                            })
                        }))
                    }
                ]
            },
            {
                pickerCanvas: new Canvas({
                    class: CLASS_CURVE_PICKER_CANVAS,
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
                children: [
                    {
                        timeInput: new NumericInput({
                            precision: 0,
                            placeholder: 'Time'
                        })
                    },
                    {
                        valueInput: new NumericInput({
                            precision: 2,
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
                    }
                ]
            }
        ]
    }
];

/**
 * @name CurveInput
 * @classdesc Shows a curve or curveset
 * @property {boolean} renderChanges If true the input will flash when changed.
 * @augments Element
 */
class CurveInput extends Container {
    /**
     * Creates a new pcui.CurveInput.
     *
     * @param {object} args - The arguments.
     * @param {number} [args.lineWidth] - The width of the rendered lines in pixels.
     * @param {number} [args.min] - The minimum value that curves can take.
     * @param {number} [args.max] - The maximum value that curves can take.
     * @param {number} [args.verticalValue] - The default maximum and minimum values to show if min and max are undefined.
     * @param {boolean} [args.hideRandomize] - Whether to hide the randomize button in the curve picker.
     */
    constructor(args) {
        args = Object.assign({
            tabIndex: 0
        }, args);

        super(args);

        this.class.add(CLASS_CURVE);

        this._canvas = new Canvas({ useDevicePixelRatio: false });
        this._canvas.width = 470;
        this._canvas.height = 44;
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

        this.curveToggles = ['R', 'G', 'B'];

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

        this.curves = []; // holds all the curves
        this.enabledCurves = []; // holds the rendered order of the curves
        this.numCurves = 1; // number of pairs of curves
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

        this.value = [
            {
                type: 1,
                keys: [0, -3.5, 0.30930232558139537, 0.5, 0.5348837209302325, 0.25],
                betweenCurves: false
            },
            {
                type: 1,
                keys: [0, 0.5, 0.17209302325581396, 1.0653651302172626, 0.6325581395348837, 2.6497542982326787],
                betweenCurves: true
            }
        ];

        this._renderPicker();

        this._typeSelect.on('change', (value) => {
            this.curveType = Number(value);
            this.curves.forEach((curve) => {
                curve.type = value;
            });
            this._renderPicker();
        });

        this._randomizeToggle.on('change', (value) => {
            var i;

            this.betweenCurves = value;


            // let paths, values;

            // if (! this.suspendEvents) {
            //     paths = ['0.betweenCurves'];
            //     values = [this.betweenCurves];
            // }

            if (!this.betweenCurves) {
                for (i = 0; i < this.numCurves; i++) {
                    if (! this.curves[i + this.numCurves]) continue;

                    // disable the secondary graph
                    // this._toggleCurve(this.curves[i + this.numCurves], false);

                    // make keys of secondary graph to be the same
                    // as the primary graph
                    if (! this.suspendEvents) {
                        // paths.push(this._getKeysPath(this.curves[i + this.numCurves]));
                        // values.push(this._serializeCurveKeys(this.curves[i]));
                    }
                }
            } else {
                // enable the secondary graphs if their respective primary graphs are enabled
                for (i = 0; i < this.numCurves; i++) {
                    if (! this.curves[i + this.numCurves]) continue;

                    // we might have a different value for the secondary graphs
                    // when we re-enable betweenCurves so fire change event
                    // to make sure the different values are saved
                    if (! this.suspendEvents) {
                        // paths.push(this._getKeysPath(this.curves[i + this.numCurves]));
                        // values.push(this._serializeCurveKeys(this.curves[i + this.numCurves]));
                    }

                    var isEnabled = this.enabledCurves.indexOf(this.curves[i]) >= 0;
                    // this._toggleCurve(this.curves[i + this.numCurves], false);
                    if (isEnabled) {
                        // this._toggleCurve(this.curves[i + this.numCurves], true);
                    }
                }
            }
            this._renderPicker();
        });

    }

    _renderPicker() {
        this._renderGrid();
        this._renderPickerCurves();
        this._renderText();
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
        return this._pickerCanvas._pixelWidth - 2 * this.padding - this.axisSpacing;
    }

    _gridHeight() {
        return this._pickerCanvas._pixelHeight - 2 * this.padding - this.axisSpacing;
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

            value.forEach(value => {
                if (!value || !value.keys || !value.keys.length) return;

                if (Array.isArray(value.keys[0])) {
                    value.keys.forEach(data => {
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
            return value.keys.map(data => {
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
        const primaryCurves = this._convertValueToCurves(value[0]);

        if (!primaryCurves) return;

        const secondaryCurves = value[0].betweenCurves && value.length > 1 ? this._convertValueToCurves(value[1]) : null;

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

        this.curves.length = 0;
        value.forEach((data) => {
            var c = new Curve(data.keys);
            c.type = this.curveType;
            this.curves.push(c);
        });

        this.enabledCurves.length = 0;
        for (var i = 0; i < this.numCurves; i++)  {
            this.enabledCurves.push(this.curves[i]);
            if (this.betweenCurves) {
                this.enabledCurves.push(this.curves[i + this.numCurves]);
            }
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
