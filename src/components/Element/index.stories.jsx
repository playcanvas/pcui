import Element from './component';
import { getDocsForClass, getStoryBookDocs } from '../../../.storybook/utils/docscript'

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
    argTypes: getStoryBookDocs(config.docs)
};

export const Main = (args) => {
    return <Element {...args} />;
};
