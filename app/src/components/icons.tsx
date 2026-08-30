// Monoline SVG icons in the SF Symbols style (thin rounded strokes,
// currentColor) — SF Symbols itself isn't available cross-platform,
// so these are hand-drawn equivalents of the glyphs we need.

import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

function base({ size = 24 }: IconProps) {
  return { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const };
}
const strokeProps = (color: string, strokeWidth = 1.8) => ({
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function PlayIcon(p: IconProps) {
  return (
    <Svg {...base(p)}>
      <Path d="M8 5.5v13l11-6.5-11-6.5Z" {...strokeProps(p.color, p.strokeWidth)} fill={p.color} />
    </Svg>
  );
}

export function PauseIcon(p: IconProps) {
  return (
    <Svg {...base(p)}>
      <Rect x="6.5" y="5" width="3.6" height="14" rx="1.2" fill={p.color} />
      <Rect x="13.9" y="5" width="3.6" height="14" rx="1.2" fill={p.color} />
    </Svg>
  );
}

export function DownloadIcon(p: IconProps) {
  return (
    <Svg {...base(p)}>
      <Path d="M12 4v10m0 0 4-4m-4 4-4-4" {...strokeProps(p.color, p.strokeWidth)} />
      <Path d="M5 16v2.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V16" {...strokeProps(p.color, p.strokeWidth)} />
    </Svg>
  );
}

export function CheckCircleIcon(p: IconProps) {
  return (
    <Svg {...base(p)}>
      <Circle cx="12" cy="12" r="8.5" {...strokeProps(p.color, p.strokeWidth)} />
      <Path d="m8.5 12.2 2.4 2.4 4.6-5" {...strokeProps(p.color, p.strokeWidth)} />
    </Svg>
  );
}

export function TrashIcon(p: IconProps) {
  return (
    <Svg {...base(p)}>
      <Path d="M5 7h14M10 7V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V7m-7.5 0 .8 11a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-11" {...strokeProps(p.color, p.strokeWidth)} />
      <Path d="M10 11v5m4-5v5" {...strokeProps(p.color, p.strokeWidth)} />
    </Svg>
  );
}

export function ChevronRightIcon(p: IconProps) {
  return (
    <Svg {...base(p)}>
      <Path d="m9 5.5 6.5 6.5L9 18.5" {...strokeProps(p.color, p.strokeWidth)} />
    </Svg>
  );
}

export function GearIcon(p: IconProps) {
  return (
    <Svg {...base(p)}>
      <Circle cx="12" cy="12" r="3" {...strokeProps(p.color, p.strokeWidth)} />
      <Path
        d="M12 3.5v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.6-6.1-1.4 1.4M6.3 17.7l-1.4 1.4m14.2 0-1.4-1.4M6.3 6.3 4.9 4.9"
        {...strokeProps(p.color, p.strokeWidth)}
      />
    </Svg>
  );
}

export function GlobeIcon(p: IconProps) {
  return (
    <Svg {...base(p)}>
      <Circle cx="12" cy="12" r="8.5" {...strokeProps(p.color, p.strokeWidth)} />
      <Path d="M3.5 12h17M12 3.5c-4.7 4.9-4.7 12.1 0 17 4.7-4.9 4.7-12.1 0-17Z" {...strokeProps(p.color, p.strokeWidth)} />
    </Svg>
  );
}

export function BookIcon(p: IconProps) {
  return (
    <Svg {...base(p)}>
      <Path
        d="M12 6.5c-1.6-1.3-3.8-2-6.5-2v13c2.7 0 4.9.7 6.5 2m0-13c1.6-1.3 3.8-2 6.5-2v13c-2.7 0-4.9.7-6.5 2m0-13v13"
        {...strokeProps(p.color, p.strokeWidth)}
      />
    </Svg>
  );
}

export function DocIcon(p: IconProps) {
  return (
    <Svg {...base(p)}>
      <Path d="M7 3.5h6.5L18 8v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1-1.4Z" {...strokeProps(p.color, p.strokeWidth)} />
      <Path d="M13.5 3.5V8H18" {...strokeProps(p.color, p.strokeWidth)} />
    </Svg>
  );
}

export function InfoCircleIcon(p: IconProps) {
  return (
    <Svg {...base(p)}>
      <Circle cx="12" cy="12" r="8.5" {...strokeProps(p.color, p.strokeWidth)} />
      <Path d="M12 11v5" {...strokeProps(p.color, p.strokeWidth)} />
      <Circle cx="12" cy="8" r="0.9" fill={p.color} />
    </Svg>
  );
}

export function RepeatIcon(p: IconProps) {
  return (
    <Svg {...base(p)}>
      <Path d="M17 4.5 19.5 7 17 9.5" {...strokeProps(p.color, p.strokeWidth)} />
      <Path d="M19.5 7H8a3.5 3.5 0 0 0-3.5 3.5v.5M7 19.5 4.5 17 7 14.5" {...strokeProps(p.color, p.strokeWidth)} />
      <Path d="M4.5 17H16a3.5 3.5 0 0 0 3.5-3.5V13" {...strokeProps(p.color, p.strokeWidth)} />
    </Svg>
  );
}

export function SkipBackIcon(p: IconProps & { label?: string }) {
  return (
    <Svg {...base(p)}>
      <Path d="M12 4a8 8 0 1 1-7.6 5.5" {...strokeProps(p.color, p.strokeWidth)} />
      <Path d="M4 4v5.5h5.5" fill="none" {...strokeProps(p.color, p.strokeWidth)} />
    </Svg>
  );
}

export function SkipForwardIcon(p: IconProps) {
  return (
    <Svg {...base(p)}>
      <Path d="M12 4a8 8 0 1 0 7.6 5.5" {...strokeProps(p.color, p.strokeWidth)} />
      <Path d="M20 4v5.5h-5.5" fill="none" {...strokeProps(p.color, p.strokeWidth)} />
    </Svg>
  );
}

export function XIcon(p: IconProps) {
  return (
    <Svg {...base(p)}>
      <Path d="m6.5 6.5 11 11m0-11-11 11" {...strokeProps(p.color, p.strokeWidth)} />
    </Svg>
  );
}
