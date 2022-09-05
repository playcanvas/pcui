import React from 'react';

class BaseComponent extends React.Component {
    constructor(props) {
        super(props);
        if (props.onClick) {
            this.onClick = props.onClick;
        }
        if (props.onRemove) {
            this.onRemove = props.onRemove;
        }
        if (props.onChange) {
            this.onChange = props.onChange;
        }
        if (props.onSelect) {
            this.onSelect = props.onSelect;
        }
        if (props.onDeselect) {
            this.onDeselect = props.onDeselect;
        }
        if (props.link) {
            this.link = props.link;
        }
    }
    attachElement = (nodeElement, containerElement) => {
        if (!nodeElement) return;
        this.element = new this.elementClass({
            ...this.props,
            dom: nodeElement,
            container: containerElement,
            parent: undefined
        });
        if (this.onClick) {
            this.element.on('click', this.onClick);
        }
        if (this.onRemove) {
            this.element.on('click:remove', this.onRemove);
        }
        if (this.onChange) {
            this.element.on('change', this.onChange);
        }
        if (this.onSelect) {
            this.element.on('select', this.onSelect);
        }
        if (this.onDeselect) {
            this.element.on('deselect', this.onDeselect);
        }
        if (this.props.parent) {
            this.element.parent = this.props.parent;
        }
    }
    getPropertyDescriptor = (obj, prop) => {
        let desc;
        do {
            desc = Object.getOwnPropertyDescriptor(obj, prop);
        } while (!desc && (obj = Object.getPrototypeOf(obj)));
        return desc;
    }

    componentDidMount() {
        if (this.link) {
            this.element.link(this.link.observer, this.link.path);
        }
    }

    componentDidUpdate(prevProps) {
        Object.keys(this.props).forEach(prop => {
            var propDescriptor = this.getPropertyDescriptor(this.element, prop);
            if (propDescriptor && propDescriptor.set) {
                if (prop === 'value') {
                    this.element._suppressChange = true;
                    this.element[prop] = this.props[prop];
                    this.element._suppressChange = false;
                } else {
                    this.element[prop] = this.props[prop];
                }
            }
        });
        if (prevProps.link !== this.props.link) {
            this.element.link(this.props.link.observer, this.props.link.path);
        }
    }

    render() {
        return <div ref={this.attachElement} />
    }
}

export default BaseComponent;
