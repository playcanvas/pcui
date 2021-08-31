import Element from './component';
import { getDocsForClass, getStorybookDocs } from '../../.storybook/utils/docscript'

var name = 'Element';
var config = {
    title: `${name}`,
    docs: getDocsForClass(name),
};

export default {
    title: config.title,
    component: Element,
    parameters: {
        docs: {
            description: {
                component: config.docs.description
            }
        }
    },
    argTypes: getStorybookDocs(config.docs)
};

export const Main = (args) => {
    return <Element {...args} />;
};
