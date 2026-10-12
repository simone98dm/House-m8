<script lang="ts" setup>
import type { BulletinNote, House, CreateBulletinNotePayload } from '~/types';

interface BulletinBoardProps {
  notes: BulletinNote[];
  currentHouse: House | null;
}

interface BulletinBoardEmits {
  'create-note': [payload: CreateBulletinNotePayload];
  'delete-note': [noteId: string];
}

const { notes = [], currentHouse: _currentHouse = null } =
  defineProps<BulletinBoardProps>();
const emit = defineEmits<BulletinBoardEmits>();

const { t } = useI18n();

const showModal = ref(false);

// Falls back rather than emitting `sticky-undefined`, which matches no rule in
// _bulletin.scss and renders the note in the board's own background — the exact
// failure that shipped while bulletin_notes had no `color` column at all.
const stickyClass = (note: BulletinNote) => `sticky-${note.color ?? 'yellow'}`;

const formatTimeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return t('bulletin.justNow') || 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return t('bulletin.yesterday') || 'Yesterday';
  return `${days} days ago`;
};

const authorName = (note: BulletinNote) => note.author?.first_name || '';

const handleCreateNote = (payload: CreateBulletinNotePayload) => {
  emit('create-note', payload);
  showModal.value = false;
};
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">📌 {{ t('bulletin.title') }}</h2>
      <UiButton
        type="button"
        variant="ghost"
        size="sm"
        :aria-label="t('a11y.buttons.postNote')"
        @click="showModal = true"
      >
        + {{ t('bulletin.newNote') }}
      </UiButton>
    </div>

    <div class="card-body" style="padding: 12px">
      <div
        class="bulletin-board"
        role="region"
        :aria-label="t('bulletin.title')"
      >
        <div
          v-if="notes.length === 0"
          style="
            text-align: center;
            color: var(--fg-muted);
            font-size: var(--fs-base);
            padding: 24px 0;
          "
        >
          {{ t('bulletin.noNotes') }}
        </div>

        <div
          v-for="note in notes"
          :key="note.id"
          class="sticky-note"
          :class="stickyClass(note)"
          style="position: relative"
        >
          <div class="note-author">
            {{ authorName(note) }} · {{ formatTimeAgo(note.created_at) }}
          </div>
          <div>{{ note.message }}</div>
          <!-- Raw: a borderless "×" glyph pinned to the sticky note's corner,
               font-size-driven not padding-driven — no UiButton equivalent. -->
          <button
            type="button"
            style="
              position: absolute;
              top: 8px;
              right: 8px;
              background: none;
              border: none;
              cursor: pointer;
              opacity: 0.5;
              font-size: var(--fs-xl);
              line-height: 1;
              padding: 0;
            "
            :aria-label="t('bulletin.deleteNote')"
            @click="emit('delete-note', note.id)"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- No `v-if` alongside `:show` — see the note in pages/expenses/index.vue:
         an outer v-if skips both the enter and leave animations. -->
    <LazyBulletinModal
      :show="showModal"
      @close="showModal = false"
      @submit="handleCreateNote"
    />
  </div>
</template>

<style lang="scss" scoped>
/* ─── Bulletin Board ──────────────────────────────────────────
   `.sticky-*` modifiers are built at runtime from the PostItColor union
   (`sticky-${note.color}`), so every member of that union needs a rule
   here even though no template names one literally. */

@use 'sass:list';

$postit-colors: (
  'yellow': (
    #fef08a,
    #422006,
  ),
  'blue': (
    #bfdbfe,
    #1e3a5f,
  ),
  'green': (
    #bbf7d0,
    #14532d,
  ),
  'pink': (
    #fecdd3,
    #4c0519,
  ),
  'purple': (
    #e9d5ff,
    #3b0764,
  ),
);

.bulletin-board {
  background: #faf9f0;
  border-radius: var(--radius-control);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;

  .dark & {
    background: #1a1e35;
  }
}

.sticky-note {
  border-radius: var(--radius-control);
  padding: 12px 14px;
  font-size: var(--fs-base);
  line-height: 1.55;
  box-shadow: 2px 3px 8px rgba(0, 0, 0, 0.2);

  .note-author {
    font-size: var(--fs-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
    opacity: 0.7;
  }
}

@each $name, $pair in $postit-colors {
  .sticky-#{$name} {
    background: list.nth($pair, 1);
    color: list.nth($pair, 2);
  }
}
</style>
