import type * as React from 'react';

import type {
    Button as ReactButton,
    Code as ReactCode,
    Container as ReactContainer,
    GridView as ReactGridView,
    GridViewItem as ReactGridViewItem,
    InfoBox as ReactInfoBox,
    LabelGroup as ReactLabelGroup,
    Menu as ReactMenu,
    Panel as ReactPanel,
    Progress as ReactProgress,
    TreeView as ReactTreeView,
    TreeViewItem as ReactTreeViewItem,
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

// Every wrapper whose props extend ContainerArgs accepts React children. React.ComponentProps
// reads a class component's props from its constructor parameter, as React.memo() does, so this
// also catches a wrapper whose explicit constructor is typed without ParentProps.
type ReactCodeAcceptsChildren = Assert<AcceptsReactNode<React.ComponentProps<typeof ReactCode>>>;
type ReactContainerAcceptsChildren = Assert<AcceptsReactNode<React.ComponentProps<typeof ReactContainer>>>;
type ReactGridViewAcceptsChildren = Assert<AcceptsReactNode<React.ComponentProps<typeof ReactGridView>>>;
type ReactGridViewItemAcceptsChildren = Assert<AcceptsReactNode<React.ComponentProps<typeof ReactGridViewItem>>>;
type ReactInfoBoxAcceptsChildren = Assert<AcceptsReactNode<React.ComponentProps<typeof ReactInfoBox>>>;
type ReactLabelGroupAcceptsChildren = Assert<AcceptsReactNode<React.ComponentProps<typeof ReactLabelGroup>>>;
type ReactMenuAcceptsChildren = Assert<AcceptsReactNode<React.ComponentProps<typeof ReactMenu>>>;
type ReactPanelAcceptsChildren = Assert<AcceptsReactNode<React.ComponentProps<typeof ReactPanel>>>;
type ReactProgressAcceptsChildren = Assert<AcceptsReactNode<React.ComponentProps<typeof ReactProgress>>>;
type ReactTreeViewAcceptsChildren = Assert<AcceptsReactNode<React.ComponentProps<typeof ReactTreeView>>>;
type ReactTreeViewItemAcceptsChildren = Assert<AcceptsReactNode<React.ComponentProps<typeof ReactTreeViewItem>>>;

type ReactButtonHasNoChildren = Assert<
    HasChildren<React.ComponentProps<typeof ReactButton>> extends false ? true : false
>;

export type {
    CoreContainerHasNoChildren,
    CorePanelHasNoChildren,
    CreatesNumericInput,
    IncludesUndefined,
    ReactButtonHasNoChildren,
    ReactCodeAcceptsChildren,
    ReactContainerAcceptsChildren,
    ReactGridViewAcceptsChildren,
    ReactGridViewItemAcceptsChildren,
    ReactInfoBoxAcceptsChildren,
    ReactLabelGroupAcceptsChildren,
    ReactMenuAcceptsChildren,
    ReactPanelAcceptsChildren,
    ReactProgressAcceptsChildren,
    ReactRevisionIsString,
    ReactTreeViewAcceptsChildren,
    ReactTreeViewItemAcceptsChildren,
    ReactVersionIsString,
    RevisionIsString,
    VersionIsString
};
