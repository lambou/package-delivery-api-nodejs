
"use strict"

export function serializeError(obj: any) {
    let cache: any = [];
    const serialized = JSON.stringify(obj, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            // Check if we've encountered this object before
            if (cache.includes(value)) {
                // Circular reference found, discard key
                return;
            }
            // Store reference to this object
            cache.push(value);
        }
        return value;
    });
    cache = null; // Clear cache
    return JSON.parse(serialized);
}