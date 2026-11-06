import type * as React from 'react';

import type {
    Button as ReactButton,
    Container as ReactContainer,
    Panel as ReactPanel,
    version as reactVersion,
    revision as reactRevision
} from '../../react/types';
import type { ContainerArgs, Element, NumericInput, PanelArgs, version, revision } from '../../types';

type Assert<T extends true> = T;
type IsString<T> = string extends T ? true : false;
type HasChildren<T> = 'children' extends keyof T ? true : false;
type AcceptsReactNode<P> = 'children' extends keyof P
    ? React.ReactNode extends P[Extract<'children', keyof P>]
        ? true
        : false
    : false;

type Created = ReturnType<typeof Element.create<NumericInput>>;
type IncludesUndefined = Assert<undefined extends Created ? true : false>;
type CreatesNumericInput = Assert<Exclude<Created, undefined> extends NumericInput ? true : false>;

// The build replaces these placeholders, so the declarations must not keep their literal types
type VersionIsString = Assert<IsString<typeof version>>;
type RevisionIsString = Assert<IsString<typeof revision>>;
type ReactVersionIsString = Assert<IsString<typeof reactVersion>>;
type ReactRevisionIsString = Assert<IsString<typeof reactRevision>>;

// The core types must not carry React's children prop; only the React wrappers add it
type CoreContainerHasNoChildren = Assert<HasChildren<ContainerArgs> extends false ? true : false>;
type CorePanelHasNoChildren = Assert<HasChildren<PanelArgs> extends false ? true : false>;
type ReactContainerAcceptsChildren = Assert<AcceptsReactNode<React.ComponentProps<typeof ReactContainer>>>;
type ReactPanelAcceptsChildren = Assert<AcceptsReactNode<React.ComponentProps<typeof ReactPanel>>>;
type ReactButtonHasNoChildren = Assert<
    HasChildren<React.ComponentProps<typeof ReactButton>> extends false ? true : false
>;

export type {
    CoreContainerHasNoChildren,
    CorePanelHasNoChildren,
    CreatesNumericInput,
    IncludesUndefined,
    ReactButtonHasNoChildren,
    ReactContainerAcceptsChildren,
    ReactPanelAcceptsChildren,
    ReactRevisionIsString,
    ReactVersionIsString,
    RevisionIsString,
    VersionIsString
};
