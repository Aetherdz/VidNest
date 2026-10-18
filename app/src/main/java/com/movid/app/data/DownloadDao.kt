package com.movid.app.data

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import kotlinx.coroutines.flow.Flow

@Dao
interface DownloadDao {

    @Query("SELECT * FROM downloads ORDER BY createdAt ASC")
    fun observeAll(): Flow<List<DownloadEntity>>

    @Query("SELECT * FROM downloads ORDER BY createdAt ASC")
    suspend fun all(): List<DownloadEntity>

    @Upsert
    suspend fun upsert(item: DownloadEntity)

    @Query("DELETE FROM downloads WHERE id = :id")
    suspend fun delete(id: String)

    /** Crash recovery: RUNNING rows have no worker after a process death. */
    @Query("UPDATE downloads SET state = 'QUEUED', progress = 0.0 WHERE state = 'RUNNING'")
    suspend fun requeueOrphanedRuns()
}
