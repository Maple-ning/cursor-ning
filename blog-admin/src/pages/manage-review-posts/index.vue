<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

import AdminPostMarkdownEditor from '@/components/AdminPostMarkdownEditor.vue';
import { useBlogAdmin } from '@/composables/useBlogAdmin';

const { postsByCategory, upsertPost, deletePost, init } = useBlogAdmin();
const posts = computed(() => postsByCategory('review'));
const modalOpen = ref(false);

const form = reactive({
  id: undefined as number | undefined,
  title: '',
  summary: '',
  content: '',
  tagsText: '',
  date: '',
  status: 'draft' as 'draft' | 'published',
});

const reset = () => {
  form.id = undefined;
  form.title = '';
  form.summary = '';
  form.content = '';
  form.tagsText = '';
  form.date = '';
  form.status = 'draft';
};

const openCreate = () => {
  reset();
  modalOpen.value = true;
};

const editItem = (id: number) => {
  const item = posts.value.find((p) => p.id === id);
  if (!item) return;
  form.id = item.id;
  form.title = item.title;
  form.summary = item.summary;
  form.content = item.content;
  form.tagsText = item.tags.join(', ');
  form.date = item.date;
  form.status = item.status;
  modalOpen.value = true;
};

const submit = async () => {
  if (!form.title || !form.summary || !form.date) return;
  await upsertPost({
    id: form.id || undefined,
    title: form.title,
    summary: form.summary,
    content: form.content || form.summary,
    tags: form.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    date: form.date,
    category: 'review',
    status: form.status,
  });
  reset();
  modalOpen.value = false;
};

onMounted(init);
</script>

<template>
  <section>
    <a-card title="学习笔记列表">
      <template #extra>
        <a-button type="primary" @click="openCreate">新增学习笔记</a-button>
      </template>
      <div class="admin-list">
        <article v-for="item in posts" :key="item.id" class="admin-list-item">
          <div class="admin-list-top">
            <div>
              <p class="admin-list-title">{{ item.title }}</p>
              <p class="admin-list-sub">发布日期：{{ item.date }}</p>
            </div>
            <a-tag :color="item.status === 'published' ? 'green' : 'orange'">
              {{ item.status === 'published' ? '已发布' : '草稿' }}
            </a-tag>
          </div>
          <p class="admin-list-desc">{{ item.summary }}</p>
          <div v-if="item.tags.length > 0" class="mt-2 flex flex-wrap gap-1.5">
            <a-tag v-for="tag in item.tags" :key="tag" color="purple">{{ tag }}</a-tag>
          </div>
          <div class="-mx-4 my-3 border-t border-dashed border-slate-200" />
          <div class="mt-1 flex gap-3">
            <a-button @click="editItem(item.id)">编辑</a-button>
            <a-popconfirm title="确认删除吗？" @confirm="deletePost(item.id)">
              <a-button danger>删除</a-button>
            </a-popconfirm>
          </div>
        </article>
      </div>
      <a-empty v-if="posts.length === 0" description="暂无内容" />
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      :title="form.id ? '编辑学习笔记' : '新增学习笔记'"
      ok-text="保存"
      cancel-text="取消"
      width="min(1180px, 96vw)"
      :style="{ top: '28px' }"
      :styles="{ body: { maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' } }"
      wrap-class-name="post-edit-modal-wide"
      @ok="submit"
      @cancel="reset"
    >
      <div class="grid gap-3">
        <a-input v-model:value="form.title" placeholder="标题" />
        <a-input v-model:value="form.summary" placeholder="摘要" />
        <a-input v-model:value="form.tagsText" placeholder="标签，逗号分隔" />
        <a-input v-model:value="form.date" placeholder="日期，例如 2026-03-24" />
        <a-select v-model:value="form.status" placeholder="文章状态">
          <a-select-option value="draft">草稿</a-select-option>
          <a-select-option value="published">发布</a-select-option>
        </a-select>
        <AdminPostMarkdownEditor
          :key="form.id ?? 'create-review'"
          v-model="form.content"
          editor-id="admin-review-post-md"
        />
      </div>
    </a-modal>
  </section>
</template>
