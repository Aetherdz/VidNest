package com.movid.app

import android.app.Application

class MovidApp : Application() {
    override fun onCreate() {
        super.onCreate()
        AppGraph.init(this)
    }
}