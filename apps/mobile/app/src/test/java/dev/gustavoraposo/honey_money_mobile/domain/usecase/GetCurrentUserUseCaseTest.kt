package dev.gustavoraposo.honey_money_mobile.domain.usecase

import dev.gustavoraposo.honey_money_mobile.domain.model.Profile
import dev.gustavoraposo.honey_money_mobile.domain.model.User
import dev.gustavoraposo.honey_money_mobile.domain.repository.UserRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class GetCurrentUserUseCaseTest {

    private val userRepository: UserRepository = mockk()
    private lateinit var getCurrentUserUseCase: GetCurrentUserUseCase

    @Before
    fun setUp() {
        getCurrentUserUseCase = GetCurrentUserUseCase(userRepository)
    }

    @Test
    fun `dado token valido quando invoke chamado entao retorna usuario`() = runTest {
        val expectedUser = User(1, "Gustavo Foroutan Raposo", "gustavo@email.com", Profile(1, "user"), "2026-03-07T04:37:56.587Z")
        coEvery { userRepository.getCurrentUser("token123") } returns Result.success(expectedUser)

        val result = getCurrentUserUseCase("token123")

        assertTrue(result.isSuccess)
        assertEquals(expectedUser, result.getOrNull())
    }

    @Test
    fun `dado token invalido quando invoke chamado entao retorna falha`() = runTest {
        coEvery { userRepository.getCurrentUser(any()) } returns Result.failure(Exception("Não autorizado"))

        val result = getCurrentUserUseCase("token_invalido")

        assertTrue(result.isFailure)
        assertEquals("Não autorizado", result.exceptionOrNull()?.message)
    }

    @Test
    fun `dado qualquer token quando invoke chamado entao delega ao repository`() = runTest {
        coEvery { userRepository.getCurrentUser(any()) } returns Result.failure(Exception())

        getCurrentUserUseCase("meu_token")

        coVerify(exactly = 1) { userRepository.getCurrentUser("meu_token") }
    }
}
