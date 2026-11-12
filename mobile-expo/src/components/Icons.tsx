import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

type IconProps = {
  size?: number;
  color?: string;
};

const isWeb = Platform.OS === 'web';

export function LogoMarkIcon({ size = 38 }: { size?: number }) {
  const s = size;
  const radius = Math.round(s * 0.28);

  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: s,
        height: s,
        viewBox: '0 0 40 40',
        fill: 'none',
        style: { flexShrink: 0, display: 'block' },
        'aria-hidden': 'true',
      },
      React.createElement(
        'defs',
        null,
        React.createElement(
          'linearGradient',
          { id: 'logo-mark-terra', x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
          React.createElement('stop', { offset: '0%', stopColor: '#FB923C' }),
          React.createElement('stop', { offset: '100%', stopColor: '#C2410C' }),
        ),
      ),
      React.createElement('rect', {
        width: '40',
        height: '40',
        rx: '11',
        fill: '#0B0F19',
      }),
      React.createElement('rect', {
        x: '1',
        y: '1',
        width: '38',
        height: '38',
        rx: '10',
        stroke: '#FB923C',
        strokeOpacity: '0.45',
        strokeWidth: '1.2',
      }),
      React.createElement('path', {
        d: 'M11.5 14.5L20 28.5L28.5 14.5',
        stroke: '#FAF7F2',
        strokeWidth: '2.8',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
      React.createElement('path', {
        d: 'M17.5 11.5L24.5 15.5L17.5 19.5V11.5Z',
        fill: 'url(#logo-mark-terra)',
      }),
      React.createElement('path', {
        d: 'M17 23L20 26L23 23',
        stroke: '#FB923C',
        strokeWidth: '1.6',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
    );
  }

  return (
    <View
      style={[
        styles.logoContainer,
        {
          width: s,
          height: s,
          borderRadius: radius,
          backgroundColor: '#0F172A',
          borderWidth: 1,
          borderColor: 'rgba(251, 146, 60, 0.42)',
        },
      ]}
    >
      <View
        style={[
          styles.logoPlay,
          {
            top: s * 0.24,
            left: s * 0.42,
            borderTopWidth: s * 0.11,
            borderBottomWidth: s * 0.11,
            borderLeftWidth: s * 0.18,
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: '#FB923C',
          },
        ]}
      />
      <View
        style={[
          styles.logoVLeft,
          {
            width: s * 0.085,
            height: s * 0.36,
            backgroundColor: '#FAF7F2',
            left: s * 0.25,
            top: s * 0.36,
            borderRadius: s * 0.04,
            transform: [{ rotate: '-28deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.logoVRight,
          {
            width: s * 0.085,
            height: s * 0.36,
            backgroundColor: '#FAF7F2',
            right: s * 0.25,
            top: s * 0.36,
            borderRadius: s * 0.04,
            transform: [{ rotate: '28deg' }],
          },
        ]}
      />
    </View>
  );
}

export const VidNestLogo = LogoMarkIcon;

export function SunIcon({ size = 20, color = '#F3F4F6' }: IconProps) {
  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      React.createElement('circle', { cx: '12', cy: '12', r: '4.5' }),
      React.createElement('path', {
        d: 'M12 2v2.2M12 19.8V22M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M2 12h2.2M19.8 12H22M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56',
      }),
    );
  }
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.46,
          height: size * 0.46,
          borderRadius: size * 0.23,
          borderWidth: 2,
          borderColor: color,
        }}
      />
    </View>
  );
}

export function MoonIcon({ size = 20, color = '#111315' }: IconProps) {
  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      React.createElement('path', {
        d: 'M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z',
      }),
    );
  }
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.56,
          height: size * 0.56,
          borderRadius: size * 0.28,
          borderWidth: 2,
          borderColor: color,
        }}
      />
    </View>
  );
}

