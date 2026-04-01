<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { useBlogAdmin } from '@/composables/useBlogAdmin';

const { goodSites, upsertGoodSite, deleteGoodSite, init } = useBlogAdmin();
const modalOpen = ref(false);

const form = reactive({
  id: undefined as number | undefined,
  title: '',
  url: '',
  description: '',
  category: '',
  sortOrder: 0,
});

const reset = () => {
  form.id = undefined;
  form.title = '';
  form.url = '';
  form.description = '';
  form.category = '';
  form.sortOrder = 0;
};

const openCreate = () => {
  reset();
  modalOpen.value = true;
};

const editItem = (id: number) => {
  const item = goodSites.value.find((p) => p.id === id);
  if (!item) return;
  form.id = item.id;
  form.title = item.title;
  form.url = item.url;
  form.description = item.description;
  form.category = item.category;
  form.sortOrder = item.sortOrder;
  modalOpen.value = true;
};

const submit = async () => {
  if (!form.title || !form.url || !form.category) return;
  await upsertGoodSite({
    id: form.id || undefined,
    title: form.title,
    url: form.url,
    description: form.description,
    category: form.category,
    sortOrder: Number(form.sortOrder) || 0,
  });
  reset();
  modalOpen.value = false;
};

onMounted(init);
</script>

<template>
  <section>
    <a-card title="好站收藏">
      <template #extra>
        <a-button type="primary" @click="openCreate">新增好站</a-button>
      </template>
      <p class="mb-3 text-sm text-gray-500">每条记录需填写分类，前台会按分类分组展示。</p>
      <div class="flex flex-col gap-4">
        <a-card v-for="item in goodSites" :key="item.id" size="small">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p class="font-semibold text-gray-900">{{ item.title }}</p>
              <a-tag color="blue" class="mt-1">{{ item.category }}</a-tag>
              <p class="mt-1 text-sm text-gray-500">排序：{{ item.sortOrder }}</p>
            </div>
            <a
              :href="item.url"
              target="_blank"
              rel="noreferrer noopener"
              class="text-sm text-blue-600 hover:underline"
            >
              {{ item.url }}
            </a>
          </div>
          <p v-if="item.description" class="mt-2 text-sm text-gray-700">{{ item.description }}</p>
          <div class="mt-3 flex gap-2">
            <a-button size="small" @click="editItem(item.id)">编辑</a-button>
            <a-popconfirm title="确认删除吗？" @confirm="deleteGoodSite(item.id)">
              <a-button danger size="small">删除</a-button>
            </a-popconfirm>
          </div>
        </a-card>
      </div>
      <a-empty v-if="goodSites.length === 0" description="暂无内容" />
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      :title="form.id ? '编辑好站' : '新增好站'"
      ok-text="保存"
      cancel-text="取消"
      @ok="submit"
      @cancel="reset"
    >
      <div class="grid gap-3">
        <a-input v-model:value="form.title" placeholder="站点名称" />
        <a-input v-model:value="form.url" placeholder="链接，例如 https://example.com" />
        <a-input v-model:value="form.category" placeholder="分类，例如 工具 / 设计 / 文档" />
        <a-input-number v-model:value="form.sortOrder" class="w-full" :min="0" placeholder="排序（越小越靠前）" />
        <a-textarea v-model:value="form.description" :rows="3" placeholder="简介（可选）" />
      </div>
    </a-modal>
  </section>
</template>
