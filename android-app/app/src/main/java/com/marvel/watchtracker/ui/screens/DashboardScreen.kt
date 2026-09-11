package com.marvel.watchtracker.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Tv
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.marvel.watchtracker.ui.theme.*
import com.marvel.watchtracker.ui.viewmodel.TrackerStats

@Composable
fun DashboardScreen(
    stats: TrackerStats
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Watch Progress Analytics",
            style = MaterialTheme.typography.titleLarge
        )

        // Progress Card Banner
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .border(1.dp, MarvelGold.copy(alpha = 0.3f), RoundedCornerShape(16.dp)),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "MCU Completion Rate",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = "${stats.progressPercent}%",
                        fontWeight = FontWeight.Black,
                        fontSize = 24.sp,
                        color = MarvelGold
                    )
                }

                LinearProgressIndicator(
                    progress = { stats.progressPercent / 100f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = MarvelGold,
                    trackColor = SurfaceVariantDark
                )

                Text(
                    text = "${stats.watchedCount} of ${stats.totalCount} Marvel titles watched",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }
        }

        // Metrics Grid
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MetricCard(
                title = "Hours Watched",
                value = "${stats.watchedHours} hrs",
                subtext = "out of ${stats.totalHours} hrs total",
                icon = Icons.Default.Schedule,
                iconColor = MarvelBlue,
                modifier = Modifier.weight(1f)
            )

            MetricCard(
                title = "Titles Complete",
                value = "${stats.watchedCount}",
                subtext = "${stats.totalCount - stats.watchedCount} remaining",
                icon = Icons.Default.CheckCircle,
                iconColor = MarvelEmerald,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    subtext: String,
    icon: ImageVector,
    iconColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .border(1.dp, BorderDark, RoundedCornerShape(14.dp)),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(iconColor.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(18.dp)
                )
            }

            Text(
                text = value,
                fontWeight = FontWeight.Black,
                fontSize = 20.sp,
                color = TextPrimary
            )

            Column {
                Text(
                    text = title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    color = TextPrimary
                )
                Text(
                    text = subtext,
                    fontSize = 10.sp,
                    color = TextMuted
                )
            }
        }
    }
}
