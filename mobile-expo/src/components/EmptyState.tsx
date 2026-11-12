import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { tokens, radii, fonts, type ThemeMode } from '../theme/tokens.ts';

type Props = {
  themeMode: ThemeMode;
  icon: React.ReactNode;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Shared empty state: one icon, one headline, one line of copy, one action. */
export default function EmptyState({
  themeMode,
  icon,
  title,
  body,
  actionLabel,
  onAction,
}: Props) {
  const t = tokens[themeMode];

  return (
    <View style={[styles.box, { backgroundColor: t.surface, borderColor: t.line }]}>
      <View style={[styles.iconWrap, { backgroundColor: t.surfaceAlt }]}>{icon}</View>
      <Text style={[styles.title, { color: t.ink }]}>{title}</Text>
      <Text style={[styles.body, { color: t.muted }]}>{body}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.action, { borderColor: t.line }]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          activeOpacity={0.85}
        >
          <Text style={[styles.actionLabel, { color: t.ink }]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: radii.card,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 320,
  },
  action: {
    marginTop: 10,
    minHeight: 40,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    fontWeight: '600',
  },
});
