package com.marvel.watchtracker.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.marvel.watchtracker.data.MarvelItem
import com.marvel.watchtracker.ui.theme.*

@Composable
fun MediaCard(
    item: MarvelItem,
    isWatched: Boolean,
    isChronoOrder: Boolean,
    onToggleWatch: () -> Unit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val orderNum = if (isChronoOrder) item.chronoOrder else item.releaseOrder
    val phaseColor = when (item.phase) {
        1 -> Color(0xFFEF4444)
        2 -> Color(0xFFF59E0B)
        3 -> Color(0xFF3B82F6)
        4 -> Color(0xFF8B5CF6)
        5 -> Color(0xFF10B981)
        else -> Color(0xFF6B7280)
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .border(
                width = 1.dp,
                color = if (isWatched) MarvelGold.copy(alpha = 0.4f) else BorderDark,
                shape = RoundedCornerShape(16.dp)
            )
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = SurfaceDark
        )
    ) {
        Column {
            // Media Poster Container
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1.6f)
                    .background(BackgroundDark)
            ) {
                AsyncImage(
                    model = item.poster,
                    contentDescription = item.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )

                // Dark gradient overlay
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, Color(0xCC09090B))
                            )
                        )
                )

                // Order Index Badge
                Surface(
                    modifier = Modifier
                        .padding(10.dp)
                        .align(Alignment.TopStart),
                    shape = RoundedCornerShape(8.dp),
                    color = BackgroundDark.copy(alpha = 0.85f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark)
                ) {
                    Text(
                        text = "#$orderNum",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = MarvelGold,
                        fontWeight = FontWeight.Black
                    )
                }

                // Golden Check Ribbon Toggle Button
                Box(
                    modifier = Modifier
                        .padding(10.dp)
                        .size(28.dp)
                        .align(Alignment.TopEnd)
                        .clip(CircleShape)
                        .background(
                            if (isWatched) Brush.horizontalGradient(
                                listOf(Color(0xFFF59E0B), Color(0xFFD97706))
                            ) else Brush.horizontalGradient(
                                listOf(BackgroundDark.copy(alpha = 0.85f), BackgroundDark.copy(alpha = 0.85f))
                            )
                        )
                        .border(
                            1.dp,
                            if (isWatched) MarvelGold else Color.Gray,
                            CircleShape
                        )
                        .clickable { onToggleWatch() },
                    contentAlignment = Alignment.Center
                ) {
                    if (isWatched) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "Watched",
                            tint = BackgroundDark,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            // Card Body Info
            Column(
                modifier = Modifier.padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = phaseColor.copy(alpha = 0.15f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, phaseColor.copy(alpha = 0.4f))
                    ) {
                        Text(
                            text = item.phaseStr,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = phaseColor
                        )
                    }

                    Text(
                        text = "${item.releaseYear}",
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                }

                Text(
                    text = item.title,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}
