import docs from './jsdoc-ast.json';

var cache = {};

/**
 * Gets a custom representation of the docs of a class.
 * @param {string} cls The class name
 * @returns {Object} An object with the following form:
 * {
 *  "description": string,
 *  "properties": {
 *      "propName1": {
 *          description: string,
 *          type: string,
 *          defaultValue: any
 *      }, ...
 *  },
 *  "methods": {
 *      "method1": {
 *          "description": string,
 *          "params": [{
 *              "name": string,
 *              "type": string,
 *              "description"
 *          }, ...]
 *     }, ...
 *  },
 *  "events": {
 *      "event1": {
 *          "description": string,
 *          "params": [{
 *              "name": string,
 *              "type": string,
 *              "description"
 *          }, ...]
 *     }, ...
 * }
 */
export function getDocsForClass(cls) {
    // if data already in cache return it
    if (cache[cls]) {
        return cache[cls];
    }

    // prepare result
    var entry = {
        description: '',
        properties: {},
        methods: {},
        events: [],
        parentClasses: [],
        interfaces: []
    };

    // cache it
    cache[cls] = entry;

    // get docs for class
    var relevantDocs = docs.filter(doc => doc.name === cls || doc.memberof === cls);
    relevantDocs.forEach(doc => {
        if (doc.undocumented) return;

        if (doc.classdesc) {
            entry.description = doc.classdesc;
        }

        if (doc.augments) {
            entry.parentClasses = entry.parentClasses.concat(doc.augments);
        }

        if (doc.mixes) {
            entry.interfaces = entry.interfaces.concat(doc.mixes);
        }

        if (doc.properties) {
            doc.properties.forEach(prop => {
                if (prop.undocumented || !prop.description) return;

                var name = prop.name.replace('args.', '');
                entry.properties[name] = {
                    description: prop.description,
                    type: prop.type.names[0],
                    defaultValue: prop.defaultvalue
                };
            });
        }

        if ((doc.kind === 'class' || doc.kind === 'member') && doc.description) {
            var data = {
                name: doc.kind === 'class' ? 'constructor': doc.name,
                description: doc.description,
            };
            if (doc.params) {
                data.params = doc.params.map(param => {
                    return {
                        name: param.name,
                        type: param.type.names[0],
                        description: param.description
                    };
                });
            }

            entry.methods[data.name] = data;
        }

        if (doc.kind === 'event' && doc.description) {
            var data = {
                name: doc.name,
                description: doc.description,
            };
            if (doc.params) {
                data.params = doc.params.map(param => {
                    return {
                        name: param.name,
                        type: param.type.names[0],
                        description: param.description
                    };
                });
            }

            entry.events[data.name] = data;
        }
    });

    return entry;
}

export function getStoryBookDocs(data) {
    var result = {};

    // first get parent class properties
    if (data.parentClasses) {
        data.parentClasses.forEach(cls => {
            var parentDocs = getDocsForClass(cls);
            if (parentDocs) {
                parentDocs = getStoryBookDocs(parentDocs);
                result = Object.assign(result, parentDocs);
            }
        });
    }

    // then get interfaces
    if (data.interfaces) {
        data.interfaces.forEach(cls => {
            var parentDocs = getDocsForClass(cls);
            if (parentDocs) {
                parentDocs = getStoryBookDocs(parentDocs);
                result = Object.assign(result, parentDocs);
            }
        });
    }

    // finally get this class
    // any duplicate definitions will overwrite the previous ones
    for (var name in data.properties) {
        var prop = data.properties[name];
        var typeAndDefault = convertTypeAndValue(prop.type, prop.defaultValue);
        result[`${name}`] = {
            name: name,
            description: prop.description,
            defaultValue: typeAndDefault[1],
            control: {
                type: typeAndDefault[0]
            },
            table: {
                category: 'Properties',
                type: {
                    detail: prop.type,
                    summary: prop.type,
                },
                defaultValue: { summary : typeAndDefault[1] }
            }
        };
    }

    for (var name in data.methods) {
        var event = data.methods[name];
        var eventData = {
            name: name,
            description: event.description,
            table: {
                category: 'Methods'
            }
        }

        if (event.params) {
            eventData.table.type = {
                summary: 'Parameters',
                detail: event.params.map(param => {
                    return `${param.name} {${param.type}} - "${param.description}"`;
                }).join('\n')
            }
        }

        result[`method.${name}`] = eventData;
    }

    for (var name in data.events) {
        var event = data.events[name];
        var eventData = {
            name: name,
            description: event.description,
            table: {
                category: 'Events'
            }
        }

        if (event.params) {
            eventData.table.type = {
                summary: 'Parameters',
                detail: event.params.map(param => {
                    return `${param.name} {${param.type}} - "${param.description}"`;
                }).join('\n')
            }
        }

        result[`event.${name}`] = eventData;
    }

    return result;
}

function convertTypeAndValue(type, value) {
    switch (type) {
        case 'Array.<string>':
            return ['array', value === undefined ? [] : value];
        case 'number':
            return ['number', value === undefined ? 0 : value];
        case 'string':
            return ['text', value === undefined ? '' : value];
        case 'boolean':
            return ['boolean', value === undefined ? false : value];
        default:
            return [type, value];
    }
}
