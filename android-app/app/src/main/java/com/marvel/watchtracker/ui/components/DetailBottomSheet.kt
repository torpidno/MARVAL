package com.marvel.watchtracker.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.marvel.watchtracker.data.MarvelItem
import com.marvel.watchtracker.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetailBottomSheet(
    item: MarvelItem?,
    isWatched: Boolean,
    onDismiss: () -> Unit,
    onToggleWatch: () -> Unit
) {
    if (item == null) return

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = SurfaceDark,
        scrimColor = Color.Black.copy(alpha = 0.8f)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 32.dp)
        ) {
            // Header Poster Banner
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(240.dp)
                    .background(BackgroundDark)
            ) {
                AsyncImage(
                    model = item.poster,
                    contentDescription = item.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )

                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, SurfaceDark)
                            )
                        )
                )

                Column(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = item.id,
                        style = MaterialTheme.typography.labelSmall,
                        color = MarvelGold
                    )
                    Text(
                        text = item.title,
                        style = MaterialTheme.typography.titleLarge
                    )
                    Text(
                        text = "${item.releaseYear}  •  ${item.runtime}  •  ${item.saga}",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                }
            }

            // Body Content
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Action Button
                Button(
                    onClick = onToggleWatch,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isWatched) MarvelGold else SurfaceVariantDark,
                        contentColor = if (isWatched) BackgroundDark else TextPrimary
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isWatched) "Watched! Tap to uncheck" else "Mark as Watched",
                        fontWeight = FontWeight.Bold
                    )
                }

                // Synopsis
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "SYNOPSIS",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextMuted
                    )
                    Text(
                        text = item.overview,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }

                // Artifacts
                if (item.artifacts.isNotEmpty()) {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = "KEY ARTIFACTS",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextMuted
                        )
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            item.artifacts.forEach { artifact ->
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = MarvelGold.copy(alpha = 0.15f),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, MarvelGold.copy(alpha = 0.3f))
                                ) {
                                    Text(
                                        text = artifact,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                        fontSize = 11.sp,
                                        color = MarvelGold
                                    )
                                }
                            }
                        }
                    }
                }

                // Characters
                if (item.characters.isNotEmpty()) {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = "CHARACTERS",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextMuted
                        )
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            item.characters.forEach { char ->
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = SurfaceVariantDark,
                                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderDark)
                                ) {
                                    Text(
                                        text = char,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                        fontSize = 11.sp,
                                        color = TextPrimary
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
