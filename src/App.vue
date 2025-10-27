<template>
  <div class="app-container">
    <!-- Sidebar toggle button for mobile -->
    <button
      v-if="isMobile"
      @click="toggleSidebar"
      class="sidebar-toggle"
      :class="{ active: showSidebar }"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Sidebar overlay for mobile -->
    <div
      v-if="isMobile && showSidebar"
      class="sidebar-overlay"
      @click="toggleSidebar"
    ></div>

    <!-- Chat History Sidebar -->
    <div
      class="sidebar-wrapper"
      :class="{ show: showSidebar }"
    >
      <ChatHistory
        :sessions="sessions"
        :current-session-id="currentSessionId"
        @new-chat="createNewChat"
        @select-session="selectSession"
        @delete-session="deleteSessionHandler"
        @clear-all="clearAllSessions"
      />
    </div>

    <!-- Main Chat Area -->
    <LLMChat
      :session-messages="currentMessages"
      :session-id="currentSessionId"
      @update-messages="handleUpdateMessages"
      @first-message="handleFirstMessage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import LLMChat from './components/LLMChat.vue'
import ChatHistory from './components/ChatHistory.vue'
import {
  getAllSessions,
  createNewSession,
  getSession,
  updateSession,
  deleteSession,
  getCurrentSession,
  setCurrentSession,
  updateSessionTitle,
  clearAllSessions as clearStorage
} from './utils/chatStorage.js'

const sessions = ref([])
const currentSessionId = ref(null)
const showSidebar = ref(false)
const isMobile = ref(false)

// Computed property for current session messages
const currentMessages = computed(() => {
  if (!currentSessionId.value) return []
  const session = sessions.value.find(s => s.id === currentSessionId.value)
  return session ? session.messages : []
})

// Load sessions on mount
onMounted(() => {
  sessions.value = getAllSessions()

  // Check if there's a current session
  const savedSessionId = getCurrentSession()
  if (savedSessionId && sessions.value.find(s => s.id === savedSessionId)) {
    currentSessionId.value = savedSessionId
  } else if (sessions.value.length === 0) {
    // Create first session if none exists
    const newSession = createNewSession()
    sessions.value = getAllSessions()
    currentSessionId.value = newSession.id
  } else {
    // Select first session
    currentSessionId.value = sessions.value[0].id
    setCurrentSession(currentSessionId.value)
  }

  // Check if mobile
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    showSidebar.value = false
  }
}

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

const createNewChat = () => {
  const newSession = createNewSession()
  sessions.value = getAllSessions()
  currentSessionId.value = newSession.id
  if (isMobile.value) {
    showSidebar.value = false
  }
}

const selectSession = (sessionId) => {
  currentSessionId.value = sessionId
  setCurrentSession(sessionId)
  if (isMobile.value) {
    showSidebar.value = false
  }
}

const deleteSessionHandler = (sessionId) => {
  if (confirm('确定要删除这个对话吗？')) {
    deleteSession(sessionId)
    sessions.value = getAllSessions()

    // If deleting current session, switch to another or create new
    if (currentSessionId.value === sessionId) {
      if (sessions.value.length > 0) {
        currentSessionId.value = sessions.value[0].id
        setCurrentSession(currentSessionId.value)
      } else {
        createNewChat()
      }
    }
  }
}

const clearAllSessions = () => {
  if (confirm('确定要清空所有对话吗？此操作无法撤销。')) {
    clearStorage()
    sessions.value = []
    createNewChat()
  }
}

const handleUpdateMessages = (messages) => {
  if (currentSessionId.value) {
    updateSession(currentSessionId.value, { messages })
    sessions.value = getAllSessions()
  }
}

const handleFirstMessage = (firstMessage) => {
  if (currentSessionId.value) {
    updateSessionTitle(currentSessionId.value, firstMessage)
    sessions.value = getAllSessions()
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #0d0d0d;
  position: relative;
}

.sidebar-wrapper {
  flex-shrink: 0;
}

.sidebar-toggle {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 101;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: #2d2d2d;
  color: #fff;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.sidebar-toggle:hover {
  background: #3d3d3d;
  transform: scale(1.05);
}

.sidebar-toggle.active {
  background: #667eea;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  display: none;
}

/* Mobile styles */
@media (max-width: 768px) {
  .sidebar-toggle {
    display: flex;
  }

  .sidebar-wrapper {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar-wrapper.show {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }
}
</style>
