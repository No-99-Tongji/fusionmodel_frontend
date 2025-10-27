// Chat history storage utilities using localStorage

const STORAGE_KEY = 'llm_chat_histories'
const CURRENT_SESSION_KEY = 'llm_current_session'

/**
 * Get all chat sessions from localStorage
 * @returns {Array} Array of chat sessions
 */
export function getAllSessions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error loading chat sessions:', error)
    return []
  }
}

/**
 * Save all chat sessions to localStorage
 * @param {Array} sessions - Array of chat sessions
 */
export function saveAllSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch (error) {
    console.error('Error saving chat sessions:', error)
  }
}

/**
 * Create a new chat session
 * @param {String} title - Optional title for the session
 * @returns {Object} New session object
 */
export function createNewSession(title = '') {
  const session = {
    id: Date.now().toString(),
    title: title || `新对话 ${new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const sessions = getAllSessions()
  sessions.unshift(session) // Add to beginning
  saveAllSessions(sessions)
  setCurrentSession(session.id)

  return session
}

/**
 * Get a specific session by ID
 * @param {String} sessionId
 * @returns {Object|null} Session object or null if not found
 */
export function getSession(sessionId) {
  const sessions = getAllSessions()
  return sessions.find(s => s.id === sessionId) || null
}

/**
 * Update a session
 * @param {String} sessionId
 * @param {Object} updates - Object with fields to update
 */
export function updateSession(sessionId, updates) {
  const sessions = getAllSessions()
  const index = sessions.findIndex(s => s.id === sessionId)

  if (index !== -1) {
    sessions[index] = {
      ...sessions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    saveAllSessions(sessions)
  }
}

/**
 * Delete a session
 * @param {String} sessionId
 */
export function deleteSession(sessionId) {
  const sessions = getAllSessions()
  const filtered = sessions.filter(s => s.id !== sessionId)
  saveAllSessions(filtered)

  // If deleting current session, clear current session
  if (getCurrentSession() === sessionId) {
    localStorage.removeItem(CURRENT_SESSION_KEY)
  }
}

/**
 * Get current active session ID
 * @returns {String|null}
 */
export function getCurrentSession() {
  return localStorage.getItem(CURRENT_SESSION_KEY)
}

/**
 * Set current active session ID
 * @param {String} sessionId
 */
export function setCurrentSession(sessionId) {
  localStorage.setItem(CURRENT_SESSION_KEY, sessionId)
}

/**
 * Update session title automatically based on first message
 * @param {String} sessionId
 * @param {String} firstMessage
 */
export function updateSessionTitle(sessionId, firstMessage) {
  const title = firstMessage.length > 30
    ? firstMessage.substring(0, 30) + '...'
    : firstMessage
  updateSession(sessionId, { title })
}

/**
 * Add a message to a session
 * @param {String} sessionId
 * @param {Object} message
 */
export function addMessageToSession(sessionId, message) {
  const session = getSession(sessionId)
  if (session) {
    session.messages.push(message)
    updateSession(sessionId, { messages: session.messages })
  }
}

/**
 * Clear all sessions (with confirmation in UI)
 */
export function clearAllSessions() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(CURRENT_SESSION_KEY)
}

