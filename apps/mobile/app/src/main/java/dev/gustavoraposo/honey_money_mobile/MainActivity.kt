package dev.gustavoraposo.honey_money_mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import dagger.hilt.android.AndroidEntryPoint
import dev.gustavoraposo.honey_money_mobile.ui.navigation.AppNavGraph
import dev.gustavoraposo.honey_money_mobile.ui.theme.HoneymoneymobileTheme

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            HoneymoneymobileTheme {
                AppNavGraph()
            }
        }
    }
}
