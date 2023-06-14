import { ss } from '@/utils/storage'

const LOCAL_NAME = 'chatStorage'
const Role_LOCAL_NAME = 'roleChatStorage'

export function defaultState(): Chat.ChatState {
  const uuid = 1002
  return {
    active: uuid,
    usingContext: true,
    history: [{ uuid, title: 'New Chat', isEdit: false }],
    chat: [{ uuid, data: [] }],
  }
}

export function defaultRoleState(): Chat.RoleChatState {
  const uuid = 'ChatGPT 3.5'
  return {
    active: uuid,
    history: [{ uuid: 1, title: 'ChatGPT 3.5', isEdit: false }],
    chat: [{ label: uuid, data: [] }],
  }
}

export function getLocalState(): Chat.ChatState {
  const localState = ss.get(LOCAL_NAME)
  return { ...defaultState(), ...localState }
}

export function setLocalState(state: Chat.ChatState) {
  ss.set(LOCAL_NAME, state)
}

export function setQAFileName(name: string) {
  ss.set('QAFileName', name)
}

export function getQAFileName() {
  return ss.get('QAFileName')
}

export function getRoleLocalState(): Chat.RoleChatState {
  const localState = ss.get(Role_LOCAL_NAME)
  return { ...defaultRoleState(), ...localState }
}

export function setRoleLocalState(state: Chat.RoleChatState) {
  ss.set(Role_LOCAL_NAME, state)
}
