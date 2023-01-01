export function deepCopy(data: any) {
    if (data == null || typeof (data) !== 'object')
        return data;

    if (data instanceof Array) {
        const arr: any[] = [];
        for (let i = 0; i < data.length; i++) {
            arr[i] = deepCopy(data[i]);
        }
        return arr;
    }

    const obj: any = { };
    for (const key in data) {
        if (data.hasOwnProperty(key))
            obj[key] = deepCopy(data[key]);
    }
    return obj;
}

export function arrayEquals(lhs: Array<any>, rhs: Array<any>) {
    if (!lhs)
        return false;

    if (!rhs)
        return false;

    if (lhs.length !== rhs.length)
        return false;

    for (let i = 0, l = lhs.length; i < l; i++) {
        if (lhs[i] instanceof Array && rhs[i] instanceof Array) {
            if (!lhs[i].equals(rhs[i]))
                return false;
        } else if (lhs[i] !== rhs[i]) {
            return false;
        }
    }
    return true;
}
