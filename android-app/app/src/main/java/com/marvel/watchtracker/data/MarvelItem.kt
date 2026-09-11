package com.marvel.watchtracker.data

data class MarvelItem(
    val id: String,
    val title: String,
    val type: String, // "movie", "series", "special"
    val phase: Int,
    val phaseStr: String = "Phase $phase",
    val chronoOrder: Int,
    val releaseOrder: Int,
    val releaseYear: Int,
    val minutes: Int,
    val runtime: String,
    val poster: String,
    val overview: String,
    val saga: String = "Multiverse Saga",
    val earth: String? = null,
    val artifacts: List<String> = emptyList(),
    val characters: List<String> = emptyList(),
    val directConnections: List<String> = emptyList()
)
