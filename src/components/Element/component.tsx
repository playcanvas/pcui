import React from 'react';
import Element from './index';

/**
 * The base class for all UI elements. Wraps a dom element with the PCUI interface.
 */

class Component <P extends Element.Args, S> extends React.Component <P, S> {
    static defaultArgs = Element.defaultArgs;

    static ctor: any;

    element: any;

    elementClass: any;

    onClick: () => void;

    onChange: (value: any) => void;

    onRemove: () => void;

    link: any;

    onAttach?: any;

    constructor(props: P) {
        super(props);
        this.elementClass = Element;
        if (props.onClick) {
            this.onClick = props.onClick;
        }
        if (props.onRemove) {
            this.onRemove = props.onRemove;
        }
        if (props.onChange) {
            this.onChange = props.onChange;
        }
        if (props.link) {
            this.link = props.link;
        }
    }

    attachElement = (nodeElement: HTMLElement, containerElement: any) => {
        if (!nodeElement) return;
        if (this.elementClass === Element) {
            this.element = new this.elementClass(
                nodeElement,
                {
                    ...this.elementClass.defaultArgs,
                    ...this.props,
                    container: containerElement,
                    parent: undefined
                }
            );
        } else {
            this.element = new this.elementClass({
                ...this.elementClass.defaultArgs,
                ...this.props,
                dom: nodeElement,
                container: containerElement,
                parent: undefined
            });
        }
        if (this.onClick) {
            this.element.on('click', this.onClick);
        }
        if (this.onRemove) {
            this.element.on('click:remove', this.onRemove);
        }
        if (this.onChange) {
            this.element.on('change', this.onChange);
        }
        if (this.props.parent) {
            this.element.parent = this.props.parent;
        }
        if (this.onAttach) {
            this.onAttach();
        }
    };

    getPropertyDescriptor = (obj: any, prop: any) => {
        let desc;
        do {
            desc = Object.getOwnPropertyDescriptor(obj, prop);
        } while (!desc && (obj = Object.getPrototypeOf(obj)));
        return desc;
    };

    componentDidMount() {
        if (this.link) {
            this.element.link(this.link.observer, this.link.path);
        }
    }

    componentDidUpdate(prevProps: any) {
        Object.keys(this.props).forEach((prop) => {
            var propDescriptor = this.getPropertyDescriptor(this.element, prop);
            if (propDescriptor && propDescriptor.set) {
                if (prop === 'value') {
                    this.element._suppressChange = true;
                    // @ts-ignore
                    this.element[prop] = this.props[prop];
                    this.element._suppressChange = false;
                } else {
                    // @ts-ignore
                    this.element[prop] = this.props[prop];
                }
            }
        });
        if (prevProps.link !== this.props.link && this.props.link) {
            this.element.link(this.props.link.observer, this.props.link.path);
        }
    }

    render() {
        // @ts-ignore
        return <div ref={this.attachElement} />;
    }
}

export default Component;
