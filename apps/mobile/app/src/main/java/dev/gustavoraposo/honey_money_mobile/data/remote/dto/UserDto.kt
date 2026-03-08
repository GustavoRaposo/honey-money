package dev.gustavoraposo.honey_money_mobile.data.remote.dto

import com.google.gson.annotations.SerializedName
import dev.gustavoraposo.honey_money_mobile.domain.model.User

data class UserDto(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("profile") val profile: ProfileDto,
    @SerializedName("createdAt") val createdAt: String
) {
    fun toDomain() = User(id = id, name = name, email = email, profile = profile.toDomain(), createdAt = createdAt)
}
