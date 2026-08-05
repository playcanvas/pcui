import type { Element, NumericInput } from '../../types';

type Assert<T extends true> = T;
type Created = ReturnType<typeof Element.create<NumericInput>>;
type IncludesUndefined = Assert<undefined extends Created ? true : false>;
type CreatesNumericInput = Assert<Exclude<Created, undefined> extends NumericInput ? true : false>;

export type { CreatesNumericInput, IncludesUndefined };
