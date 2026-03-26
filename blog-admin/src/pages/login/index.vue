<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { loginApi } from '@/api/modules/auth'
import { setRefreshToken, setToken } from '@/utils/auth'

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')

const form = reactive({
  username: 'admin',
  password: 'admin123',
})

const submit = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await loginApi(form.username, form.password)
    setToken(data.token)
    setRefreshToken(data.refreshToken)
    await router.replace('/')
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    errorMessage.value = err?.response?.data?.message || '网络异常，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <a-card title="Blog Admin 登录" class="w-full max-w-md">
      <div class="grid gap-3">
        <a-input v-model:value="form.username" placeholder="用户名" />
        <a-input-password v-model:value="form.password" placeholder="密码" />
        <a-alert v-if="errorMessage" type="error" :message="errorMessage" show-icon />
        <a-button type="primary" :loading="loading" @click="submit">登录</a-button>
      </div>
    </a-card>
  </div>
</template>
