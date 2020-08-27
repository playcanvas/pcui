// Object.assign(pcui, (function () {
//     'use strict';

    import Tooltip from './element-tooltip';

    const CLASS_ROOT = 'pcui-tooltip-group';

    /**
     * @name pcui.TooltipGroup
     * @classdesc A tooltip group contains other tooltips (or tooltip groups). By default
     * the tooltip group aligns each child tooltip horizontally.
     * @extends pcui.Tooltip
     */
    class TooltipGroup extends Tooltip {
        /**
         * Creates new TooltipGroup.
         * @param {Object} args The arguments.
         */
        constructor(args) {
            args = Object.assign({}, args);

            delete args.title;
            delete args.subTitle;
            delete args.description;

            super(args);

            this.class.add(CLASS_ROOT);
        }
    }

    export default TooltipGroup;

//     return {
//         TooltipGroup: TooltipGroup
//     };
// })());
