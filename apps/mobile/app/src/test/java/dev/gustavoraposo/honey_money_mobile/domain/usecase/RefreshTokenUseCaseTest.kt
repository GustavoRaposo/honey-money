package dev.gustavoraposo.honey_money_mobile.domain.usecase

import dev.gustavoraposo.honey_money_mobile.domain.repository.AuthRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class RefreshTokenUseCaseTest {

    private val authRepository: AuthRepository = mockk()
    private lateinit var refreshTokenUseCase: RefreshTokenUseCase

    @Before
    fun setUp() {
        refreshTokenUseCase = RefreshTokenUseCase(authRepository)
    }

    @Test
    fun `dado token valido quando invoke chamado entao retorna novo accessToken`() = runTest {
        val newToken = "new_jwt_token"
        coEvery { authRepository.refresh("old_token") } returns Result.success(newToken)

        val result = refreshTokenUseCase("old_token")

        assertTrue(result.isSuccess)
        assertEquals(newToken, result.getOrNull())
    }

    @Test
    fun `dado token invalido quando invoke chamado entao retorna falha`() = runTest {
        coEvery { authRepository.refresh(any()) } returns Result.failure(Exception("Token inválido"))

        val result = refreshTokenUseCase("token_invalido")

        assertTrue(result.isFailure)
        assertEquals("Token inválido", result.exceptionOrNull()?.message)
    }

    @Test
    fun `dado qualquer token quando invoke chamado entao delega ao repository`() = runTest {
        coEvery { authRepository.refresh(any()) } returns Result.failure(Exception())

        refreshTokenUseCase("meu_token")

        coVerify(exactly = 1) { authRepository.refresh("meu_token") }
    }
}
