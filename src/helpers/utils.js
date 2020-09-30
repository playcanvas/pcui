var utils = { };


// utils.deepCopy
utils.deepCopy = function deepCopy(data) {
    if (data == null || typeof(data) !== 'object')
        return data;

    if (data instanceof Array) {
        var arr = [];
        for (var i = 0; i < data.length; i++) {
            arr[i] = deepCopy(data[i]);
        }
        return arr;
    }

    var obj = { };
    for (var key in data) {
        if (data.hasOwnProperty(key))
            obj[key] = deepCopy(data[key]);
    }
    return obj;

};

utils.isMobile = function () {
    return /Android/i.test(navigator.userAgent) ||
      /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

/**
 * @name utils.implements
 * @description Adds properties and methods from the sourceClass
 * to the targetClass but only if properties with the same name do not
 * already exist in the targetClass.
 * @param {object} targetClass - The target class.
 * @param {object} sourceClass - The source class.
 * @example utils.implements(pcui.Container, pcui.IContainer);
 */
utils.implements = function (targetClass, sourceClass) {
    var properties = Object.getOwnPropertyDescriptors(sourceClass.prototype);
    for (var key in properties) {
        if (targetClass.prototype.hasOwnProperty(key)) {
            delete properties[key];
        }
    }

    Object.defineProperties(targetClass.prototype, properties);
};

/**
 * @name utils.proxy
 * @description Creates new properties on the target class that get / set
 * the properties of the member.
 * @param {object} targetClass - The target class
 * @param {string} memberName - The name of the member of the target class that properties will be proxied to.
 * @param {string[]} properties - A list of properties to be proxied.
 * @example
 * utils.proxy(pcui.SliderInput, '_numericInput', ['max', 'min', 'placeholder']);
 */
utils.proxy = function (targetClass, memberName, properties) {
    properties.forEach(property => {
        Object.defineProperty(targetClass.prototype, property, {
            get: function () {
                return this[memberName][property];
            },
            set: function (value) {
                this[memberName][property] = value;
            }
        });
    });
};

// String.startsWith
if (! String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (str) {
            var that = this;
            var ceil = str.length;
            for (var i = 0; i < ceil; i++)
                if (that[i] !== str[i]) return false;
            return true;
        }
    });
}

// String.endsWith polyfill
if (! String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (str) {
            var that = this;
            for (var i = 0, ceil = str.length; i < ceil; i++)
                if (that[i + that.length - ceil] !== str[i])
                    return false;
            return true;
        }
    });
}

// Appends query parameter to string (supposedly the string is a URL)
// automatically figuring out if the separator should be ? or &.
// Example: url.appendQuery('t=123').appendQuery('q=345');
if (! String.prototype.appendQuery) {
    Object.defineProperty(String.prototype, 'appendQuery', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (queryParameter) {
            var separator = this.indexOf('?') !== -1 ? '&' : '?';
            return this + separator + queryParameter;
        }
    });
}

// element.classList.add polyfill
(function () {
    var dummy  = document.createElement('div'),
        dtp    = DOMTokenList.prototype,
        add    = dtp.add,
        rem    = dtp.remove;

    dummy.classList.add('class1', 'class2');

    // Older versions of the HTMLElement.classList spec didn't allow multiple
    // arguments, easy to test for
    if (!dummy.classList.contains('class2')) {
        dtp.add    = function () {
            Array.prototype.forEach.call(arguments, add.bind(this));
        };
        dtp.remove = function () {
            Array.prototype.forEach.call(arguments, rem.bind(this));
        };
    }
})();

export const bytesToHuman = function (bytes) {
    if (isNaN(bytes) || bytes === 0) return '0 B';
    var k = 1000;
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
};


// todo move this into proper library

// replace the oldExtension in a path with the newExtension
// return the new path
// oldExtension and newExtension should have leading period
export const swapExtension = function (path, oldExtension, newExtension) {
    while (path.indexOf(oldExtension) >= 0) {
        path = path.replace(oldExtension, newExtension);
    }
    return path;
};

export default utils;
