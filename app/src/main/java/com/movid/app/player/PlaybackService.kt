package com.movid.app.player

import android.app.PendingIntent
import android.content.Intent
import android.os.Process
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService

/**
 * Owns the single ExoPlayer instance behind a MediaSession: playback keeps
 * running with the screen off or the app in the background, and the system
 * media notification (play/pause/next) is provided by MediaSessionService.
 */
class PlaybackService : MediaSessionService() {

    private var mediaSession: MediaSession? = null

    override fun onCreate() {
        super.onCreate()
        val player = ExoPlayer.Builder(this)
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setContentType(C.AUDIO_CONTENT_TYPE_MOVIE)
                    .setUsage(C.USAGE_MEDIA)
                    .build(),
                /* handleAudioFocus = */ true,
            )
            .setHandleAudioBecomingNoisy(true)
            .build()
        mediaSession = MediaSession.Builder(this, player)
            .setSessionActivity(
                PendingIntent.getActivity(
                    this,
                    0,
                    Intent(this, PlayerActivity::class.java)
                        .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                ),
            )
            .setCallback(
                object : MediaSession.Callback {
                    override fun onConnect(
                        session: MediaSession,
                        controller: MediaSession.ControllerInfo,
                    ): MediaSession.ConnectionResult =
                        if (isOwnOrTrusted(controller)) {
                            MediaSession.ConnectionResult
                                .AcceptedResultBuilder(session)
                                .build()
                        } else {
                            MediaSession.ConnectionResult.reject()
                        }
                },
            )
            .build()
    }

    // Least privilege. `packageName` is never trusted — media3 takes it from
    // the client-supplied connection request, so it can be spoofed; `uid` is
    // Binder-derived and cannot. onGetSession additionally accepts media3's
    // synthetic internal callers (uid == Process.INVALID_UID): media3 uses
    // this same lookup to dispatch media-button intents (headset resume after
    // the process was killed), so rejecting them would break media buttons.
    // Those synthetic callers never obtain a real connection — `onConnect`
    // above accepts only own-uid or platform-trusted identities, so any
    // third party that still reaches the legacy binder is disconnected.
    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? =
        if (isOwnOrTrusted(controllerInfo) || controllerInfo.uid == Process.INVALID_UID) {
            mediaSession
        } else {
            null
        }

    private fun isOwnOrTrusted(controller: MediaSession.ControllerInfo): Boolean =
        controller.uid == Process.myUid() || controller.isTrusted

    override fun onTaskRemoved(rootIntent: Intent?) {
        val player = mediaSession?.player
        if (player == null || !player.playWhenReady || player.mediaItemCount == 0) {
            stopSelf()
        }
    }

    override fun onDestroy() {
        mediaSession?.run {
            player.release()
            release()
        }
        mediaSession = null
        super.onDestroy()
    }
}
