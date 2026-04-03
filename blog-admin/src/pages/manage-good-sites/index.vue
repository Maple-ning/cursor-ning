<script setup lang="ts">
import { ArrowDownOutlined, ArrowUpOutlined, OrderedListOutlined } from '@ant-design/icons-vue';
import { onMounted, reactive, ref, watch } from 'vue';

import { useBlogAdmin } from '@/composables/useBlogAdmin';

const {
  goodSites,
  goodSiteCategoryOrder,
  upsertGoodSite,
  deleteGoodSite,
  saveGoodSiteCategoryOrder,
  init,
} = useBlogAdmin();

const siteModalOpen = ref(false);
const categorySortModalOpen = ref(false);
const draftCategoryOrder = ref<string[]>([]);
const savingCategoryOrder = ref(false);

const form = reactive({
  id: undefined as number | undefined,
  title: '',
  url: '',
  description: '',
  category: '',
  sortOrder: 0,
});

/** 与服务器同步后的分类顺序（弹框打开时从此复制草稿） */
const localCategoryOrder = ref<string[]>([]);

const rebuildLocalCategoryOrder = () => {
  const set = new Set(goodSites.value.map((s) => s.category));
  const primary = goodSiteCategoryOrder.value.filter((c) => set.has(c));
  const missing = [...set].filter((c) => !primary.includes(c));
  missing.sort((a, b) => a.localeCompare(b, 'zh-CN'));
  localCategoryOrder.value = [...primary, ...missing];
};

watch([goodSites, goodSiteCategoryOrder], rebuildLocalCategoryOrder, { deep: true });

const openCategorySortModal = () => {
  draftCategoryOrder.value = [...localCategoryOrder.value];
  categorySortModalOpen.value = true;
};

const moveDraftUp = (index: number) => {
  if (index <= 0) return;
  const list = [...draftCategoryOrder.value];
  const prev = list[index - 1];
  const cur = list[index];
  if (prev === undefined || cur === undefined) return;
  list[index - 1] = cur;
  list[index] = prev;
  draftCategoryOrder.value = list;
};

const moveDraftDown = (index: number) => {
  if (index >= draftCategoryOrder.value.length - 1) return;
  const list = [...draftCategoryOrder.value];
  const cur = list[index];
  const next = list[index + 1];
  if (cur === undefined || next === undefined) return;
  list[index] = next;
  list[index + 1] = cur;
  draftCategoryOrder.value = list;
};

const handleCategorySortOk = async () => {
  if (draftCategoryOrder.value.length === 0) return;
  savingCategoryOrder.value = true;
  try {
    await saveGoodSiteCategoryOrder([...draftCategoryOrder.value]);
  } finally {
    savingCategoryOrder.value = false;
  }
};

const handleCategorySortCancel = () => {
  categorySortModalOpen.value = false;
};

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
  siteModalOpen.value = true;
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
  siteModalOpen.value = true;
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
  siteModalOpen.value = false;
};

onMounted(async () => {
  await init();
  rebuildLocalCategoryOrder();
});
</script>

<template>
  <section class="space-y-6">
    <a-card title="好站收藏">
      <template #extra>
        <a-space>
          <a-button :disabled="localCategoryOrder.length === 0" @click="openCategorySortModal">
            <template #icon>
              <OrderedListOutlined />
            </template>
            调整分类顺序
          </a-button>
          <a-button type="primary" @click="openCreate">新增好站</a-button>
        </a-space>
      </template>
      <p class="mb-3 text-sm text-gray-500">
        前台「好站」页的分类顺序可通过右上角「调整分类顺序」在弹框中修改；每条记录的「排序」只影响同一分类内的先后。
      </p>
      <div class="admin-list">
        <article v-for="item in goodSites" :key="item.id" class="admin-list-item">
          <div class="admin-list-top">
            <div>
              <p class="admin-list-title">{{ item.title }}</p>
              <div class="mt-1 flex flex-wrap items-center gap-2">
                <a-tag color="blue">{{ item.category }}</a-tag>
                <span class="text-xs text-slate-500">同分类排序：{{ item.sortOrder }}</span>
              </div>
            </div>
            <a
              :href="item.url"
              target="_blank"
              rel="noreferrer noopener"
              class="text-xs text-blue-600 hover:underline"
            >
              {{ item.url }}
            </a>
          </div>
          <p v-if="item.description" class="admin-list-desc">{{ item.description }}</p>
          <div class="admin-list-actions">
            <a-button size="small" @click="editItem(item.id)">编辑</a-button>
            <a-popconfirm title="确认删除吗？" @confirm="deleteGoodSite(item.id)">
              <a-button danger size="small">删除</a-button>
            </a-popconfirm>
          </div>
        </article>
      </div>
      <a-empty v-if="goodSites.length === 0" description="暂无内容" />
    </a-card>

    <a-modal
      v-model:open="categorySortModalOpen"
      title="分类展示顺序"
      ok-text="保存"
      cancel-text="取消"
      :width="520"
      :confirm-loading="savingCategoryOrder"
      destroy-on-close
      @ok="handleCategorySortOk"
      @cancel="handleCategorySortCancel"
    >
      <p class="mb-4 text-sm text-gray-500">
        自上而下对应前台好站页的分类顺序（含筛选与分组）。使用箭头调整位置后点击「保存」。
      </p>
      <a-empty v-if="draftCategoryOrder.length === 0" description="暂无分类" />
      <ul v-else class="m-0 list-none space-y-2 p-0">
        <li
          v-for="(cat, index) in draftCategoryOrder"
          :key="cat"
          class="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800/60"
        >
          <span
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
          >
            {{ index + 1 }}
          </span>
          <span class="min-w-0 flex-1 font-medium text-gray-900 dark:text-gray-100">{{ cat }}</span>
          <a-space :size="4">
            <a-button type="text" size="small" :disabled="index === 0" @click="moveDraftUp(index)">
              <template #icon>
                <ArrowUpOutlined />
              </template>
            </a-button>
            <a-button
              type="text"
              size="small"
              :disabled="index === draftCategoryOrder.length - 1"
              @click="moveDraftDown(index)"
            >
              <template #icon>
                <ArrowDownOutlined />
              </template>
            </a-button>
          </a-space>
        </li>
      </ul>
    </a-modal>

    <a-modal
      v-model:open="siteModalOpen"
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
        <a-input-number
          v-model:value="form.sortOrder"
          class="w-full"
          :min="0"
          placeholder="同分类内排序（越小越靠前）"
        />
        <a-textarea v-model:value="form.description" :rows="3" placeholder="简介（可选）" />
      </div>
    </a-modal>
  </section>
</template>
