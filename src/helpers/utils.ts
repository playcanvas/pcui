export function deepCopy(data: unknown) {
    if (data == null || typeof data !== 'object') {
        return data;
    }

    if (data instanceof Array) {
        const arr: unknown[] = [];
        for (let i = 0; i < data.length; i++) {
            arr[i] = deepCopy(data[i]);
        }
        return arr;
    }

    const obj: Record<string, unknown> = {};
    for (const key in data as Record<string, unknown>) {
        if (Reflect.apply((data as Record<string, unknown>).hasOwnProperty, data, [key])) {
            obj[key] = deepCopy((data as Record<string, unknown>)[key]);
        }
    }
    return obj;
}

export function arrayEquals<T>(lhs: T[], rhs: T[]) {
    if (!lhs) {
        return false;
    }

    if (!rhs) {
        return false;
    }

    if (lhs.length !== rhs.length) {
        return false;
    }

    for (let i = 0, l = lhs.length; i < l; i++) {
        if (lhs[i] instanceof Array && rhs[i] instanceof Array) {
            if (!(lhs[i] as unknown[] & { equals: (value: unknown[]) => boolean }).equals(rhs[i] as unknown[])) {
                return false;
            }
        } else if (lhs[i] !== rhs[i]) {
            return false;
        }
    }
    return true;
}
