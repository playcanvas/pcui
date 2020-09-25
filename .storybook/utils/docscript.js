import docs from './jsdoc-ast.json';

export function getDescriptionForClass(name) {
    var doc = docs.filter(doc => !!doc.classdesc && doc.name === name);
    if (doc.length !== 0)
        return doc[doc.length-1].classdesc;
    return 'NO DESCRIPTION FOUND';
}


export function getPropertiesForClass(name) {
    var doc = docs.filter(doc => doc.name === name && (!!doc.properties || !!doc.params));
    if (doc.length === 0) {
        return {};
    }
    var props = [];
    for (var i = 0; i < doc.length; i++) {
        if (doc[i].params && doc[i].params.length > 0) {
            props = [...props, ...doc[i].params];
        }
        if (doc[i].properties && doc[i].properties.length > 0) {
            props = [...props, ...doc[i].properties];
        }
    }

    if (props.length === 0) return props;

    return props
        .map(prop => {
            var defaultValue = null;
            var controlType = null;
            switch (prop.type.names[0]) {
                case 'Array.<String>':
                    defaultValue = [];
                    controlType = 'array';
                    break;
                case 'Number':
                    defaultValue = 0;
                    controlType = 'number';
                    break;
                case 'String':
                    defaultValue = '';
                    controlType = 'text';
                    break;
                case 'Boolean':
                    defaultValue = false;
                    controlType = 'boolean';
                    break;
                default:
                    break;
            }
            if (prop.defaultvalue) defaultValue = prop.defaultvalue;
            var name = prop.name.replace('args.', '');
            if (name === 'args') return undefined;
            return {
                [name]: {
                    description: prop.description,
                    control: {
                        type: controlType
                    },
                    table: {
                        type: { detail: prop.type.names[0], summary: prop.type.names[0] },
                        defaultValue: { summary: defaultValue }
                    },
                    defaultValue
                }
            };
        })
        .reduce((accumulator, currentValue) => ({ ...accumulator, ...currentValue}));
}