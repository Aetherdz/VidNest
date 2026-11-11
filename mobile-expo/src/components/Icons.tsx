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
      React.createElement('rect', {
        width: '40',
        height: '40',
        rx: '11',
        fill: '#0F172A',
      }),
      React.createElement('rect', {
        x: '1',
        y: '1',
        width: '38',
        height: '38',
        rx: '10',
        stroke: '#FB923C',
        strokeOpacity: '0.42',
        strokeWidth: '1.2',
      }),
      React.createElement('path', {
        d: 'M11.5 14.5L20 29L28.5 14.5',
        stroke: '#FAF7F2',
        strokeWidth: '3.2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
      React.createElement('path', {
        d: 'M17.5 11.5L24.5 15.5L17.5 19.5V11.5Z',
        fill: '#FB923C',
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
  size = 15,
  color = '#111315',
}: {
  id: string;
  size?: number;
  color?: string;
}) {
  if (isWeb) {
    switch (id) {
      case 'youtube':
        return React.createElement(
          'svg',
          { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' },
          React.createElement('rect', {
            x: '2',
            y: '4.5',
            width: '20',
            height: '15',
            rx: '4.5',
            stroke: color,
            strokeWidth: '2',
          }),
          React.createElement('polygon', {
            points: '10 9 15.5 12 10 15 10 9',
            fill: color,
          }),
        );
      case 'tiktok':
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
          React.createElement('path', {
            d: 'M14 4v11.2a3.8 3.8 0 1 1-3.2-3.75',
          }),
          React.createElement('path', {
            d: 'M14 4c.9 2.6 2.9 4.3 5.5 4.5',
          }),
        );
      case 'instagram':
        return React.createElement(
          'svg',
          {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: '2',
            'aria-hidden': 'true',
          },
          React.createElement('rect', { x: '3', y: '3', width: '18', height: '18', rx: '5' }),
          React.createElement('circle', { cx: '12', cy: '12', r: '4' }),
          React.createElement('circle', { cx: '17.5', cy: '6.5', r: '1.2', fill: color, stroke: 'none' }),
        );
      case 'x':
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
            'aria-hidden': 'true',
          },
          React.createElement('path', { d: 'M4.5 4.5l15 15M19.5 4.5l-15 15' }),
        );
      case 'facebook':
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
          React.createElement('path', {
            d: 'M15.5 4H13a3.5 3.5 0 0 0-3.5 3.5V11H7v3.5h2.5V21h3.8v-6.5H16L16.5 11h-3.2V7.8c0-.7.3-1.1 1.1-1.1h1.1V4Z',
          }),
        );
      case 'soundcloud':
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
            d: 'M11 17h7.2a3.3 3.3 0 0 0 .4-6.57A5 5 0 0 0 11 7.5V17Z',
          }),
          React.createElement('line', { x1: '4', y1: '12.5', x2: '4', y2: '16.5' }),
          React.createElement('line', { x1: '7.5', y1: '9.5', x2: '7.5', y2: '17' }),
        );
      default:
        break;
    }
  }

  return (
    <View
      style={{
        width: size * 0.65,
        height: size * 0.65,
        borderRadius: size * 0.35,
        backgroundColor: color,
      }}
    />
  );
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
