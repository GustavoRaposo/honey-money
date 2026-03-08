package dev.gustavoraposo.honey_money_mobile.domain.usecase

import dev.gustavoraposo.honey_money_mobile.domain.repository.AuthRepository
import javax.inject.Inject

class RefreshTokenUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(token: String): Result<String> = authRepository.refresh(token)
}