export function HomeIcon({ size = 22, color = '#525860' }: IconProps) {
  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      React.createElement('path', {
        d: 'M3.5 10.5L12 3.5l8.5 7v9a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5a1.5 1.5 0 0 1-1.5-1.5v-9Z',
      }),
    );
  }
  const stroke = Math.max(2, Math.round(size * 0.08));
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.58,
          height: size * 0.58,
          borderTopWidth: stroke,
          borderLeftWidth: stroke,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          position: 'absolute',
          top: size * 0.14,
        }}
      />
      <View
        style={{
          width: size * 0.62,
          height: size * 0.44,
          borderWidth: stroke,
          borderTopWidth: 0,
          borderColor: color,
          position: 'absolute',
          bottom: size * 0.14,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
        }}
      />
    </View>
  );
}

export function DownloadIcon({ size = 22, color = '#525860' }: IconProps) {
  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2.1',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      React.createElement('path', { d: 'M12 3.5v11.5M7.5 11L12 15.5 16.5 11' }),
      React.createElement('path', { d: 'M4.5 18.5v1a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-1' }),
    );
  }
  const stroke = Math.max(2, Math.round(size * 0.08));
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: stroke,
          height: size * 0.44,
          backgroundColor: color,
          borderRadius: stroke / 2,
          position: 'absolute',
          top: size * 0.16,
        }}
      />
      <View
        style={{
          width: size * 0.34,
          height: size * 0.34,
          borderBottomWidth: stroke,
          borderRightWidth: stroke,
          borderColor: color,
          position: 'absolute',
          top: size * 0.28,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          width: size * 0.65,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          position: 'absolute',
          bottom: size * 0.18,
        }}
      />
    </View>
  );
}

export function LibraryIcon({ size = 22, color = '#525860' }: IconProps) {
  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      React.createElement('rect', { x: '3', y: '5', width: '18', height: '14', rx: '3.5' }),
      React.createElement('polygon', {
        points: '10 9.2 15.2 12 10 14.8 10 9.2',
        fill: color,
        stroke: 'none',
      }),
    );
  }
  const stroke = Math.max(2, Math.round(size * 0.08));
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.72,
          height: size * 0.56,
          borderWidth: stroke,
          borderColor: color,
          borderRadius: 5,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            borderTopWidth: size * 0.12,
            borderBottomWidth: size * 0.12,
            borderLeftWidth: size * 0.18,
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: color,
            marginStart: 2,
          }}
        />
      </View>
    </View>
  );
}

export function SearchIcon({ size = 18, color = '#525860' }: IconProps) {
  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      React.createElement('circle', { cx: '11', cy: '11', r: '7' }),
      React.createElement('line', { x1: '20', y1: '20', x2: '16.2', y2: '16.2' }),
    );
  }
  const stroke = Math.max(2, Math.round(size * 0.08));
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.68,
          height: size * 0.68,
          borderRadius: size * 0.34,
          borderWidth: stroke,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: stroke,
          height: size * 0.3,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
          bottom: size * 0.04,
          left: size * 0.08,
        }}
      />
    </View>
  );
}

export function PasteIcon({ size = 20, color = '#0D7A5F' }: IconProps) {
  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      React.createElement('rect', { x: '8.5', y: '3', width: '7', height: '4', rx: '1.5' }),
      React.createElement('path', {
        d: 'M8.5 5H6.5A1.5 1.5 0 0 0 5 6.5v13A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 17.5 5h-2',
      }),
    );
  }
  const stroke = Math.max(2, Math.round(size * 0.08));
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.58,
          height: size * 0.62,
          borderWidth: stroke,
          borderColor: color,
          borderRadius: 4,
          position: 'absolute',
          bottom: size * 0.14,
        }}
      />
      <View
        style={{
          width: size * 0.28,
          height: size * 0.16,
          borderWidth: stroke,
          borderColor: color,
          borderRadius: 3,
          backgroundColor: 'transparent',
          position: 'absolute',
          top: size * 0.16,
        }}
      />
    </View>
  );
}

