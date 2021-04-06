/**
 * @name IBindable
 * @class
 * @classdesc Provides an interface for getting / setting a value for the Element.
 * @property {*} value - Gets / sets the value of the Element.
 * @property {Array<*>} values - Sets multiple values to the Element. It is up to the Element to determine how to display them.
 */
class IBindable {
}

/**
 * @event
 * @name IBindable#change
 * @description Fired when the value of the Element changes
 * @param {*} value - The new value
 */

export default IBindable;
