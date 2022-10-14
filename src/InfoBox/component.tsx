import React from 'react';
import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface InfoBoxProps extends ElementComponentProps {
    icon?: string,
    title?: string,
    text?: string
}

class InfoBox extends ElementComponent <InfoBoxProps, any> {

    static defaultProps: InfoBoxProps;

    constructor(props: InfoBoxProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        // @ts-ignore
        return <span ref={this.attachElement} />
    }
}

InfoBox.ctor = Element;
InfoBox.defaultProps = {
    icon: 'E401',
    title: 'Hello World',
    text: 'foobar'
};

export default InfoBox;


