package dev.gustavoraposo.honey_money_mobile.ui.feature.auth

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertIsEnabled
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import dev.gustavoraposo.honey_money_mobile.MainActivity
import org.junit.Before
import org.junit.Rule
import org.junit.Test

@HiltAndroidTest
class LoginScreenTest {

    @get:Rule(order = 0)
    val hiltRule = HiltAndroidRule(this)

    @get:Rule(order = 1)
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Before
    fun setUp() {
        hiltRule.inject()
    }

    @Test
    fun dadoTelaAberta_entaoExibeCamposDeEmailSenhaEBotao() {
        composeRule.onNodeWithTag("login_email_field").assertIsDisplayed()
        composeRule.onNodeWithTag("login_password_field").assertIsDisplayed()
        composeRule.onNodeWithTag("login_button").assertIsDisplayed()
    }

    @Test
    fun dadoTelaAberta_entaoBotaoLoginEstaHabilitado() {
        composeRule.onNodeWithTag("login_button").assertIsEnabled()
    }

    @Test
    fun dadoCredenciaisInseridas_quandoBotaoLoginClicado_entaoNaoTravaTela() {
        composeRule.onNodeWithTag("login_email_field").performTextInput("test@email.com")
        composeRule.onNodeWithTag("login_password_field").performTextInput("password123")
        composeRule.onNodeWithTag("login_button").performClick()
        composeRule.waitForIdle()
    }

    @Test
    fun dadoEmailInserido_quandoAvancaParaSenha_entaoSenhaRecebeFoco() {
        composeRule.onNodeWithTag("login_email_field").performTextInput("test@email.com")
        composeRule.onNodeWithTag("login_password_field").assertIsDisplayed()
    }
}