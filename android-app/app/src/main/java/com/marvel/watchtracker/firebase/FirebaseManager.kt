package com.marvel.watchtracker.firebase

import android.util.Log
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

object FirebaseManager {
    private const val TAG = "FirebaseManager"
    private const val CLOUD_COLLECTION = "marvel_tracker"
    private const val DEFAULT_DOC_ID = "watchProgress"

    val auth: FirebaseAuth by lazy { FirebaseAuth.getInstance() }
    val firestore: FirebaseFirestore by lazy { FirebaseFirestore.getInstance() }

    val currentUser: FirebaseUser?
        get() = auth.currentUser

    fun observeAuthState(): Flow<FirebaseUser?> = callbackFlow {
        val listener = FirebaseAuth.AuthStateListener { firebaseAuth ->
            trySend(firebaseAuth.currentUser)
        }
        auth.addAuthStateListener(listener)
        awaitClose { auth.removeAuthStateListener(listener) }
    }

    fun observeWatchedProgress(userId: String? = currentUser?.uid): Flow<Map<String, String>> = callbackFlow {
        val docRef = if (userId != null) {
            firestore.collection("users").document(userId)
                .collection("watchProgress").document(DEFAULT_DOC_ID)
        } else {
            firestore.collection(CLOUD_COLLECTION).document(DEFAULT_DOC_ID)
        }

        val registration: ListenerRegistration = docRef.addSnapshotListener { snapshot, error ->
            if (error != null) {
                Log.e(TAG, "Error listening to Firestore progress snapshot", error)
                return@addSnapshotListener
            }

            if (snapshot != null && snapshot.exists()) {
                val data = snapshot.get("watchedIds")
                if (data is Map<*, *>) {
                    @Suppress("UNCHECKED_CAST")
                    val map = data as Map<String, String>
                    trySend(map)
                }
            }
        }

        awaitClose { registration.remove() }
    }

    fun toggleWatchedItem(currentMap: Map<String, String>, itemId: String, userId: String? = currentUser?.uid) {
        val updatedMap = currentMap.toMutableMap()
        if (updatedMap.containsKey(itemId)) {
            updatedMap.remove(itemId)
        } else {
            val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
            updatedMap[itemId] = isoFormat.format(Date())
        }

        saveWatchedProgress(updatedMap, userId)
    }

    fun saveWatchedProgress(watchedMap: Map<String, String>, userId: String? = currentUser?.uid) {
        val docRef = if (userId != null) {
            firestore.collection("users").document(userId)
                .collection("watchProgress").document(DEFAULT_DOC_ID)
        } else {
            firestore.collection(CLOUD_COLLECTION).document(DEFAULT_DOC_ID)
        }

        val payload = mapOf(
            "watchedIds" to watchedMap,
            "updatedAt" to SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }.format(Date())
        )

        docRef.set(payload)
            .addOnSuccessListener { Log.d(TAG, "Successfully synced watch progress to Firestore") }
            .addOnFailureListener { e -> Log.e(TAG, "Failed to sync watch progress to Firestore", e) }
    }
}
