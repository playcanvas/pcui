import * as React from 'react';
import { Element as ElementClass, ElementArgs } from './index';

/**
 * The base class for all UI elements. Wraps a DOM element with the PCUI interface.
 */
class Element<P extends ElementArgs, S> extends React.Component<P, S> {
    static ctor: any;

    element: any;

    elementClass: any;

    onClick: () => void;

    onChange: (value: any) => void;

    onRemove: () => void;

    link: ElementArgs["link"];

    onAttach?: () => void;

    class: Set<string>;

    constructor(props: P) {
        super(props);
        this.elementClass = ElementClass;
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

        this.element = new this.elementClass({
            ...this.props,
            dom: nodeElement,
            content: containerElement,
            parent: undefined
        });

        const c = this.props.class;
        this.class = new Set(c ? (Array.isArray(c) ? c.slice() : [c]) : undefined);

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
            const propDescriptor = this.getPropertyDescriptor(this.element, prop);
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
            } else if (prop === 'class') {
                const c = this.props[prop];
                const classProp = new Set(c ? (Array.isArray(c) ? c.slice() : [c]) : undefined);
                classProp.forEach((cls: string) => {
                    if (!this.class.has(cls)) {
                        this.element.class.add(cls);
                        this.class.add(cls);
                    }
                });
                this.class.forEach((cls: string) => {
                    if (!classProp.has(cls)) {
                        this.element.class.remove(cls);
                        this.class.delete(cls);
                    }
                });
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

export { Element };
