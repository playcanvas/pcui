import Container from './element-container';

const CLASS_CELL = 'pcui-table-cell';

/**
 * @name TableCell
 * @augments Container
 * @class
 * @classdesc Represents a table cell inside a pcui.TableRow
 */
class TableCell extends Container {
    /**
     * Creates a new TableCell.
     *
     * @param {object} [args] - The arguments
     * @param {boolean} [args.header] - If true then this cell belongs to a header row so it will use the <th> element.
     */
    constructor(args) {
        let dom;
        if (args && args.header) {
            dom = document.createElement('th');
            dom.setAttribute('scope', 'col');
        } else {
            dom = document.createElement('td');
        }

        args = Object.assign({
            dom: dom
        }, args);

        super(args);

        this.class.add(CLASS_CELL);
    }
}

export default TableCell;
