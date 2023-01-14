import Element, { ElementArgs } from '../Element';

const CLASS_ROOT = 'pcui-spinner';

function createSmallThick(size: any, dom: any) {
    const spinner = dom || document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    spinner.classList.add('spin');
    spinner.setAttribute('width', size);
    spinner.setAttribute('height', size);
    spinner.setAttribute('viewBox', '0 0 14 14');
    spinner.setAttribute('fill', 'none');
    spinner.innerHTML = '<path d="M7 14C3.13871 14 0 10.8613 0 7C0 3.13871 3.13871 0 7 0C10.8613 0 14 3.13871 14 7C14 10.8613 10.8613 14 7 14ZM7 2.25806C4.38064 2.25806 2.25806 4.38064 2.25806 7C2.25806 9.61935 4.38064 11.7419 7 11.7419C9.61935 11.7419 11.7419 9.61935 11.7419 7C11.7419 4.38064 9.61935 2.25806 7 2.25806Z" fill="#773417"/><path class="pcui-spinner-highlight" d="M7 14V11.7419C9.61935 11.7419 11.7419 9.61935 11.7419 7H14C14 10.8613 10.8613 14 7 14Z" fill="#FF6600"/>';
    return spinner;
}

/**
 * The arguments for the {@link Spinner} constructor.
 */
export interface SpinnerArgs extends ElementArgs {
    /**
     * Sets the pixel size of the spinner. Defaults to 12.
     */
    size?: string | number,
    /**
     * Can be 'small-thick'. Defaults to 'small-thick'.
     */
    type?: 'small-thick'
}

/**
 * Represents a spinning icon.
 */
class Spinner extends Element {
    static TYPE_SMALL_THICK = 'small-thick';

    /**
     * Sets the pixel size of the spinner
     *
     * @param args - The arguments.
     */
    constructor(args: SpinnerArgs = {}) {
        if ((args.type ?? 'small-thick') === Spinner.TYPE_SMALL_THICK) {
            args.dom = createSmallThick(args.size ?? 12, args.dom);
        }

        super(args);

        this.class.add(CLASS_ROOT);
    }
}

export default Spinner;
