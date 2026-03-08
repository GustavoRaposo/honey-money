package dev.gustavoraposo.honey_money_mobile.domain.repository

import dev.gustavoraposo.honey_money_mobile.domain.model.User

interface UserRepository {
    suspend fun getCurrentUser(accessToken: String): Result<User>
}
