package dev.gustavoraposo.honey_money_mobile.domain.repository

import dev.gustavoraposo.honey_money_mobile.domain.model.User

interface AuthRepository {
    suspend fun login(email: String, password: String): Result<String>
    suspend fun register(name: String, email: String, password: String): Result<User>
    suspend fun refresh(token: String): Result<String>
}