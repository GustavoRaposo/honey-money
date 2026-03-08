package dev.gustavoraposo.honey_money_mobile.domain.usecase

import dev.gustavoraposo.honey_money_mobile.domain.model.User
import dev.gustavoraposo.honey_money_mobile.domain.repository.AuthRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class RegisterUseCaseTest {

    private val authRepository: AuthRepository = mockk()
    private lateinit var registerUseCase: RegisterUseCase

    private val fakeUser = User(1, "Gustavo", "gustavo@email.com", "2026-03-08T00:00:00.000Z")

    @Before
    fun setUp() {
        registerUseCase = RegisterUseCase(authRepository)
    }

    @Test
    fun `dado dados validos quando invoke chamado entao retorna usuario com sucesso`() = runTest {
        coEvery {
            authRepository.register("Gustavo", "gustavo@email.com", "password123")
        } returns Result.success(fakeUser)

        val result = registerUseCase("Gustavo", "gustavo@email.com", "password123")

        assertTrue(result.isSuccess)
        assertEquals(fakeUser, result.getOrNull())
    }

    @Test
    fun `dado email ja cadastrado quando invoke chamado entao retorna falha`() = runTest {
        val exception = Exception("E-mail já cadastrado")
        coEvery { authRepository.register(any(), any(), any()) } returns Result.failure(exception)

        val result = registerUseCase("Gustavo", "gustavo@email.com", "password123")

        assertTrue(result.isFailure)
        assertEquals(exception.message, result.exceptionOrNull()?.message)
    }

    @Test
    fun `dado qualquer dado quando invoke chamado entao delega ao repository`() = runTest {
        coEvery { authRepository.register(any(), any(), any()) } returns Result.failure(Exception())

        registerUseCase("Gustavo", "gustavo@email.com", "password123")

        coVerify(exactly = 1) { authRepository.register("Gustavo", "gustavo@email.com", "password123") }
    }
}
