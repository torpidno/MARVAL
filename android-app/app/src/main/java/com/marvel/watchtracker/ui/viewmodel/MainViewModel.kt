package com.marvel.watchtracker.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseUser
import com.marvel.watchtracker.data.MarvelData
import com.marvel.watchtracker.data.MarvelItem
import com.marvel.watchtracker.firebase.FirebaseManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class SortMode {
    CHRONOLOGICAL,
    RELEASE_ORDER
}

data class TrackerStats(
    val totalCount: Int = MarvelData.items.size,
    val watchedCount: Int = 0,
    val progressPercent: Int = 0,
    val watchedHours: String = "0.0",
    val totalHours: String = "0.0"
)

class MainViewModel : ViewModel() {

    private val _currentUser = MutableStateFlow<FirebaseUser?>(FirebaseManager.currentUser)
    val currentUser: StateFlow<FirebaseUser?> = _currentUser.asStateFlow()

    private val _watchedIds = MutableStateFlow<Map<String, String>>(emptyMap())
    val watchedIds: StateFlow<Map<String, String>> = _watchedIds.asStateFlow()

    private val _sortMode = MutableStateFlow(SortMode.CHRONOLOGICAL)
    val sortMode: StateFlow<SortMode> = _sortMode.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _typeFilter = MutableStateFlow<String?>(null) // "movie", "series", "special"
    val typeFilter: StateFlow<String?> = _typeFilter.asStateFlow()

    private val _phaseFilter = MutableStateFlow<Int?>(null)
    val phaseFilter: StateFlow<Int?> = _phaseFilter.asStateFlow()

    val filteredItems: StateFlow<List<MarvelItem>> = combine(
        _watchedIds, _sortMode, _searchQuery, _typeFilter, _phaseFilter
    ) { _, sort, query, type, phase ->
        var list = MarvelData.items

        if (query.isNotBlank()) {
            val q = query.trim().lowercase()
            list = list.filter {
                it.title.lowercase().contains(q) ||
                it.overview.lowercase().contains(q) ||
                it.id.lowercase().contains(q) ||
                it.characters.any { c -> c.lowercase().contains(q) }
            }
        }

        if (type != null) {
            list = list.filter { it.type == type }
        }

        if (phase != null) {
            list = list.filter { it.phase == phase }
        }

        if (sort == SortMode.CHRONOLOGICAL) {
            list.sortedBy { it.chronoOrder }
        } else {
            list.sortedBy { it.releaseOrder }
        }
    }.stateIn(viewModelScope, SharingStarted.Lazily, MarvelData.items)

    val stats: StateFlow<TrackerStats> = combine(_watchedIds) { (watched) ->
        val watchedCount = watched.size
        val totalCount = MarvelData.items.size
        val percent = if (totalCount > 0) ((watchedCount.toFloat() / totalCount) * 100).toInt() else 0

        var watchedMinutes = 0
        var totalMinutes = 0

        MarvelData.items.forEach { item ->
            totalMinutes += item.minutes
            if (watched.containsKey(item.id)) {
                watchedMinutes += item.minutes
            }
        }

        TrackerStats(
            totalCount = totalCount,
            watchedCount = watchedCount,
            progressPercent = percent,
            watchedHours = String.format("%.1f", watchedMinutes / 60.0f),
            totalHours = String.format("%.1f", totalMinutes / 60.0f)
        )
    }.stateIn(viewModelScope, SharingStarted.Lazily, TrackerStats())

    init {
        // Observe Auth Changes
        viewModelScope.launch {
            FirebaseManager.observeAuthState().collect { user ->
                _currentUser.value = user
                observeFirestore(user?.uid)
            }
        }

        // Initial snapshot listener
        observeFirestore(FirebaseManager.currentUser?.uid)
    }

    private fun observeFirestore(userId: String?) {
        viewModelScope.launch {
            FirebaseManager.observeWatchedProgress(userId).collect { map ->
                _watchedIds.value = map
            }
        }
    }

    fun toggleWatched(itemId: String) {
        val current = _watchedIds.value
        FirebaseManager.toggleWatchedItem(current, itemId, _currentUser.value?.uid)
    }

    fun setSortMode(mode: SortMode) {
        _sortMode.value = mode
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setTypeFilter(type: String?) {
        _typeFilter.value = type
    }

    fun setPhaseFilter(phase: Int?) {
        _phaseFilter.value = phase
    }
}
