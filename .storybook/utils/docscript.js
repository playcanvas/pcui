import docs from './jsdoc-ast.json';

export function getDescriptionForClass(name) {
    var doc = docs.filter(doc => !!doc.classdesc && doc.name === name);
    if (doc.length !== 0)
        return doc[doc.length-1].classdesc;
    return 'NO DESCRIPTION FOUND';
}

function getPropsForClass(cls, title, result) {
    if (result[title]) return;
    result[title] = [];

    var doc = docs.filter(doc => doc.name === cls);// && (!!doc.properties || !!doc.params));
    if (doc.length === 0) {
        return;
    }

    var props = [];

    for (var i = 0; i < doc.length; i++) {
        if (doc[i].params && doc[i].params.length > 0) {
            props = [...props, ...doc[i].params];
        }
        if (doc[i].properties && doc[i].properties.length > 0) {
            props = [...props, ...doc[i].properties];
        }

        if (doc[i].augments) {
            doc[i].augments.forEach(superCls => {
                getPropsForClass(superCls, 'inherits: ' + superCls, result);
            });
        }

        if (doc[i].mixes) {
            doc[i].mixes.forEach(interfaceCls => {
                getPropsForClass(interfaceCls, 'implements: ' + interfaceCls, result);
            });
        }
    }

    result[title] = props;
}

export function getPropertiesForClass(name) {
    var props = {};
    getPropsForClass(name, name, props);

    const result = {};
    for (const title in props) {
        const list = props[title].map(prop => {
            var defaultValue = null;
            var controlType = null;
            switch (prop.type.names[0]) {
                case 'Array.<string>':
                    defaultValue = [];
                    controlType = 'array';
                    break;
                case 'number':
                    defaultValue = 0;
                    controlType = 'number';
                    break;
                case 'string':
                    defaultValue = '';
                    controlType = 'text';
                    break;
                case 'boolean':
                    defaultValue = false;
                    controlType = 'boolean';
                    break;
                default:
                    break;
            }
            if (prop.defaultvalue !== undefined && prop.defaultvalue !== null) defaultValue = prop.defaultvalue;
            var propName = prop.name.replace('args.', '');
            if (propName === 'args') return undefined;
            return {
                [propName]: {
                    description: prop.description,
                    control: {
                        type: propName === 'renderChanges' ? null : controlType
                    },
                    table: {
                        type: { detail: prop.type.names[0], summary: prop.type.names[0] },
                        defaultValue: { summary: defaultValue },
                        category: title
                    },
                    defaultValue
                }
            };
        });

        list.forEach(item => {
            for (const key in item) {
                result[key] = item[key];
            }
        });
    }

    return result;
}
