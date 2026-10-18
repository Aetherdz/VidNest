package com.movid.app

import android.content.Context
import com.movid.app.data.AppDatabase
import com.movid.app.data.DownloadRepository
import com.movid.app.engine.FetchEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/** Manual DI: one process-wide graph, initialized in [MovidApp.onCreate]. */
object AppGraph {

    private const val ENGINE_PREFS = "movid_engine"
    private const val KEY_LAST_YTDLP_UPDATE = "ytdlp_last_update_at"
    private const val UPDATE_INTERVAL_MS = 24L * 60 * 60 * 1000

    lateinit var appContext: Context
        private set

    lateinit var database: AppDatabase
        private set

    lateinit var repository: DownloadRepository
        private set

    lateinit var fetchEngine: FetchEngine
        private set

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    fun init(context: Context) {
        if (this::repository.isInitialized) return
        val app = context.applicationContext
        appContext = app
        database = AppDatabase.open(app)
        repository = DownloadRepository(database.downloads())
        fetchEngine = FetchEngine(app)
        scope.launch(Dispatchers.IO) {
            repository.restore()
            maybeUpdateEngine()
        }
    }

    /** Refreshes yt-dlp at most once a day; failures are ignored offline. */
    private fun maybeUpdateEngine() {
        val prefs = appContext.getSharedPreferences(ENGINE_PREFS, Context.MODE_PRIVATE)
        val last = prefs.getLong(KEY_LAST_YTDLP_UPDATE, 0L)
        if (System.currentTimeMillis() - last < UPDATE_INTERVAL_MS) return
        if (fetchEngine.updateBinary()) {
            prefs.edit().putLong(KEY_LAST_YTDLP_UPDATE, System.currentTimeMillis()).apply()
        }
    }
}