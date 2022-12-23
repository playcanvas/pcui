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
}

/**
 * Creates new properties on the target class that get / set the properties of the member.
 *
 * @param targetClass - The target class.
 * @param memberName - The name of the member of the target class that properties will be proxied to.
 * @param properties - A list of properties to be proxied.
 * @example
 * proxy(pcui.SliderInput, '_numericInput', ['max', 'min', 'placeholder']);
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
}

export function arrayEquals(lhs: Array<any>, rhs: Array<any>) {
    if (!lhs)
        return false;

    if (!rhs)
        return false;

    if (lhs.length !== rhs.length)
        return false;

    for (var i = 0, l = lhs.length; i < l; i++) {
        if (lhs[i] instanceof Array && rhs[i] instanceof Array) {
            if (!lhs[i].equals(rhs[i]))
                return false;
        } else if (lhs[i] !== rhs[i]) {
            return false;
        }
    }
    return true;
}
