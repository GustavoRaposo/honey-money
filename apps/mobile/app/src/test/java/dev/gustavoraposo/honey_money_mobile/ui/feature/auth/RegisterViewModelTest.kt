package dev.gustavoraposo.honey_money_mobile.ui.feature.auth

import dev.gustavoraposo.honey_money_mobile.domain.model.Profile
import dev.gustavoraposo.honey_money_mobile.domain.model.User
import dev.gustavoraposo.honey_money_mobile.domain.usecase.LoginUseCase
import dev.gustavoraposo.honey_money_mobile.domain.usecase.RegisterUseCase
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
class RegisterViewModelTest {

    private val registerUseCase: RegisterUseCase = mockk()
    private val loginUseCase: LoginUseCase = mockk()
    private lateinit var viewModel: RegisterViewModel
    private val testDispatcher = UnconfinedTestDispatcher()

    private val fakeUser = User(1, "Gustavo Raposo", "gustavo@email.com", Profile(1, "user"), "2026-03-08T00:00:00.000Z")

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        viewModel = RegisterViewModel(registerUseCase, loginUseCase)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `estado inicial deve ter campos vazios sem erro e sem carregamento`() {
        val state = viewModel.uiState.value

        assertEquals("", state.name)
        assertEquals("", state.email)
        assertEquals("", state.password)
        assertEquals("", state.confirmPassword)
        assertFalse(state.isLoading)
        assertNull(state.error)
        assertFalse(state.isSuccess)
        assertNull(state.user)
    }

    @Test
    fun `dado nome inserido quando onNameChange chamado entao atualiza estado`() {
        viewModel.onNameChange("Gustavo")

        assertEquals("Gustavo", viewModel.uiState.value.name)
    }

    @Test
    fun `dado email inserido quando onEmailChange chamado entao atualiza estado`() {
        viewModel.onEmailChange("gustavo@email.com")

        assertEquals("gustavo@email.com", viewModel.uiState.value.email)
    }

    @Test
    fun `dado senha inserida quando onPasswordChange chamado entao atualiza estado`() {
        viewModel.onPasswordChange("password123")

        assertEquals("password123", viewModel.uiState.value.password)
    }

    @Test
    fun `dado confirmacao de senha inserida quando onConfirmPasswordChange chamado entao atualiza estado`() {
        viewModel.onConfirmPasswordChange("password123")

        assertEquals("password123", viewModel.uiState.value.confirmPassword)
    }

    @Test
    fun `dado senhas diferentes quando onRegisterClick chamado entao emite erro de validacao`() = runTest {
        viewModel.onNameChange("Gustavo")
        viewModel.onEmailChange("gustavo@email.com")
        viewModel.onPasswordChange("password123")
        viewModel.onConfirmPasswordChange("outrasenha")

        viewModel.onRegisterClick()

        val state = viewModel.uiState.value
        assertFalse(state.isSuccess)
        assertNotNull(state.error)
        assertFalse(state.isLoading)
    }

    @Test
    fun `dado cadastro e login bem sucedidos quando onRegisterClick chamado entao emite usuario no estado`() = runTest {
        coEvery {
            registerUseCase("Gustavo", "gustavo@email.com", "password123")
        } returns Result.success(fakeUser)
        coEvery {
            loginUseCase("gustavo@email.com", "password123")
        } returns Result.success("access_token_jwt")

        viewModel.onNameChange("Gustavo")
        viewModel.onEmailChange("gustavo@email.com")
        viewModel.onPasswordChange("password123")
        viewModel.onConfirmPasswordChange("password123")

        viewModel.onRegisterClick()

        val state = viewModel.uiState.value
        assertTrue(state.isSuccess)
        assertNotNull(state.user)
        assertEquals(fakeUser, state.user)
        assertFalse(state.isLoading)
        assertNull(state.error)
    }

    @Test
    fun `dado cadastro falha quando onRegisterClick chamado entao emite erro sem chamar login`() = runTest {
        coEvery { registerUseCase(any(), any(), any()) } returns Result.failure(Exception("E-mail já cadastrado"))

        viewModel.onNameChange("Gustavo")
        viewModel.onEmailChange("gustavo@email.com")
        viewModel.onPasswordChange("password123")
        viewModel.onConfirmPasswordChange("password123")

        viewModel.onRegisterClick()

        val state = viewModel.uiState.value
        assertFalse(state.isSuccess)
        assertEquals("E-mail já cadastrado", state.error)
        assertNull(state.user)
    }

    @Test
    fun `dado cadastro ok mas login falha quando onRegisterClick chamado entao emite erro`() = runTest {
        coEvery { registerUseCase(any(), any(), any()) } returns Result.success(fakeUser)
        coEvery { loginUseCase(any(), any()) } returns Result.failure(Exception("Erro ao realizar login"))

        viewModel.onNameChange("Gustavo")
        viewModel.onEmailChange("gustavo@email.com")
        viewModel.onPasswordChange("password123")
        viewModel.onConfirmPasswordChange("password123")

        viewModel.onRegisterClick()

        val state = viewModel.uiState.value
        assertFalse(state.isSuccess)
        assertEquals("Erro ao realizar login", state.error)
        assertNull(state.user)
    }

    @Test
    fun `dado erro anterior quando onNameChange chamado entao limpa erro`() = runTest {
        coEvery { registerUseCase(any(), any(), any()) } returns Result.failure(Exception("Erro"))
        viewModel.onPasswordChange("pass123")
        viewModel.onConfirmPasswordChange("pass123")
        viewModel.onRegisterClick()

        viewModel.onNameChange("Novo nome")

        assertNull(viewModel.uiState.value.error)
    }
}
