import * as React from 'react';
import Element, { ElementArgs } from './index';

/**
 * The base class for all UI elements. Wraps a DOM element with the PCUI interface.
 */
class Component <P extends ElementArgs, S> extends React.Component <P, S> {
    static ctor: any;

    element: any;

    elementClass: any;

    onClick: () => void;

    onChange: (value: any) => void;

    onRemove: () => void;

    link: ElementArgs["link"];

    onAttach?: any;

    class: Array<string>;

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
                    ...this.props,
                    container: containerElement,
                    parent: undefined
                }
            );
        } else {
            this.element = new this.elementClass({
                ...this.props,
                dom: nodeElement,
                content: containerElement,
                parent: undefined
            });
        }

        this.class = [];
        const classProp = this.props.class;
        if (classProp) {
            if (Array.isArray(classProp)) {
                for (let i = 0; i < classProp.length; i++) {
                    this.class.push(classProp[i]);
                }
            } else {
                this.class.push(classProp);
            }
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
                let classProp: Array<string> | string = this.props[prop] ?? [];
                if (!Array.isArray(classProp)) {
                    classProp = [classProp];
                }
                classProp.forEach((cls: string) => {
                    this.element.class.add(cls);
                });
                if (!this.class) {
                    this.class = [];
                    this.element.class.forEach((cls: string) => {
                        this.class.push(cls);
                    });
                }
                this.class.forEach((cls: string) => {
                    if (!classProp.includes(cls)) {
                        this.element.class.remove(cls);
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

export default Component;
