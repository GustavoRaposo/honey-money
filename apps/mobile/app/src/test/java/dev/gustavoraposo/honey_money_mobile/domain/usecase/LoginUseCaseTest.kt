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

class LoginUseCaseTest {

    private val authRepository: AuthRepository = mockk()
    private lateinit var loginUseCase: LoginUseCase

    @Before
    fun setUp() {
        loginUseCase = LoginUseCase(authRepository)
    }

    @Test
    fun `dado credenciais validas quando invoke chamado entao retorna token com sucesso`() = runTest {
        val expectedToken = "valid_token_123"
        coEvery { authRepository.login("test@email.com", "password123") } returns Result.success(expectedToken)

        val result = loginUseCase("test@email.com", "password123")

        assertTrue(result.isSuccess)
        assertEquals(expectedToken, result.getOrNull())
    }

    @Test
    fun `dado credenciais invalidas quando invoke chamado entao retorna falha`() = runTest {
        val exception = Exception("Credenciais inválidas")
        coEvery { authRepository.login("wrong@email.com", "wrongpass") } returns Result.failure(exception)

        val result = loginUseCase("wrong@email.com", "wrongpass")

        assertTrue(result.isFailure)
        assertEquals(exception.message, result.exceptionOrNull()?.message)
    }

    @Test
    fun `dado qualquer credencial quando invoke chamado entao delega ao repository`() = runTest {
        coEvery { authRepository.login(any(), any()) } returns Result.failure(Exception())

        loginUseCase("email@test.com", "pass")

        coVerify(exactly = 1) { authRepository.login("email@test.com", "pass") }
    }
}