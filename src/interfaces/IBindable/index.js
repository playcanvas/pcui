/**
 * @name IBindable
 * @classdesc Provides an interface for getting / setting a value for the Element.
 * @property {Any} value Gets / sets the value of the Element.
 * @property {Any[]} values Sets multiple values to the Element. It is up to the Element to determine how to display them.
 */
class IBindable {
}

/**
 * @event
 * @name IBindable#change
 * @description Fired when the value of the Element changes
 * @param {Object} value The new value
 */

export { IBindable };
export default IBindable;
