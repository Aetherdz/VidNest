import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Thin adapter around the storage permission check.
///
/// This Flutter project ships no permission plugin and no native permission
/// channel (the real downloader lives in `mobile-expo/`). The adapter keeps the
/// UI honest:
/// - `true`  -> already granted
/// - `false` -> explicitly refused
/// - `null`  -> the platform cannot answer (no channel installed)
///
/// The native contract expected by [PlatformStoragePermission] is documented in
/// `lib/ui/README.md`. Until that channel exists, `null` is treated as in-app
/// consent only, never as proof of an OS grant.
abstract class StoragePermission {
  Future<bool?> hasAllFilesAccess();

  Future<bool?> requestAllFilesAccess();
}

class PlatformStoragePermission implements StoragePermission {
  static const MethodChannel _channel =
      MethodChannel('vidnest/storage_permission');

  @override
  Future<bool?> hasAllFilesAccess() async {
    try {
      return await _channel.invokeMethod<bool>('hasAllFilesAccess');
    } on MissingPluginException {
      return null;
    } on PlatformException {
      return null;
    }
  }

  @override
  Future<bool?> requestAllFilesAccess() async {
    try {
      return await _channel.invokeMethod<bool>('requestAllFilesAccess');
    } on MissingPluginException {
      return null;
    } on PlatformException {
      return null;
    }
  }
}

final storagePermissionProvider = Provider<StoragePermission>(
  (ref) => PlatformStoragePermission(),
);
