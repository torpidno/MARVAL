package com.marvel.watchtracker

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.marvel.watchtracker.data.MarvelItem
import com.marvel.watchtracker.ui.components.AuthDialog
import com.marvel.watchtracker.ui.components.DetailBottomSheet
import com.marvel.watchtracker.ui.components.TopNavBar
import com.marvel.watchtracker.ui.screens.DashboardScreen
import com.marvel.watchtracker.ui.screens.TimelineScreen
import com.marvel.watchtracker.ui.theme.BackgroundDark
import com.marvel.watchtracker.ui.theme.BorderDark
import com.marvel.watchtracker.ui.theme.MarvelGold
import com.marvel.watchtracker.ui.theme.MarvelWatchTrackerTheme
import com.marvel.watchtracker.ui.theme.SurfaceDark
import com.marvel.watchtracker.ui.theme.TextMuted
import com.marvel.watchtracker.ui.theme.TextSecondary
import com.marvel.watchtracker.ui.viewmodel.MainViewModel
import com.marvel.watchtracker.ui.viewmodel.SortMode

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate()

        setContent {
            MarvelWatchTrackerTheme {
                val watchedIds by viewModel.watchedIds.collectAsState()
                val currentUser by viewModel.currentUser.collectAsState()
                val filteredItems by viewModel.filteredItems.collectAsState()
                val stats by viewModel.stats.collectAsState()
                val sortMode by viewModel.sortMode.collectAsState()
                val searchQuery by viewModel.searchQuery.collectAsState()
                val typeFilter by viewModel.typeFilter.collectAsState()

                var currentTab by remember { mutableIntStateOf(0) } // 0: Timeline, 1: Dashboard
                var selectedMediaItem by remember { mutableStateOf<MarvelItem?>(null) }
                var isAuthDialogOpen by remember { mutableStateOf(false) }

                Scaffold(
                    topBar = {
                        TopNavBar(
                            stats = stats,
                            currentUser = currentUser,
                            onOpenAuth = { isAuthDialogOpen = true }
                        )
                    },
                    bottomBar = {
                        NavigationBar(
                            containerColor = SurfaceDark,
                            contentColor = TextSecondary,
                            tonalElevation = NavigationBarDefaults.Elevation
                        ) {
                            NavigationBarItem(
                                selected = currentTab == 0,
                                onClick = { currentTab = 0 },
                                icon = { Icon(Icons.Default.Movie, contentDescription = "Timeline") },
                                label = { Text("Timeline") },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = MarvelGold,
                                    selectedTextColor = MarvelGold,
                                    indicatorColor = BackgroundDark
                                )
                            )
                            NavigationBarItem(
                                selected = currentTab == 1,
                                onClick = { currentTab = 1 },
                                icon = { Icon(Icons.Default.BarChart, contentDescription = "Dashboard") },
                                label = { Text("Analytics") },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = MarvelGold,
                                    selectedTextColor = MarvelGold,
                                    indicatorColor = BackgroundDark
                                )
                            )
                        }
                    },
                    containerColor = BackgroundDark
                ) { innerPadding ->
                    Box(modifier = Modifier.padding(innerPadding)) {
                        when (currentTab) {
                            0 -> TimelineScreen(
                                items = filteredItems,
                                watchedIds = watchedIds,
                                sortMode = sortMode,
                                searchQuery = searchQuery,
                                typeFilter = typeFilter,
                                onSortToggle = {
                                    val nextMode = if (sortMode == SortMode.CHRONOLOGICAL) SortMode.RELEASE_ORDER else SortMode.CHRONOLOGICAL
                                    viewModel.setSortMode(nextMode)
                                },
                                onSearchChange = { viewModel.setSearchQuery(it) },
                                onTypeFilterChange = { viewModel.setTypeFilter(it) },
                                onToggleWatch = { viewModel.toggleWatched(it) },
                                onSelectItem = { selectedMediaItem = it }
                            )
                            1 -> DashboardScreen(stats = stats)
                        }
                    }

                    // Detail Bottom Sheet
                    if (selectedMediaItem != null) {
                        DetailBottomSheet(
                            item = selectedMediaItem,
                            isWatched = watchedIds.containsKey(selectedMediaItem?.id),
                            onDismiss = { selectedMediaItem = null },
                            onToggleWatch = {
                                selectedMediaItem?.let { item ->
                                    viewModel.toggleWatched(item.id)
                                }
                            }
                        )
                    }

                    // Authentication Modal
                    if (isAuthDialogOpen) {
                        AuthDialog(
                            currentUser = currentUser,
                            onDismiss = { isAuthDialogOpen = false }
                        )
                    }
                }
            }
        }
    }
}
