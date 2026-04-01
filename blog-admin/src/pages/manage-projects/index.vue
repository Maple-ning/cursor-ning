<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

import { useBlogAdmin } from '@/composables/useBlogAdmin';

const { projects, upsertProject, deleteProject, init } = useBlogAdmin();
const modalOpen = ref(false);

const form = reactive({
  id: undefined as number | undefined,
  name: '',
  description: '',
  url: '',
  techStackText: '',
});

const reset = () => {
  form.id = undefined;
  form.name = '';
  form.description = '';
  form.url = '';
  form.techStackText = '';
};

const openCreate = () => {
  reset();
  modalOpen.value = true;
};

const editItem = (id: number) => {
  const item = projects.value.find((p) => p.id === id);
  if (!item) return;
  form.id = item.id;
  form.name = item.name;
  form.description = item.description;
  form.url = item.url;
  form.techStackText = item.techStack.join(', ');
  modalOpen.value = true;
};

const submit = async () => {
  if (!form.name || !form.description || !form.url) return;
  await upsertProject({
    id: form.id || undefined,
    name: form.name,
    description: form.description,
    url: form.url,
    techStack: form.techStackText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
  });
  reset();
  modalOpen.value = false;
};

onMounted(init);
</script>

<template>
  <section>
    <a-card title="项目列表">
      <template #extra>
        <a-button type="primary" @click="openCreate">新增项目</a-button>
      </template>
      <div class="flex flex-col gap-4">
        <a-card v-for="item in projects" :key="item.id" size="small">
          <p class="font-semibold text-gray-900">{{ item.name }}</p>
          <a
            :href="item.url"
            target="_blank"
            rel="noreferrer noopener"
            class="text-sm text-blue-600 hover:underline"
          >
            {{ item.url }}
          </a>
          <p class="mt-2 text-sm text-gray-700">{{ item.description }}</p>
          <div class="mt-2 flex flex-wrap gap-1">
            <a-tag v-for="tech in item.techStack" :key="tech">{{ tech }}</a-tag>
          </div>
          <div class="mt-3 flex gap-2">
            <a-button size="small" @click="editItem(item.id)">编辑</a-button>
            <a-popconfirm title="确认删除吗？" @confirm="deleteProject(item.id)">
              <a-button danger size="small">删除</a-button>
            </a-popconfirm>
          </div>
        </a-card>
      </div>
      <a-empty v-if="projects.length === 0" description="暂无内容" />
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      :title="form.id ? '编辑项目' : '新增项目'"
      ok-text="保存"
      cancel-text="取消"
      @ok="submit"
      @cancel="reset"
    >
      <div class="grid gap-3">
        <a-input v-model:value="form.name" placeholder="项目名称" />
        <a-input v-model:value="form.url" placeholder="项目地址" />
        <a-input v-model:value="form.techStackText" placeholder="技术栈，逗号分隔" />
        <a-textarea v-model:value="form.description" :rows="5" placeholder="项目介绍" />
      </div>
    </a-modal>
  </section>
</template>
