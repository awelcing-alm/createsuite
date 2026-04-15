import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import {
  MonitorIcon,
  TerminalIcon,
  CpuIcon,
  GlobeIcon,
  PlayIcon,
  WifiIcon,
  BatteryIcon,
  SearchIcon,
  XIcon,
  MinusIcon,
  Maximize2Icon,
} from './InlineIcon';

const allIcons = [
  { name: 'MonitorIcon', Component: MonitorIcon },
  { name: 'TerminalIcon', Component: TerminalIcon },
  { name: 'CpuIcon', Component: CpuIcon },
  { name: 'GlobeIcon', Component: GlobeIcon },
  { name: 'PlayIcon', Component: PlayIcon },
  { name: 'WifiIcon', Component: WifiIcon },
  { name: 'BatteryIcon', Component: BatteryIcon },
  { name: 'SearchIcon', Component: SearchIcon },
  { name: 'XIcon', Component: XIcon },
  { name: 'MinusIcon', Component: MinusIcon },
  { name: 'Maximize2Icon', Component: Maximize2Icon },
];

describe('InlineIcon', () => {
  test('all icons render without crashing', () => {
    for (const { name, Component } of allIcons) {
      const { container } = render(React.createElement(Component));
      const svg = container.querySelector('svg');
      expect(svg, `${name} should render an <svg>`).not.toBeNull();
    }
  });

  test('default size is 16x16', () => {
    const { container } = render(React.createElement(MonitorIcon));
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('16');
    expect(svg.getAttribute('height')).toBe('16');
  });

  test('custom size prop is applied', () => {
    const { container } = render(React.createElement(MonitorIcon, { size: 24 }));
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
  });

  test('icons use currentColor for stroke inheritance', () => {
    const { container } = render(React.createElement(MonitorIcon));
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('stroke')).toBe('currentColor');
  });

  test('className prop is passed through to svg', () => {
    const { container } = render(React.createElement(MonitorIcon, { className: 'test-icon' }));
    const svg = container.querySelector('svg')!;
    expect(svg.classList.contains('test-icon')).toBe(true);
  });

  test('svg has correct viewBox and fill attributes', () => {
    const { container } = render(React.createElement(MonitorIcon));
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.getAttribute('fill')).toBe('none');
  });
});
