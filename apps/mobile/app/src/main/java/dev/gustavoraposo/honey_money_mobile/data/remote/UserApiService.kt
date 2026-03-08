package dev.gustavoraposo.honey_money_mobile.data.remote

import dev.gustavoraposo.honey_money_mobile.data.remote.dto.UserDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Header

interface UserApiService {
    @GET("users/me")
    suspend fun getCurrentUser(
        @Header("Authorization") authorization: String
    ): Response<UserDto>
}
