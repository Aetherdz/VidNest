import React from 'react';
import { StyleSheet, View } from 'react-native';

type IconProps = {
  size?: number;
  color?: string;
};

export function VidNestLogo({ size = 38 }: { size?: number }) {
  const s = size;
  const radius = Math.round(s * 0.3);

  return (
    <View
      style={[
        styles.logoContainer,
        {
          width: s,
          height: s,
          borderRadius: radius,
          backgroundColor: '#0F2A24',
        },
      ]}
    >
      {/* Lime play triangle */}
      <View
        style={[
          styles.logoPlay,
          {
            top: s * 0.22,
            left: s * 0.40,
            borderTopWidth: s * 0.12,
            borderBottomWidth: s * 0.12,
            borderLeftWidth: s * 0.20,
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: '#B6F36B',
          },
        ]}
      />
      {/* Mint 'V' shape */}
      <View
        style={[
          styles.logoVLeft,
          {
            width: s * 0.09,
            height: s * 0.38,
            backgroundColor: '#CFF5E3',
            left: s * 0.24,
            top: s * 0.36,
            borderRadius: s * 0.05,
            transform: [{ rotate: '-28deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.logoVRight,
          {
            width: s * 0.09,
            height: s * 0.38,
            backgroundColor: '#CFF5E3',
            right: s * 0.24,
            top: s * 0.36,
            borderRadius: s * 0.05,
            transform: [{ rotate: '28deg' }],
          },
        ]}
      />
    </View>
  );
}

export function HomeIcon({ size = 24, color = '#6D6980' }: IconProps) {
  const stroke = Math.max(2, Math.round(size * 0.08));

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Roof */}
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
      {/* House Body */}
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

export function DownloadIcon({ size = 24, color = '#6D6980' }: IconProps) {
  const stroke = Math.max(2, Math.round(size * 0.08));

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Vertical arrow shaft */}
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
      {/* Arrowhead chevron */}
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
      {/* Bottom base tray */}
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

export function LibraryIcon({ size = 24, color = '#6D6980' }: IconProps) {
  const stroke = Math.max(2, Math.round(size * 0.08));

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Card outline */}
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
        {/* Play triangle inside */}
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

export function MenuIcon({ size = 24, color = '#14121F' }: IconProps) {
  const stroke = Math.max(2, Math.round(size * 0.09));

  return (
    <View style={[styles.center, { width: size, height: size, justifyContent: 'space-between', paddingVertical: size * 0.24 }]}>
      <View style={{ width: size * 0.62, height: stroke, backgroundColor: color, borderRadius: stroke / 2 }} />
      <View style={{ width: size * 0.62, height: stroke, backgroundColor: color, borderRadius: stroke / 2 }} />
      <View style={{ width: size * 0.38, height: stroke, backgroundColor: color, borderRadius: stroke / 2, alignSelf: 'flex-start', marginStart: size * 0.19 }} />
    </View>
  );
}

export function ClipIcon({ size = 24, color = '#6A4CFF' }: IconProps) {
  const stroke = Math.max(2, Math.round(size * 0.08));

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* Clipboard board */}
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
      {/* Top clip holder */}
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

export function PlayIcon({ size = 24, color = '#FFFFFF' }: IconProps) {
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

export function CheckIcon({ size = 20, color = '#0F2A24' }: IconProps) {
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

export function CloseIcon({ size = 20, color = '#6D6980' }: IconProps) {
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
