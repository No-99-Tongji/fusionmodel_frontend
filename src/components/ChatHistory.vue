<template>
  <div class="chat-history">
    <div class="history-header">
      <h2>对话历史</h2>
      <button @click="$emit('new-chat')" class="new-chat-btn" title="新建对话">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 5v14M5 12h14" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="sessions-list">
      <div
        v-for="session in sessions"
        :key="session.id"
        :class="['session-item', { active: session.id === currentSessionId }]"
        @click="$emit('select-session', session.id)"
      >
        <div class="session-content">
          <div class="session-title">{{ session.title }}</div>
          <div class="session-meta">
            {{ formatDate(session.updatedAt) }} · {{ session.messages.length }}条消息
          </div>
        </div>
        <button
          @click.stop="$emit('delete-session', session.id)"
          class="delete-btn"
          title="删除对话"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div v-if="sessions.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <p>暂无对话历史</p>
        <p class="empty-hint">点击上方按钮开始新对话</p>
      </div>
    </div>

    <div class="history-footer">
      <button
        v-if="sessions.length > 0"
        @click="$emit('clear-all')"
        class="clear-all-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke-width="2" stroke-linecap="round"/>
        </svg>
        清空所有对话
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  sessions: {
    type: Array,
    required: true
  },
  currentSessionId: {
    type: String,
    default: null
  }
})

defineEmits(['new-chat', 'select-session', 'delete-session', 'clear-all'])

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  }
}
</script>

<style scoped>
.chat-history {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a1a;
  border-right: 1px solid #2d2d2d;
  width: 280px;
  flex-shrink: 0;
}

.history-header {
  padding: 16px;
  border-bottom: 1px solid #2d2d2d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0d0d0d;
}

.history-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.new-chat-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #2d2d2d;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.new-chat-btn:hover {
  background: #3d3d3d;
  transform: scale(1.05);
}

.sessions-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.session-item:hover {
  background: #2d2d2d;
}

.session-item.active {
  background: #2d2d2d;
  border-left: 3px solid #667eea;
}

.session-content {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 14px;
  color: #fff;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-meta {
  font-size: 11px;
  color: #8e8ea0;
}

.delete-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #8e8ea0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.session-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #4a1f1f;
  color: #ff6b6b;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8e8ea0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 8px 0;
  font-size: 14px;
}

.empty-hint {
  font-size: 12px;
  opacity: 0.7;
}

.history-footer {
  padding: 12px;
  border-top: 1px solid #2d2d2d;
  background: #0d0d0d;
}

.clear-all-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: #2d2d2d;
  color: #8e8ea0;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.clear-all-btn:hover {
  background: #4a1f1f;
  color: #ff6b6b;
}

/* 滚动条样式 */
.sessions-list::-webkit-scrollbar {
  width: 6px;
}

.sessions-list::-webkit-scrollbar-track {
  background: transparent;
}

.sessions-list::-webkit-scrollbar-thumb {
  background: #2d2d2d;
  border-radius: 3px;
}

.sessions-list::-webkit-scrollbar-thumb:hover {
  background: #3d3d3d;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-history {
    width: 100%;
    max-width: 280px;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
  }
}
</style>

