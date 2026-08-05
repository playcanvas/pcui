import { deepCopy } from '../src/helpers/utils';
import { BooleanInput, Button, Container, Element, Label, NumericInput, SelectInput } from '../src';

type IsUnknown<T> = unknown extends T ? ([keyof T] extends [never] ? true : false) : false;
type Assert<T extends true> = T;

new BooleanInput({
    onChange: (value: boolean) => value.valueOf()
});

new NumericInput({
    value: '1 + 2',
    onChange: (value: number) => value.toFixed()
});

const select = new SelectInput({
    value: { id: 1 },
    defaultValue: { id: 2 },
    invalidOptions: [{ id: 3 }],
    onChange: (value: string) => value.toUpperCase(),
    onSelect: (value: string) => value.toUpperCase()
});
select.value = 'value';

new Container().buildDom([
    { label: new Label() },
    {
        root: { row: new Container() },
        children: [{ button: new Button() }, { enabled: new BooleanInput() }]
    }
]);

Element.create<NumericInput>('number', {})?.value.toFixed();

select.value = { id: 4 };

type DeepCopyReturnsUnknown = Assert<IsUnknown<ReturnType<typeof deepCopy>>>;
type SelectValueIsUnknown = Assert<IsUnknown<typeof select.value>>;
