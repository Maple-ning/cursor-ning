<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { loginApi } from '@/api/modules/auth';
import { setRefreshToken, setToken } from '@/utils/auth';

const router = useRouter();
const loading = ref(false);
const errorMessage = ref('');

const form = reactive({
  username: 'admin',
  password: 'admin123',
});

const submit = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const data = await loginApi(form.username, form.password);
    setToken(data.token);
    setRefreshToken(data.refreshToken);
    await router.replace('/');
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    errorMessage.value = err?.response?.data?.message || '网络异常，请稍后重试';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.15),transparent_35%),radial-gradient(circle_at_85%_5%,rgba(15,23,42,0.1),transparent_30%),#f1f5f9] px-4"
  >
    <a-card class="w-full max-w-md">
      <div class="mb-5">
        <p class="text-2xl font-semibold text-slate-900">欢迎回来</p>
        <p class="mt-1 text-sm text-slate-500">登录后继续维护你的站点内容</p>
      </div>
      <div class="grid gap-3">
        <a-input v-model:value="form.username" placeholder="用户名" size="large" />
        <a-input-password v-model:value="form.password" placeholder="密码" size="large" />
        <a-alert v-if="errorMessage" type="error" :message="errorMessage" show-icon />
        <a-button type="primary" size="large" :loading="loading" @click="submit">登录</a-button>
      </div>
    </a-card>
  </div>
</template>
