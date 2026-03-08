package dev.gustavoraposo.honey_money_mobile.ui.feature.home

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.test.ext.junit.runners.AndroidJUnit4
import dev.gustavoraposo.honey_money_mobile.ui.theme.HoneymoneymobileTheme
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class HomeScreenTest {

    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun dado_usuario_logado_entao_exibe_titulo_bem_vindo() {
        composeRule.setContent {
            HoneymoneymobileTheme {
                HomeScreen(userName = "Gustavo Raposo")
            }
        }

        composeRule.onNodeWithTag("home_title").assertIsDisplayed()
        composeRule.onNodeWithText("Bem vindo").assertIsDisplayed()
    }

    @Test
    fun dado_usuario_logado_entao_exibe_nome_no_cabecalho() {
        composeRule.setContent {
            HoneymoneymobileTheme {
                HomeScreen(userName = "Gustavo Raposo")
            }
        }

        composeRule.onNodeWithTag("home_user_name").assertIsDisplayed()
        composeRule.onNodeWithText("Gustavo Raposo").assertIsDisplayed()
    }
}
