package dev.gustavoraposo.honey_money_mobile.di

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import dev.gustavoraposo.honey_money_mobile.data.repository.AuthRepositoryImpl
import dev.gustavoraposo.honey_money_mobile.data.repository.UserRepositoryImpl
import dev.gustavoraposo.honey_money_mobile.domain.repository.AuthRepository
import dev.gustavoraposo.honey_money_mobile.domain.repository.UserRepository
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindAuthRepository(impl: AuthRepositoryImpl): AuthRepository

    @Binds
    @Singleton
    abstract fun bindUserRepository(impl: UserRepositoryImpl): UserRepository
}
