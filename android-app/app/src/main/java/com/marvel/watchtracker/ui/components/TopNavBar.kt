package com.marvel.watchtracker.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.auth.FirebaseUser
import com.marvel.watchtracker.ui.theme.*
import com.marvel.watchtracker.ui.viewmodel.TrackerStats

@Composable
fun TopNavBar(
    stats: TrackerStats,
    currentUser: FirebaseUser?,
    onOpenAuth: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, BorderDark),
        color = BackgroundDark
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Brand Logo
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MarvelRed),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = "Logo",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Column {
                    Text(
                        text = "MARVEL",
                        fontWeight = FontWeight.Black,
                        fontSize = 16.sp,
                        color = TextPrimary
                    )
                    Text(
                        text = "CHRONO TRACKER",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextMuted
                    )
                }
            }

            // Right Status Bar
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Cloud Sync Indicator Button
                Surface(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { onOpenAuth() },
                    color = if (currentUser != null) MarvelEmerald.copy(alpha = 0.15f) else SurfaceDark,
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (currentUser != null) MarvelEmerald.copy(alpha = 0.4f) else BorderDark
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = if (currentUser != null) Icons.Default.Cloud else Icons.Default.CloudOff,
                            contentDescription = "Cloud Sync",
                            tint = if (currentUser != null) MarvelEmerald else TextMuted,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = if (currentUser != null) "Synced" else "Offline",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (currentUser != null) MarvelEmerald else TextMuted
                        )
                    }
                }

                // Progress Counter
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = SurfaceDark,
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark)
                ) {
                    Text(
                        text = "${stats.watchedCount}/${stats.totalCount}",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MarvelGold
                    )
                }
            }
        }
    }
}
