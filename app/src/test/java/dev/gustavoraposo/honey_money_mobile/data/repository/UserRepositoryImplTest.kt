package dev.gustavoraposo.honey_money_mobile.data.repository

import dev.gustavoraposo.honey_money_mobile.data.remote.UserApiService
import dev.gustavoraposo.honey_money_mobile.data.remote.dto.UserDto
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import retrofit2.Response
import java.io.IOException

class UserRepositoryImplTest {

    private val userApiService: UserApiService = mockk()
    private lateinit var userRepository: UserRepositoryImpl

    @Before
    fun setUp() {
        userRepository = UserRepositoryImpl(userApiService)
    }

    @Test
    fun `dado token valido quando getCurrentUser chamado entao envia Bearer no header`() = runTest {
        val userDto = UserDto(1, "Gustavo", "gustavo@email.com", "2026-03-07T04:37:56.587Z")
        coEvery { userApiService.getCurrentUser("Bearer meu_token") } returns Response.success(userDto)

        userRepository.getCurrentUser("meu_token")

        coVerify { userApiService.getCurrentUser("Bearer meu_token") }
    }

    @Test
    fun `dado resposta bem sucedida quando getCurrentUser chamado entao retorna User de dominio`() = runTest {
        val userDto = UserDto(1, "Gustavo Foroutan Raposo", "gustavo@email.com", "2026-03-07T04:37:56.587Z")
        coEvery { userApiService.getCurrentUser(any()) } returns Response.success(userDto)

        val result = userRepository.getCurrentUser("token123")

        assertTrue(result.isSuccess)
        result.getOrNull()!!.let {
            assertEquals(1, it.id)
            assertEquals("Gustavo Foroutan Raposo", it.name)
            assertEquals("gustavo@email.com", it.email)
        }
    }

    @Test
    fun `dado resposta de erro http quando getCurrentUser chamado entao retorna falha`() = runTest {
        coEvery { userApiService.getCurrentUser(any()) } returns Response.error(401, "Unauthorized".toResponseBody())

        val result = userRepository.getCurrentUser("token_invalido")

        assertTrue(result.isFailure)
    }

    @Test
    fun `dado body nulo quando getCurrentUser chamado entao retorna falha`() = runTest {
        val response: Response<UserDto> = Response.success(null)
        coEvery { userApiService.getCurrentUser(any()) } returns response

        val result = userRepository.getCurrentUser("token123")

        assertTrue(result.isFailure)
    }

    @Test
    fun `dado excecao de rede quando getCurrentUser chamado entao retorna falha`() = runTest {
        coEvery { userApiService.getCurrentUser(any()) } throws IOException("Timeout")

        val result = userRepository.getCurrentUser("token123")

        assertTrue(result.isFailure)
        assertEquals("Timeout", result.exceptionOrNull()?.message)
    }
}
