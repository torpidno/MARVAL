package com.marvel.watchtracker.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SwapVert
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.marvel.watchtracker.data.MarvelItem
import com.marvel.watchtracker.ui.components.MediaCard
import com.marvel.watchtracker.ui.theme.*
import com.marvel.watchtracker.ui.viewmodel.SortMode

@Composable
fun TimelineScreen(
    items: List<MarvelItem>,
    watchedIds: Map<String, String>,
    sortMode: SortMode,
    searchQuery: String,
    typeFilter: String?,
    onSortToggle: () -> Unit,
    onSearchChange: (String) -> Unit,
    onTypeFilterChange: (String?) -> Unit,
    onToggleWatch: (String) -> Unit,
    onSelectItem: (MarvelItem) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(horizontal = 12.dp)
    ) {
        // Search & Filter Header Controls
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = onSearchChange,
                placeholder = { Text("Search movies, series, characters...", fontSize = 13.sp, color = TextMuted) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMuted) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MarvelGold,
                    unfocusedBorderColor = BorderDark,
                    focusedContainerColor = SurfaceDark,
                    unfocusedContainerColor = SurfaceDark
                )
            )

            // Filter Chips & Sort Toggle Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Type Filter Chips
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilterChip(
                        label = "All",
                        isSelected = typeFilter == null,
                        onClick = { onTypeFilterChange(null) }
                    )
                    FilterChip(
                        label = "Movies",
                        isSelected = typeFilter == "movie",
                        onClick = { onTypeFilterChange("movie") }
                    )
                    FilterChip(
                        label = "Series",
                        isSelected = typeFilter == "series",
                        onClick = { onTypeFilterChange("series") }
                    )
                }

                // Chrono vs Release Order Button
                Surface(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { onSortToggle() },
                    color = SurfaceDark,
                    border = androidx.compose.foundation.BorderStroke(1.dp, MarvelGold.copy(alpha = 0.4f))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.SwapVert,
                            contentDescription = "Sort",
                            tint = MarvelGold,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = if (sortMode == SortMode.CHRONOLOGICAL) "Chrono" else "Release",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = MarvelGold
                        )
                    }
                }
            }
        }

        // Media Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(bottom = 80.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(items, key = { it.id }) { item ->
                MediaCard(
                    item = item,
                    isWatched = watchedIds.containsKey(item.id),
                    isChronoOrder = sortMode == SortMode.CHRONOLOGICAL,
                    onToggleWatch = { onToggleWatch(item.id) },
                    onClick = { onSelectItem(item) }
                )
            }
        }
    }
}

@Composable
fun FilterChip(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .clickable { onClick() },
        color = if (isSelected) MarvelGold else SurfaceDark,
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            if (isSelected) MarvelGold else BorderDark
        )
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = if (isSelected) BackgroundDark else TextSecondary
        )
    }
}
