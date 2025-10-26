<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>AI 智能问答</h1>
      <p class="subtitle">多模型融合，自动选择最佳回复</p>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div class="messages-inner">
        <div v-if="messages.length === 0" class="welcome-message">
          <div class="welcome-icon">💬</div>
          <h2>你好！我能帮你什么？</h2>
          <p>系统会自动从多个AI模型中选择最佳回复</p>
        </div>

        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message-block', message.role]"
        >
          <div class="message-content">
            <div class="avatar">
              <span v-if="message.role === 'user'">👤</span>
              <span v-else>🤖</span>
            </div>
            <div class="text-content">
              <div v-if="message.role === 'assistant' && message.model" class="model-badge">
                <span class="model-label">{{ message.model }}</span>
                <span v-if="message.score !== undefined" class="score-badge">
                  ⭐ {{ message.score }}/10
                </span>
              </div>
              <div class="message-text" v-html="formatMessage(message.content)"></div>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="message-block assistant">
          <div class="message-content">
            <div class="avatar">
              <span>🤖</span>
            </div>
            <div class="text-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <div class="input-wrapper">
        <div v-if="error" class="error-toast">
          ⚠️ {{ error }}
        </div>
        <div class="input-box">
          <textarea
            v-model="userInput"
            @keydown.enter.exact.prevent="sendMessage"
            @input="autoResize"
            placeholder="发送消息..."
            class="message-input"
            ref="inputField"
            rows="1"
          ></textarea>
          <button
            @click="sendMessage"
            :disabled="!userInput.trim() || isLoading"
            class="send-btn"
            :class="{ active: userInput.trim() && !isLoading }"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const messages = ref([])
const userInput = ref('')
const isLoading = ref(false)
const error = ref('')
const messagesContainer = ref(null)
const inputField = ref(null)

// 根据环境自动选择API地址
// 开发环境：直接访问后端 localhost:8081
// 生产环境：通过nginx代理访问 /api/
const API_URL = import.meta.env.PROD
  ? '/api/chat/best-response'
  : 'http://localhost:8081/api/chat/best-response'

const formatMessage = (content) => {
  if (!content) return ''
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/###\s+(.*?)(<br>|<\/p>)/g, '<h3>$1</h3>')
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

const autoResize = () => {
  nextTick(() => {
    if (inputField.value) {
      inputField.value.style.height = 'auto'
      const newHeight = Math.min(inputField.value.scrollHeight, 200)
      inputField.value.style.height = newHeight + 'px'
    }
  })
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  const question = userInput.value.trim()

  messages.value.push({
    role: 'user',
    content: question
  })

  userInput.value = ''
  if (inputField.value) {
    inputField.value.style.height = 'auto'
  }

  isLoading.value = true
  error.value = ''
  scrollToBottom()

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: question
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`请求失败 (HTTP ${response.status})`)
    }

    const data = await response.json()

    messages.value.push({
      role: 'assistant',
      content: data.content,
      model: data.model,
      score: data.score
    })

    scrollToBottom()
  } catch (err) {
    error.value = `${err.message} - 请检查后端服务是否正确配置CORS`
    console.error('API Error:', err)

    setTimeout(() => {
      error.value = ''
    }, 5000)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: #0d0d0d;
  color: #ececec;
  overflow: hidden;
}

.chat-header {
  flex-shrink: 0;
  background: #0d0d0d;
  border-bottom: 1px solid #2d2d2d;
  padding: 16px 20px;
  text-align: center;
}

.chat-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #8e8ea0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #0d0d0d;
}

.messages-inner {
  max-width: 48rem;
  margin: 0 auto;
  padding: 20px 16px 100px;
}

.welcome-message {
  text-align: center;
  padding: 80px 20px;
}

.welcome-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.welcome-message h2 {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #fff;
}

.welcome-message p {
  font-size: 16px;
  color: #8e8ea0;
  margin: 0;
}

.message-block {
  margin-bottom: 32px;
}

.message-block.user .message-content {
  background: #2d2d2d;
  border-radius: 18px;
  padding: 20px;
}

.message-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.message-block.user .avatar {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.text-content {
  flex: 1;
  min-width: 0;
}

.model-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 11px;
}

.model-label {
  background: #1a1a1a;
  color: #8e8ea0;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.score-badge {
  color: #ffd700;
  font-weight: 600;
}

.message-text {
  font-size: 15px;
  line-height: 1.75;
  color: #ececec;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message-text :deep(strong) {
  font-weight: 600;
  color: #fff;
}

.message-text :deep(h3) {
  font-size: 18px;
  font-weight: 600;
  margin: 20px 0 12px 0;
  color: #fff;
}

.message-text :deep(p) {
  margin: 12px 0;
}

.typing-indicator {
  display: flex;
  gap: 6px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8e8ea0;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  40% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.input-area {
  flex-shrink: 0;
  background: #0d0d0d;
  border-top: 1px solid #2d2d2d;
  padding: 16px 0 20px;
}

.input-wrapper {
  max-width: 48rem;
  margin: 0 auto;
  padding: 0 16px;
}

.error-toast {
  background: #4a1f1f;
  color: #ff6b6b;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  margin-bottom: 12px;
  border: 1px solid #6d2929;
}

.input-box {
  background: #2d2d2d;
  border-radius: 24px;
  border: 1px solid #3d3d3d;
  display: flex;
  align-items: flex-end;
  padding: 4px;
  transition: all 0.2s;
}

.input-box:focus-within {
  border-color: #565869;
  box-shadow: 0 0 0 3px rgba(86, 88, 105, 0.1);
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 15px;
  padding: 12px 16px;
  resize: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
  max-height: 200px;
}

.message-input::placeholder {
  color: #8e8ea0;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #3d3d3d;
  color: #8e8ea0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  margin: 2px;
}

.send-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.send-btn.active:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #3d3d3d;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #565869;
}

.message-input::-webkit-scrollbar {
  width: 4px;
}

.message-input::-webkit-scrollbar-thumb {
  background: #3d3d3d;
  border-radius: 2px;
}

/* 平板适配 (768px - 1024px) */
@media (max-width: 1024px) and (min-width: 769px) {
  .messages-inner,
  .input-wrapper {
    max-width: 42rem;
  }
}

/* 手机竖屏适配 (≤768px) */
@media (max-width: 768px) {
  .chat-header {
    padding: 12px 16px;
  }

  .chat-header h1 {
    font-size: 16px;
  }

  .subtitle {
    font-size: 11px;
  }

  .messages-inner {
    padding: 16px 12px 80px;
  }

  .message-content {
    gap: 12px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    font-size: 18px;
  }

  .message-text {
    font-size: 14px;
  }

  .message-input {
    font-size: 16px; /* 防止iOS自动缩放 */
  }

  .welcome-message {
    padding: 60px 16px;
  }

  .welcome-icon {
    font-size: 48px;
  }

  .welcome-message h2 {
    font-size: 24px;
  }

  .welcome-message p {
    font-size: 14px;
  }

  .message-block.user .message-content {
    padding: 16px;
  }
}

/* 小屏手机适配 (≤480px) */
@media (max-width: 480px) {
  .input-area {
    padding: 12px 0 16px;
  }

  .input-wrapper {
    padding: 0 12px;
  }

  .message-input {
    padding: 10px 14px;
    font-size: 16px;
  }

  .send-btn {
    width: 32px;
    height: 32px;
  }
}

/* 大屏电脑适配 (≥1440px) */
@media (min-width: 1440px) {
  .messages-inner,
  .input-wrapper {
    max-width: 56rem;
  }
}
</style>
