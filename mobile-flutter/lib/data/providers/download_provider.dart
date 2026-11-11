import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../extractors/mock_extractor.dart';
import '../models/download_task.dart';
import '../models/media_item.dart';
import '../repositories/download_repository.dart';

final downloadRepositoryProvider = Provider<DownloadRepository>((ref) {
  final repo = DownloadRepository();
  ref.onDispose(repo.dispose);
  return repo;
});

final downloadTasksProvider = StreamProvider<List<DownloadTask>>((ref) {
  final repo = ref.watch(downloadRepositoryProvider);
  return repo.watchTasks();
});

final allTasksListProvider = Provider<List<DownloadTask>>((ref) {
  final asyncTasks = ref.watch(downloadTasksProvider);
  return asyncTasks.value ?? ref.read(downloadRepositoryProvider).allTasks;
});

final activeTasksProvider = Provider<List<DownloadTask>>((ref) {
  return ref.watch(allTasksListProvider).where((t) => t.isActive).toList();
});

final completedTasksProvider = Provider<List<DownloadTask>>((ref) {
  return ref.watch(allTasksListProvider).where((t) => t.isCompleted).toList();
});

final failedTasksProvider = Provider<List<DownloadTask>>((ref) {
  return ref.watch(allTasksListProvider).where((t) => t.isFailed).toList();
});

// Media Analysis State
class AnalysisState {
  const AnalysisState({
    this.isAnalyzing = false,
    this.media,
    this.errorMessage,
  });

  final bool isAnalyzing;
  final MediaItem? media;
  final String? errorMessage;
}

class MediaAnalysisNotifier extends StateNotifier<AnalysisState> {
  MediaAnalysisNotifier() : super(const AnalysisState());

  final _extractor = const UniversalMediaExtractor();

  Future<MediaItem?> analyze(String url) async {
    state = const AnalysisState(isAnalyzing: true);
    try {
      final media = await _extractor.extract(url);
      state = AnalysisState(isAnalyzing: false, media: media);
      return media;
    } catch (e) {
      state = AnalysisState(isAnalyzing: false, errorMessage: e.toString());
      return null;
    }
  }

  void selectFormat(String formatId) {
    if (state.media != null) {
      state = AnalysisState(
        isAnalyzing: false,
        media: state.media!.copyWith(selectedFormatId: formatId),
      );
    }
  }

  void clear() {
    state = const AnalysisState();
  }
}

final mediaAnalysisProvider = StateNotifierProvider<MediaAnalysisNotifier, AnalysisState>((ref) {
  return MediaAnalysisNotifier();
});
