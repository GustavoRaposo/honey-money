package dev.gustavoraposo.honey_money_mobile.ui.feature.auth

import dev.gustavoraposo.honey_money_mobile.domain.model.User
import dev.gustavoraposo.honey_money_mobile.domain.usecase.GetCurrentUserUseCase
import dev.gustavoraposo.honey_money_mobile.domain.usecase.LoginUseCase
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class LoginViewModelTest {

    private val loginUseCase: LoginUseCase = mockk()
    private val getCurrentUserUseCase: GetCurrentUserUseCase = mockk()
    private lateinit var viewModel: LoginViewModel
    private val testDispatcher = UnconfinedTestDispatcher()

    private val fakeUser = User(1, "Gustavo Foroutan Raposo", "gustavo@email.com", "2026-03-07T04:37:56.587Z")

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        viewModel = LoginViewModel(loginUseCase, getCurrentUserUseCase)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `estado inicial deve ter campos vazios sem erro e sem carregamento`() {
        val state = viewModel.uiState.value

        assertEquals("", state.email)
        assertEquals("", state.password)
        assertFalse(state.isLoading)
        assertNull(state.error)
        assertFalse(state.isSuccess)
        assertNull(state.user)
    }

    @Test
    fun `dado email inserido quando onEmailChange chamado entao atualiza estado`() {
        viewModel.onEmailChange("test@email.com")

        assertEquals("test@email.com", viewModel.uiState.value.email)
    }

    @Test
    fun `dado senha inserida quando onPasswordChange chamado entao atualiza estado`() {
        viewModel.onPasswordChange("password123")

        assertEquals("password123", viewModel.uiState.value.password)
    }

    @Test
    fun `dado login e getMe bem sucedidos quando onLoginClick chamado entao emite usuario no estado`() = runTest {
        coEvery { loginUseCase("gustavo@email.com", "pass123") } returns Result.success("access_token_jwt")
        coEvery { getCurrentUserUseCase("access_token_jwt") } returns Result.success(fakeUser)
        viewModel.onEmailChange("gustavo@email.com")
        viewModel.onPasswordChange("pass123")

        viewModel.onLoginClick()

        val state = viewModel.uiState.value
        assertTrue(state.isSuccess)
        assertNotNull(state.user)
        assertEquals(fakeUser, state.user)
        assertFalse(state.isLoading)
        assertNull(state.error)
    }

    @Test
    fun `dado login falha quando onLoginClick chamado entao nao chama getMe`() = runTest {
        coEvery { loginUseCase(any(), any()) } returns Result.failure(Exception("Credenciais inválidas"))
        viewModel.onEmailChange("wrong@email.com")
        viewModel.onPasswordChange("wrongpass")

        viewModel.onLoginClick()

        val state = viewModel.uiState.value
        assertFalse(state.isSuccess)
        assertEquals("Credenciais inválidas", state.error)
        assertNull(state.user)
    }

    @Test
    fun `dado login ok mas getMe falha quando onLoginClick chamado entao emite erro`() = runTest {
        coEvery { loginUseCase(any(), any()) } returns Result.success("access_token_jwt")
        coEvery { getCurrentUserUseCase(any()) } returns Result.failure(Exception("Erro ao buscar usuário"))

        viewModel.onLoginClick()

        val state = viewModel.uiState.value
        assertFalse(state.isSuccess)
        assertEquals("Erro ao buscar usuário", state.error)
        assertNull(state.user)
    }

    @Test
    fun `dado erro anterior quando onEmailChange chamado entao limpa erro`() = runTest {
        coEvery { loginUseCase(any(), any()) } returns Result.failure(Exception("Erro"))
        viewModel.onLoginClick()

        viewModel.onEmailChange("novo@email.com")

        assertNull(viewModel.uiState.value.error)
    }
}
