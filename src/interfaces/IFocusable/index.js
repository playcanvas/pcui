/**
 * @name IFocusable
 * @classdesc Provides an interface for focusing / unfocusing an Element.
 */
class IFocusable {
    /**
     * Focus on the element
     */
    focus() {
        throw new Error('Not implemented');
    }

    /**
     * Unfocus the element
     */
    blur() {
        throw new Error('Not implemented');
    }
}

/**
 * @event
 * @name IFocusable#focus
 * @description Fired when the element is focused
 */

/**
 * @event
 * @name IFocusable#blur
 * @description Fired when the element is blurred (unfocused)
 */

export default IFocusable;
