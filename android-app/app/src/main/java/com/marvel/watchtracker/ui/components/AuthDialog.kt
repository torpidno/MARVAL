package com.marvel.watchtracker.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.marvel.watchtracker.ui.theme.*

@Composable
fun AuthDialog(
    currentUser: FirebaseUser?,
    onDismiss: () -> Unit
) {
    var isRegister by remember { mutableStateOf(false) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var errorText by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = SurfaceDark,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Cloud,
                    contentDescription = null,
                    tint = MarvelGold,
                    modifier = Modifier.size(24.dp)
                )
                Text(
                    text = "Firebase Cloud Sync",
                    style = MaterialTheme.typography.titleMedium
                )
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (currentUser != null) {
                    // Signed In State
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(BackgroundDark)
                            .padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "Signed in as:",
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                        Text(
                            text = currentUser.email ?: currentUser.uid,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = TextPrimary
                        )
                        Text(
                            text = "Your watch progress is live-synced to your Firebase user document.",
                            fontSize = 11.sp,
                            color = MarvelEmerald
                        )
                    }

                    Button(
                        onClick = {
                            FirebaseAuth.getInstance().signOut()
                            onDismiss()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = SurfaceVariantDark)
                    ) {
                        Text("Sign Out", color = MarvelRed)
                    }
                } else {
                    // Sign In Form
                    Text(
                        text = if (isRegister) "Create a new Firebase account:" else "Sign in with your Email:",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )

                    if (errorText != null) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MarvelRed.copy(alpha = 0.15f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, MarvelRed)
                        ) {
                            Text(
                                text = errorText!!,
                                modifier = Modifier.padding(8.dp),
                                fontSize = 11.sp,
                                color = MarvelRed
                            )
                        }
                    }

                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email Address") },
                        leadingIcon = { Icon(Icons.Default.Mail, contentDescription = null) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = MarvelGold,
                            unfocusedBorderColor = BorderDark
                        )
                    )

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Password") },
                        leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = MarvelGold,
                            unfocusedBorderColor = BorderDark
                        )
                    )

                    Button(
                        onClick = {
                            if (email.isBlank() || password.isBlank()) {
                                errorText = "Email and password are required"
                                return@Button
                            }
                            isLoading = true
                            errorText = null

                            val auth = FirebaseAuth.getInstance()
                            if (isRegister) {
                                auth.createUserWithEmailAndPassword(email, password)
                                    .addOnSuccessListener {
                                        isLoading = false
                                        onDismiss()
                                    }
                                    .addOnFailureListener { e ->
                                        isLoading = false
                                        errorText = e.localizedMessage ?: "Registration failed"
                                    }
                            } else {
                                auth.signInWithEmailAndPassword(email, password)
                                    .addOnSuccessListener {
                                        isLoading = false
                                        onDismiss()
                                    }
                                    .addOnFailureListener { e ->
                                        isLoading = false
                                        errorText = e.localizedMessage ?: "Authentication failed"
                                    }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !isLoading,
                        colors = ButtonDefaults.buttonColors(containerColor = MarvelGold)
                    ) {
                        Text(
                            text = if (isLoading) "Syncing..." else if (isRegister) "Register Account" else "Sign In",
                            color = BackgroundDark,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    TextButton(
                        onClick = { isRegister = !isRegister },
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    ) {
                        Text(
                            text = if (isRegister) "Already have an account? Sign In" else "Need an account? Register",
                            fontSize = 12.sp,
                            color = MarvelGold
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close", color = TextSecondary)
            }
        }
    )
}
