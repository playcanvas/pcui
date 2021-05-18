/**
 * @name IResizable
 * @class
 * @classdesc Provides an interface for enabling resizing support for an Element
 * @property {number} resizeMin - Gets / sets the minimum size the Element can take when resized in pixels.
 * @property {number} resizeMax - Gets / sets the maximum size the Element can take when resized in pixels.
 * @property {string} resizable - Gets / sets whether the Element is resizable and where the resize handle is located. Can
 * be one of 'top', 'bottom', 'right', 'left'. Set to null to disable resizing.
 */
class IResizable { }

/**
 * @event
 * @name IResizable#resize
 * @description Fired when the Element gets resized.
 */


export default IResizable;
