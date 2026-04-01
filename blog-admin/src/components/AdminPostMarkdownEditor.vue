<script setup lang="ts">
import { h } from 'vue';
import { MdEditor, allToolbar } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

defineProps<{
  /** 同页多个编辑器时需唯一，避免工具栏/预览冲突 */
  editorId: string;
}>();

const model = defineModel<string>({ default: '' });

const INDENT_2 = '　　';
const INDENT_4 = '　　　　';

const applyFirstLineIndent = (indent: string) => {
  const lines = (model.value ?? '').split('\n');
  let inFence = false;
  const transformed = lines.map((line) => {
    const trimmed = line.trim();

    if (/^(```|~~~)/.test(trimmed)) {
      inFence = !inFence;
      return line;
    }
    if (inFence || trimmed.length === 0) return line;

    // 跳过标题、列表、引用、分割线、表格等 Markdown 结构行
    if (/^(#{1,6}\s|>\s|[-*+]\s|\d+\.\s|`|-{3,}|_{3,}|\|)/.test(trimmed)) {
      return line;
    }

    // 统一替换为当前选择的缩进字符，避免重复叠加
    return line.replace(/^[ \t　]*/, indent);
  });

  model.value = transformed.join('\n');
};

const defToolbars = h('div', { class: 'md-indent-wrap' }, [
  h(
    'button',
    {
      type: 'button',
      class: 'md-editor-toolbar-item md-indent-btn',
      title: '首行缩进 2 字符',
      onClick: () => applyFirstLineIndent(INDENT_2),
    },
    '⤓2'
  ),
  h(
    'button',
    {
      type: 'button',
      class: 'md-editor-toolbar-item md-indent-btn',
      title: '首行缩进 4 字符',
      onClick: () => applyFirstLineIndent(INDENT_4),
    },
    '⤓4'
  ),
]);

const toolbars: any[] = [...allToolbar];
// md-editor-v3 通过数字索引读取 defToolbars.children
toolbars.splice(1, 0, 0, 1);
</script>

<template>
  <div class="admin-post-md-editor">
    <div
      class="mb-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs leading-relaxed text-neutral-600"
    >
      <span class="font-medium text-neutral-800">Markdown 语法：</span>
      <span class="ml-1">
        <code class="syntax-code"># / ##</code> 标题 · <code class="syntax-code">**粗体**</code> ·
        <code class="syntax-code">*斜体*</code> · <code class="syntax-code">`行内代码`</code> ·
        <code class="syntax-code">[文字](url)</code> · <code class="syntax-code">![图](url)</code> · 列表
        <code class="syntax-code">- </code>/<code class="syntax-code">1. </code> ·
        <code class="syntax-code">&gt; </code>引用 · 代码块用上下各一行 <code class="syntax-code">```</code> ·
        <code class="syntax-code">---</code> 分割线
      </span>
    </div>
    <MdEditor
      :id="editorId"
      v-model="model"
      :defToolbars="defToolbars"
      :toolbars="toolbars"
      language="zh-CN"
      :preview="true"
      placeholder="正文使用 Markdown，工具栏可插入格式；保存后为纯 Markdown 文本"
      :style="{ height: 'min(52vh, 520px)' }"
      class="admin-md-editor-root"
    />
  </div>
</template>

<style scoped>
.syntax-code {
  margin: 0 0.1rem;
  padding: 0.05rem 0.3rem;
  border-radius: 0.2rem;
  background: rgb(229 231 235);
  font-size: 0.7rem;
}

.admin-post-md-editor :deep(.md-indent-wrap) {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.admin-post-md-editor :deep(.md-indent-btn) {
  width: 24px;
  min-width: 24px;
  height: 24px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  line-height: 1;
}

/* 避免编辑器下拉被 Modal 裁切：弹层在 ant-modal 内提高层级 */
.admin-post-md-editor :deep(.md-editor-dropdown) {
  z-index: 1100;
}
</style>