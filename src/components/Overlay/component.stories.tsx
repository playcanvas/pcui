import type { Meta, StoryObj } from '@storybook/react-webpack5';
import * as React from 'react';

import { Button as ButtonClass } from '../Button';
import { Label as LabelClass } from '../Label';

import { Overlay } from './component';

import { Overlay as OverlayClass } from './index';

import '../../scss/index.js';

const meta: Meta<typeof Overlay> = {
    title: 'Components/Overlay',
    component: Overlay
};

export default meta;
type Story = StoryObj<typeof Overlay>;

export const Main: Story = {
    render: (args) => <Overlay {...args} />
};

const OverlayWithContent = ({ clickable, transparent }: { clickable?: boolean; transparent?: boolean }) => {
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const overlay = new OverlayClass({ clickable, transparent });

        overlay.append(new LabelClass({ text: 'Content appended to a default overlay' }));

        let clicks = 0;
        const button = new ButtonClass({ text: 'Click me' });
        button.on('click', () => {
            clicks++;
            button.text = `Clicked ${clicks} time${clicks === 1 ? '' : 's'}`;
        });
        overlay.append(button);

        ref.current?.appendChild(overlay.dom);

        return () => overlay.destroy();
    }, [clickable, transparent]);

    return <div ref={ref} />;
};

export const WithContent: Story = {
    render: (args) => <OverlayWithContent clickable={args.clickable} transparent={args.transparent} />
};