export const ClipIcon = PasteIcon;

export function PlayFilledIcon({ size = 20, color = '#FFFFFF' }: IconProps) {
  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: color,
        'aria-hidden': 'true',
      },
      React.createElement('path', {
        d: 'M8 5.5v13l10.5-6.5L8 5.5Z',
      }),
    );
  }
  const h = size * 0.55;
  const w = size * 0.45;
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: 0,
          height: 0,
          borderTopWidth: h / 2,
          borderBottomWidth: h / 2,
          borderLeftWidth: w,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: color,
          marginLeft: size * 0.08,
        }}
      />
    </View>
  );
}

export const PlayIcon = PlayFilledIcon;

export function CheckIcon({ size = 18, color = '#0D7A5F' }: IconProps) {
  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2.4',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      React.createElement('path', { d: 'M5 12.5l4.5 4.5L19 7.5' }),
    );
  }
  const stroke = Math.max(2, Math.round(size * 0.1));
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.48,
          height: size * 0.26,
          borderBottomWidth: stroke,
          borderLeftWidth: stroke,
          borderColor: color,
          transform: [{ rotate: '-45deg' }],
          marginBottom: size * 0.1,
        }}
      />
    </View>
  );
}

export function ShareIcon({ size = 18, color = '#525860' }: IconProps) {
  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      React.createElement('path', { d: 'M4 12v7a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-7' }),
      React.createElement('polyline', { points: '16 6 12 2 8 6' }),
      React.createElement('line', { x1: '12', y1: '2', x2: '12', y2: '15' }),
    );
  }
  return <DownloadIcon size={size} color={color} />;
}

export function OpenIcon({ size = 18, color = '#525860' }: IconProps) {
  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      React.createElement('path', { d: 'M14 4h6v6' }),
      React.createElement('path', { d: 'M20 4l-8.5 8.5' }),
      React.createElement('path', { d: 'M19 14v4.5A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-11A1.5 1.5 0 0 1 6.5 6H11' }),
    );
  }
  return <ShareIcon size={size} color={color} />;
}

export function VideoIcon({ size = 16, color = '#525860' }: IconProps) {
  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      React.createElement('rect', { x: '2.5', y: '5.5', width: '13.5', height: '13', rx: '2.5' }),
      React.createElement('path', { d: 'M16 10l5.5-3v10L16 14v-4Z' }),
    );
  }
  return <PlayIcon size={size} color={color} />;
}

export function AudioIcon({ size = 16, color = '#525860' }: IconProps) {
  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      React.createElement('path', { d: 'M9 18V5l12-2v13' }),
      React.createElement('circle', { cx: '6', cy: '18', r: '3' }),
      React.createElement('circle', { cx: '18', cy: '16', r: '3' }),
    );
  }
  return <PlayIcon size={size} color={color} />;
}

export function BoltIcon({ size = 16, color = '#0D7A5F' }: IconProps) {
  if (isWeb) {
    return React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      React.createElement('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' }),
    );
  }
  return <PlayIcon size={size} color={color} />;
}

