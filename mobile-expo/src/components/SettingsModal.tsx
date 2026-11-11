import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CloseIcon, CheckIcon } from './Icons.tsx';
import { tokens, radii, type ThemeMode } from '../theme/tokens.ts';
import { copy } from '../i18n/copy.ts';

type Props = {
  visible: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onToggleTheme: (mode: ThemeMode) => void;
  serverUrl: string;
  onServerUrlChange: (url: string) => void;
  onTestConnection: () => Promise<boolean>;
  connStatus: 'idle' | 'checking' | 'connected' | 'failed';
};

export default function SettingsModal({
  visible,
  onClose,
  themeMode,
  onToggleTheme,
  serverUrl,
  onServerUrlChange,
  onTestConnection,
  connStatus,
}: Props) {
  const t = tokens[themeMode];
  const c = copy.ar;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: t.surface,
              borderColor: t.line,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.modalTitle, { color: t.ink }]}>{c.settings}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: t.surfaceAlt }]}
              accessibilityLabel={c.close}
            >
              <CloseIcon size={18} color={t.ink} />
            </TouchableOpacity>
          </View>

          {/* Theme Switcher */}
          <Text style={[styles.sectionHeading, { color: t.ink }]}>مظهر التطبيق</Text>
          <View style={styles.themeRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onToggleTheme('light')}
              style={[
                styles.themeBtn,
                {
                  backgroundColor: themeMode === 'light' ? t.primary : t.surfaceAlt,
                },
              ]}
            >
              <Text
                style={[
                  styles.themeBtnText,
                  { color: themeMode === 'light' ? t.onPrimary : t.ink },
                ]}
              >
                {c.themeLight} (نهاري)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onToggleTheme('dark')}
              style={[
                styles.themeBtn,
                {
                  backgroundColor: themeMode === 'dark' ? t.primary : t.surfaceAlt,
                },
              ]}
            >
              <Text
                style={[
                  styles.themeBtnText,
                  { color: themeMode === 'dark' ? t.onPrimary : t.ink },
                ]}
              >
                {c.themeDark} (ليلي)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Server Settings */}
          <Text style={[styles.sectionHeading, { color: t.ink }]}>{c.serverUrl}</Text>
          <TextInput
            value={serverUrl}
            onChangeText={onServerUrlChange}
            placeholder="https://..."
            placeholderTextColor={t.muted}
            autoCapitalize="none"
            autoCorrect={false}
            dir="ltr"
            style={[
              styles.serverInput,
              {
                color: t.ink,
                backgroundColor: t.surfaceAlt,
                borderColor: t.line,
              },
            ]}
          />

          {/* Connection Status and Test */}
          <View style={styles.statusRow}>
            <View style={styles.statusInfo}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      connStatus === 'connected'
                        ? '#00D4C8'
                        : connStatus === 'checking'
                        ? t.accent
                        : '#FF2E2E',
                  },
                ]}
              />
              <Text style={[styles.statusText, { color: t.muted }]}>
                {connStatus === 'connected'
                  ? c.serverConnected
                  : connStatus === 'checking'
                  ? c.serverChecking
                  : c.serverOffline}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onTestConnection}
              style={[styles.testBtn, { backgroundColor: t.accentLight }]}
            >
              <Text style={[styles.testBtnText, { color: t.accentText }]}>{c.testConnection}</Text>
            </TouchableOpacity>
          </View>

          {/* Done Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onClose}
            style={[styles.doneBtn, { backgroundColor: t.primary }]}
          >
            <Text style={[styles.doneBtnText, { color: t.onPrimary }]}>{c.close}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 10,
    marginTop: 6,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  themeBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  serverInput: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  testBtn: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    minHeight: 52,
    borderRadius: radii.btn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
