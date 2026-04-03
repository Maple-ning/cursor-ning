<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';

import { useBlogAdmin } from '@/composables/useBlogAdmin';

const { projects, upsertProject, deleteProject, init } = useBlogAdmin();
const modalOpen = ref(false);

const form = reactive({
  id: undefined as number | undefined,
  name: '',
  description: '',
  url: '',
  sourceCodeUrl: '',
  techStackText: '',
});

const reset = () => {
  form.id = undefined;
  form.name = '';
  form.description = '';
  form.url = '';
  form.sourceCodeUrl = '';
  form.techStackText = '';
};

const isHttpUrl = (value: string) => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const normalizeHttpUrl = (value: string) => {
  const v = value.trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
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
  form.sourceCodeUrl = item.sourceCodeUrl;
  form.techStackText = item.techStack.join(', ');
  modalOpen.value = true;
};

const submit = async () => {
  if (!form.name || !form.description || !form.url) return;
  const normalizedUrl = normalizeHttpUrl(form.url);
  const normalizedSourceCodeUrl = normalizeHttpUrl(form.sourceCodeUrl);

  if (!isHttpUrl(normalizedUrl)) {
    message.warning('项目地址需为 http/https 链接');
    return;
  }
  if (normalizedSourceCodeUrl && !isHttpUrl(normalizedSourceCodeUrl)) {
    message.warning('源码地址需为 http/https 链接');
    return;
  }
  await upsertProject({
    id: form.id || undefined,
    name: form.name,
    description: form.description,
    url: normalizedUrl,
    sourceCodeUrl: normalizedSourceCodeUrl,
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
      <div class="admin-list">
        <article v-for="item in projects" :key="item.id" class="admin-list-item">
          <div class="admin-list-top">
            <p class="admin-list-title">{{ item.name }}</p>
            <div class="flex flex-wrap gap-1.5">
              <a-tag v-for="tech in item.techStack" :key="tech">{{ tech }}</a-tag>
            </div>
          </div>
          <div class="mt-1 space-y-1">
            <a
              :href="item.url"
              target="_blank"
              rel="noreferrer noopener"
              class="block text-xs text-blue-600 hover:underline"
            >
              线上地址：{{ item.url }}
            </a>
            <a
              v-if="item.sourceCodeUrl"
              :href="item.sourceCodeUrl"
              target="_blank"
              rel="noreferrer noopener"
              class="block text-xs text-indigo-600 hover:underline"
            >
              源码地址：{{ item.sourceCodeUrl }}
            </a>
          </div>
          <p class="admin-list-desc">{{ item.description }}</p>
          <div class="admin-list-actions">
            <a-button size="small" @click="editItem(item.id)">编辑</a-button>
            <a-popconfirm title="确认删除吗？" @confirm="deleteProject(item.id)">
              <a-button danger size="small">删除</a-button>
            </a-popconfirm>
          </div>
        </article>
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
        <a-input v-model:value="form.sourceCodeUrl" placeholder="源码地址（可选）" />
        <a-input v-model:value="form.techStackText" placeholder="技术栈，逗号分隔" />
        <a-textarea v-model:value="form.description" :rows="5" placeholder="项目介绍" />
      </div>
    </a-modal>
  </section>
</template>