export function CloseIcon({ size = 20, color = '#525860' }: IconProps) {
  const stroke = Math.max(2, Math.round(size * 0.09));
  return (
    <View style={[styles.center, { width: size, height: size }]}>
      <View
        style={{
          width: size * 0.6,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          position: 'absolute',
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          width: size * 0.6,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
          position: 'absolute',
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

export function PlatformIcon({
  id,
  size = 22,
  color = '#111315',
}: {
  id: string;
  size?: number;
  color?: string;
}) {
  const normId = id.toLowerCase();

  if (isWeb) {
    switch (normId) {
      case 'tiktok':
        return React.createElement(
          'svg',
          { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true', style: { flexShrink: 0 } },
          React.createElement('rect', { width: '24', height: '24', rx: '6', fill: '#010101' }),
          React.createElement('path', {
            d: 'M14.2 6.2v7.2a2.8 2.8 0 1 1-2.2-2.74',
            stroke: '#25F4EE',
            strokeWidth: '1.9',
            strokeLinecap: 'round',
          }),
          React.createElement('path', {
            d: 'M13.6 6.6v7.2a2.8 2.8 0 1 1-2.2-2.74',
            stroke: '#FE2C55',
            strokeWidth: '1.9',
            strokeLinecap: 'round',
          }),
          React.createElement('path', {
            d: 'M13.9 6.4c.7 1.9 2.2 3.2 4.1 3.4',
            stroke: '#FFFFFF',
            strokeWidth: '1.8',
            strokeLinecap: 'round',
          }),
          React.createElement('circle', { cx: '9.8', cy: '15.6', r: '2.4', fill: '#FFFFFF' }),
        );
      case 'youtube':
        return React.createElement(
          'svg',
          { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true', style: { flexShrink: 0 } },
          React.createElement('rect', { x: '1.5', y: '4', width: '21', height: '16', rx: '4.5', fill: '#FF0000' }),
          React.createElement('polygon', { points: '10 8.5 16 12 10 15.5', fill: '#FFFFFF' }),
        );
      case 'instagram':
        return React.createElement(
          'svg',
          { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true', style: { flexShrink: 0 } },
          React.createElement(
            'defs',
            null,
            React.createElement(
              'linearGradient',
              { id: `ig-grad-${size}`, x1: '0%', y1: '100%', x2: '100%', y2: '0%' },
              React.createElement('stop', { offset: '0%', stopColor: '#FCB045' }),
              React.createElement('stop', { offset: '40%', stopColor: '#FD1D1D' }),
              React.createElement('stop', { offset: '100%', stopColor: '#833AB4' }),
            ),
          ),
          React.createElement('rect', { width: '24', height: '24', rx: '6', fill: `url(#ig-grad-${size})` }),
          React.createElement('rect', {
            x: '5.5',
            y: '5.5',
            width: '13',
            height: '13',
            rx: '3.8',
            stroke: '#FFFFFF',
            strokeWidth: '1.8',
          }),
          React.createElement('circle', { cx: '12', cy: '12', r: '3.2', stroke: '#FFFFFF', strokeWidth: '1.8' }),
          React.createElement('circle', { cx: '15.8', cy: '8.2', r: '1.1', fill: '#FFFFFF' }),
        );
      case 'x':
      case 'twitter':
        return React.createElement(
          'svg',
          { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true', style: { flexShrink: 0 } },
          React.createElement('rect', { width: '24', height: '24', rx: '6', fill: '#000000' }),
          React.createElement('rect', { x: '0.5', y: '0.5', width: '23', height: '23', rx: '5.5', stroke: 'rgba(255,255,255,0.18)', strokeWidth: '1' }),
          React.createElement('path', {
            d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
            transform: 'scale(0.72) translate(4.5, 4.5)',
            fill: '#FFFFFF',
          }),
        );
      default:
        break;
    }
  }

  const s = size;
  const rad = Math.round(s * 0.26);

  switch (normId) {
    case 'tiktok': {
      const renderNote = (tone: string, dx: number, dy: number, isCore = false) => (
        <View
          key={tone}
          style={{
            position: 'absolute',
            width: Math.round(s * 0.54),
            height: Math.round(s * 0.68),
            left: Math.round(s * 0.24) + dx,
            top: Math.round(s * 0.16) + dy,
          }}
        >
          {/* Note Stem */}
          <View
            style={{
              position: 'absolute',
              left: Math.round(s * 0.23),
              top: 0,
              width: Math.max(1.8, Math.round(s * 0.11)),
              height: Math.round(s * 0.44),
              backgroundColor: tone,
              borderRadius: 1,
            }}
          />
          {/* Note Top Hook */}
          <View
            style={{
              position: 'absolute',
              left: Math.round(s * 0.23),
              top: 0,
              width: Math.round(s * 0.28),
              height: Math.round(s * 0.22),
              borderTopWidth: Math.max(1.8, Math.round(s * 0.11)),
              borderRightWidth: Math.max(1.8, Math.round(s * 0.11)),
              borderColor: tone,
              borderTopRightRadius: Math.round(s * 0.16),
            }}
          />
          {/* Note Head Circle */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: Math.round(s * 0.30),
              height: Math.round(s * 0.26),
              borderRadius: Math.round(s * 0.13),
              backgroundColor: tone,
              transform: [{ rotate: '-18deg' }],
            }}
          />
        </View>
      );

      return (
        <View
          style={{
            width: s,
            height: s,
            borderRadius: rad,
            backgroundColor: '#010101',
            overflow: 'hidden',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {renderNote('#25F4EE', -1, 1)}
          {renderNote('#FE2C55', 1, -1)}
          {renderNote('#FFFFFF', 0, 0, true)}
        </View>
      );
    }
    case 'youtube': {
      const ytH = Math.round(s * 0.74);
      return (
        <View
          style={{
            width: s,
            height: ytH,
            borderRadius: Math.round(s * 0.22),
            backgroundColor: '#FF0000',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <View
            style={{
              width: 0,
              height: 0,
              borderTopWidth: Math.round(s * 0.16),
              borderBottomWidth: Math.round(s * 0.16),
              borderLeftWidth: Math.round(s * 0.28),
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: '#FFFFFF',
              marginStart: Math.round(s * 0.05),
            }}
          />
        </View>
      );
    }
    case 'instagram': {
      const outerSize = Math.round(s * 0.62);
      const strokeW = Math.max(1.6, Math.round(s * 0.08));
      const lensSize = Math.round(s * 0.28);
      const dotSize = Math.max(2, Math.round(s * 0.09));

      return (
        <View
          style={{
            width: s,
            height: s,
            borderRadius: rad,
            backgroundColor: '#E1306C',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Sunset Gradient Simulation */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#833AB4',
              opacity: 0.6,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#FCB045',
              opacity: 0.45,
              transform: [{ rotate: '45deg' }, { scale: 1.4 }],
            }}
          />
          {/* Outer Rounded Camera Square */}
          <View
            style={{
              width: outerSize,
              height: outerSize,
              borderRadius: Math.round(outerSize * 0.32),
              borderWidth: strokeW,
              borderColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Center Lens */}
            <View
              style={{
                width: lensSize,
                height: lensSize,
                borderRadius: lensSize / 2,
                borderWidth: strokeW,
                borderColor: '#FFFFFF',
              }}
            />
            {/* Flash Dot */}
            <View
              style={{
                position: 'absolute',
                top: Math.round(outerSize * 0.12),
                right: Math.round(outerSize * 0.12),
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: '#FFFFFF',
              }}
            />
          </View>
        </View>
      );
    }
    case 'x':
    case 'twitter': {
      const barH = Math.round(s * 0.70);
      const stroke1 = Math.max(2, Math.round(s * 0.15));
      const stroke2 = Math.max(2, Math.round(s * 0.10));

      return (
        <View
          style={{
            width: s,
            height: s,
            borderRadius: rad,
            backgroundColor: '#000000',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.16)',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <View
            style={{
              position: 'absolute',
              width: stroke1,
              height: barH,
              backgroundColor: '#FFFFFF',
              borderRadius: 1,
              transform: [{ rotate: '42deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: stroke2,
              height: barH,
              backgroundColor: '#FFFFFF',
              borderRadius: 1,
              transform: [{ rotate: '-42deg' }],
            }}
          />
        </View>
      );
    }
    default:
      return (
        <View
          style={{
            width: s,
            height: s,
            borderRadius: rad,
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      );
  }
}

export function PlatformDot({ color, size = 9 }: { color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  logoPlay: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  logoVLeft: {
    position: 'absolute',
  },
  logoVRight: {
    position: 'absolute',
  },
});
