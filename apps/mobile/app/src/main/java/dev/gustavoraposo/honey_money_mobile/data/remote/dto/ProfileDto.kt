package dev.gustavoraposo.honey_money_mobile.data.remote.dto

import com.google.gson.annotations.SerializedName
import dev.gustavoraposo.honey_money_mobile.domain.model.Profile

data class ProfileDto(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String
) {
    fun toDomain() = Profile(id = id, name = name)
}
