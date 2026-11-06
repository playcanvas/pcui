import type { version as reactVersion, revision as reactRevision } from '../../react/types';
import type { Element, NumericInput, version, revision } from '../../types';

type Assert<T extends true> = T;
type IsString<T> = string extends T ? true : false;

type Created = ReturnType<typeof Element.create<NumericInput>>;
type IncludesUndefined = Assert<undefined extends Created ? true : false>;
type CreatesNumericInput = Assert<Exclude<Created, undefined> extends NumericInput ? true : false>;

// The build replaces these placeholders, so the declarations must not keep their literal types
type VersionIsString = Assert<IsString<typeof version>>;
type RevisionIsString = Assert<IsString<typeof revision>>;
type ReactVersionIsString = Assert<IsString<typeof reactVersion>>;
type ReactRevisionIsString = Assert<IsString<typeof reactRevision>>;

export type {
    CreatesNumericInput,
    IncludesUndefined,
    ReactRevisionIsString,
    ReactVersionIsString,
    RevisionIsString,
    VersionIsString
};
