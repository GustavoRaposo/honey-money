package dev.gustavoraposo.honey_money_mobile.data.remote

import dev.gustavoraposo.honey_money_mobile.data.remote.dto.LoginRequestDto
import dev.gustavoraposo.honey_money_mobile.data.remote.dto.LoginResponseDto
import dev.gustavoraposo.honey_money_mobile.data.remote.dto.RegisterRequestDto
import dev.gustavoraposo.honey_money_mobile.data.remote.dto.UserDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface AuthApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequestDto): Response<LoginResponseDto>

    @POST("users")
    suspend fun register(@Body request: RegisterRequestDto): Response<UserDto>

    @POST("auth/refresh")
    suspend fun refresh(@Header("Authorization") token: String): Response<LoginResponseDto>
}