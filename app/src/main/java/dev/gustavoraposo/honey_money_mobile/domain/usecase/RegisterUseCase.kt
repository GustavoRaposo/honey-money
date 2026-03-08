package dev.gustavoraposo.honey_money_mobile.domain.usecase

import dev.gustavoraposo.honey_money_mobile.domain.model.User
import dev.gustavoraposo.honey_money_mobile.domain.repository.AuthRepository
import javax.inject.Inject

class RegisterUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(name: String, email: String, password: String): Result<User> {
        return authRepository.register(name, email, password)
    }
}
