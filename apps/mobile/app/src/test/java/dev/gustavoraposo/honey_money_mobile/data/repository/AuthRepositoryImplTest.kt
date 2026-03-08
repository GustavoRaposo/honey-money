package dev.gustavoraposo.honey_money_mobile.data.repository

import dev.gustavoraposo.honey_money_mobile.data.remote.AuthApiService
import dev.gustavoraposo.honey_money_mobile.data.remote.dto.LoginResponseDto
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import retrofit2.Response
import java.io.IOException

class AuthRepositoryImplTest {

    private val authApiService: AuthApiService = mockk()
    private lateinit var authRepository: AuthRepositoryImpl

    @Before
    fun setUp() {
        authRepository = AuthRepositoryImpl(authApiService)
    }

    @Test
    fun `dado resposta bem sucedida quando login chamado entao retorna accessToken`() = runTest {
        val responseDto = LoginResponseDto(accessToken = "eyJhbGciOiJIUzI1NiJ9.test")
        coEvery { authApiService.login(any()) } returns Response.success(responseDto)

        val result = authRepository.login("gustavo@email.com", "password123")

        assertTrue(result.isSuccess)
        assertEquals("eyJhbGciOiJIUzI1NiJ9.test", result.getOrNull())
    }

    @Test
    fun `dado resposta de erro http quando login chamado entao retorna falha`() = runTest {
        coEvery { authApiService.login(any()) } returns Response.error(401, "Unauthorized".toResponseBody())

        val result = authRepository.login("gustavo@email.com", "wrongpass")

        assertTrue(result.isFailure)
    }

    @Test
    fun `dado body nulo quando login chamado entao retorna falha`() = runTest {
        val response: Response<LoginResponseDto> = Response.success(null)
        coEvery { authApiService.login(any()) } returns response

        val result = authRepository.login("gustavo@email.com", "password123")

        assertTrue(result.isFailure)
    }

    @Test
    fun `dado excecao de rede quando login chamado entao retorna falha com mensagem`() = runTest {
        coEvery { authApiService.login(any()) } throws IOException("Sem conexão")

        val result = authRepository.login("gustavo@email.com", "password123")

        assertTrue(result.isFailure)
        assertEquals("Sem conexão", result.exceptionOrNull()?.message)
    }

    @Test
    fun `dado token valido quando refresh chamado entao retorna novo accessToken`() = runTest {
        val responseDto = LoginResponseDto(accessToken = "new_jwt_token")
        coEvery { authApiService.refresh("Bearer old_token") } returns Response.success(responseDto)

        val result = authRepository.refresh("old_token")

        assertTrue(result.isSuccess)
        assertEquals("new_jwt_token", result.getOrNull())
    }

    @Test
    fun `dado token expirado quando refresh chamado entao retorna falha`() = runTest {
        coEvery { authApiService.refresh(any()) } returns Response.error(401, "Unauthorized".toResponseBody())

        val result = authRepository.refresh("expired_token")

        assertTrue(result.isFailure)
    }

    @Test
    fun `dado excecao de rede quando refresh chamado entao retorna falha`() = runTest {
        coEvery { authApiService.refresh(any()) } throws IOException("Sem conexão")

        val result = authRepository.refresh("meu_token")

        assertTrue(result.isFailure)
        assertEquals("Sem conexão", result.exceptionOrNull()?.message)
    }
}
