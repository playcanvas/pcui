

// utils.deepCopy
export function deepCopy(data: any) {
    if (data == null || typeof (data) !== 'object')
        return data;

    if (data instanceof Array) {
        var arr: any[] = [];
        for (var i = 0; i < data.length; i++) {
            arr[i] = deepCopy(data[i]);
        }
        return arr;
    }

    var obj: any = { };
    for (var key in data) {
        if (data.hasOwnProperty(key))
            obj[key] = deepCopy(data[key]);
    }
    return obj;

};

export function isMobile () {
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
export function classImplements(targetClass: any, sourceClass: any) {
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
export function proxy(targetClass: any, memberName: string, properties: Array<string>) {
    properties.forEach((property) => {
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
if (!String.prototype.startsWith) {
    // eslint-disable-next-line
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (str: string) {
            var that = this;
            var ceil = str.length;
            for (var i = 0; i < ceil; i++)
                if (that[i] !== str[i]) return false;
            return true;
        }
    });
}

// String.endsWith polyfill
if (!String.prototype.endsWith) {
    // eslint-disable-next-line
    Object.defineProperty(String.prototype, 'endsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (str: string) {
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
// @ts-ignore Example: url.appendQuery('t=123').appendQuery('q=345');
if (!String.prototype.appendQuery) {
    // eslint-disable-next-line
    Object.defineProperty(String.prototype, 'appendQuery', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (queryParameter: string) {
            var separator = this.indexOf('?') !== -1 ? '&' : '?';
            return this + separator + queryParameter;
        }
    });
}

export function arrayEquals(lhs: Array<any>, rhs: Array<any>) {
    if (!lhs)
        return false;

    if (!rhs)
        return false;

    if (lhs.length !== rhs.length)
        return false;

    for (var i = 0, l = lhs.length; i < l; i++) {
        if (this[i] instanceof Array && rhs[i] instanceof Array) {
            if (!this[i].equals(rhs[i]))
                return false;
        } else if (this[i] !== rhs[i]) {
            return false;
        }
    }
    return true;
};

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

export const bytesToHuman = function (bytes: number) {
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
export const swapExtension = function (path: string, oldExtension: string, newExtension: string) {
    while (path.indexOf(oldExtension) >= 0) {
        path = path.replace(oldExtension, newExtension);
    }
    return path;
};
