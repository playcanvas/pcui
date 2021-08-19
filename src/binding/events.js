/**
 * @callback HandleEvent
 * @description Callback used by {@link Events} and {@link EventHandle} functions. Note the callback is limited to 8 arguments.
 * @param {*} [arg1] - First argument that is passed from caller.
 * @param {*} [arg2] - Second argument that is passed from caller.
 * @param {*} [arg3] - Third argument that is passed from caller.
 * @param {*} [arg4] - Fourth argument that is passed from caller.
 * @param {*} [arg5] - Fifth argument that is passed from caller.
 * @param {*} [arg6] - Sixth argument that is passed from caller.
 * @param {*} [arg7] - Seventh argument that is passed from caller.
 * @param {*} [arg8] - Eighth argument that is passed from caller.
 */

/**
 * @class
 * @name Events
 */
function Events() {
    // _world
    Object.defineProperty(
        this,
        '_events', {
            enumerable: false,
            configurable: false,
            writable: true,
            value: { }
        }
    );

    this._suspendEvents = false;

    this._additionalEmitters = [];

    Object.defineProperty(this, 'suspendEvents', {
        get: function () {
            return this._suspendEvents;
        },
        set: function (value) {
            this._suspendEvents = !!value;
        }
    });
}

/**
 * @name Events#on
 * @param {string} name - Name
 * @param {HandleEvent} fn - Callback function
 * @returns {EventHandle} EventHandle
 */
Events.prototype.on = function (name, fn) {
    var events = this._events[name];
    if (events === undefined) {
        this._events[name] = [fn];
    } else {
        if (events.indexOf(fn) === -1)
            events.push(fn);
    }
    return new EventHandle(this, name, fn);
};

/**
 * @name Events#once
 * @param {string} name - Name
 * @param {HandleEvent} fn - Callback function
 * @returns {EventHandle} EventHandle
 */
Events.prototype.once = function (name, fn) {
    var self = this;
    var evt = this.on(name, function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        fn.call(self, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
        evt.unbind();
    });
    return evt;
};

/**
 * @name Events#emit
 * @param {string} name - Name
 * @param {any} arg0 - First argument
 * @param {any} arg1 - Second argument
 * @param {any} arg2 - Third argument
 * @param {any} arg3 - Fourth argument
 * @param {any} arg4 - Fifth argument
 * @param {any} arg5 - Sixth argument
 * @param {any} arg6 - Seventh argument
 * @param {any} arg7 - Eights argument
 * @returns {Events} Self for chaining.
 */
Events.prototype.emit = function (name, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    if (this._suspendEvents) return;

    var events = this._events[name];
    if (events && events.length) {
        events = events.slice(0);

        for (var i = 0; i < events.length; i++) {
            if (! events[i])
                continue;

            try {
                events[i].call(this, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
            } catch (ex) {
                console.info('%c%s %c(event error)', 'color: #06f', name, 'color: #f00');
                console.log(ex.stack);
            }
        }
    }

    if (this._additionalEmitters.length) {
        const emitters = this._additionalEmitters.slice();
        emitters.forEach((emitter) => {
            emitter.emit(name, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
        });
    }

    return this;
};

/**
 * @name Events#unbind
 * @param {string} name - Name
 * @param {HandleEvent} fn - Callback function
 * @returns {Events} - This
 */
Events.prototype.unbind = function (name, fn) {
    if (name) {
        var events = this._events[name];
        if (! events)
            return this;

        if (fn) {
            var i = events.indexOf(fn);
            if (i !== -1) {
                if (events.length === 1) {
                    delete this._events[name];
                } else {
                    events.splice(i, 1);
                }
            }
        } else {
            delete this._events[name];
        }
    } else {
        this._events = { };
    }

    return this;
};

/**
 * Adds another emitter. Any events fired by this instance
 * will also be fired on the additional emitter.
 *
 * @param {Events} emitter - The emitter
 */
Events.prototype.addEmitter = function (emitter) {
    if (!this._additionalEmitters.includes(emitter)) {
        this._additionalEmitters.push(emitter);
    }
};

/**
 * Removes emitter.
 *
 * @param {Events} emitter - The emitter
 */
Events.prototype.removeEmitter = function (emitter) {
    const idx = this._additionalEmitters.indexOf(emitter);
    if (idx !== -1) {
        this._additionalEmitters.splice(idx, 1);
    }
};

/**
 * @class
 * @name EventHandle
 * @param {Events} owner - Owner
 * @param {string} name - Name
 * @param {HandleEvent} fn - Callback function
 */
function EventHandle(owner, name, fn) {
    this.owner = owner;
    this.name = name;
    this.fn = fn;
}

/**
 * @name EventHandle#unbind
 */
EventHandle.prototype.unbind = function () {
    if (! this.owner)
        return;

    this.owner.unbind(this.name, this.fn);

    this.owner = null;
    this.name = null;
    this.fn = null;
};

/**
 * @name EventHandle#call
 */
EventHandle.prototype.call = function () {
    if (! this.fn)
        return;

    this.fn.call(this.owner, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]);
};

/**
 * @name EventHandle#on
 * @param {string} name - Name
 * @param {HandleEvent} fn - Callback function
 * @returns {EventHandle} - EventHandle
 */
EventHandle.prototype.on = function (name, fn) {
    return this.owner.on(name, fn);
};

export default Events;
