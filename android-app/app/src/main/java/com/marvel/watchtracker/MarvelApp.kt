package com.marvel.watchtracker

import android.app.Application
import com.google.firebase.FirebaseApp

class MarvelApp : Application() {
    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)
    }
}
