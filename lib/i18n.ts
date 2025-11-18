export type Language = 'en' | 'zh'

export const translations = {
  en: {
    // Navigation
    messages: 'Messages',
    channels: 'Channels',
    contacts: 'Contacts',
    
    // Workspace
    workspaceSettings: 'Workspace settings',
    invitePeople: 'Invite people',
    signOut: 'Sign out',
    
    // User
    profileSettings: 'Profile settings',
    preferences: 'Preferences',
    
    // Chat
    typeMessage: 'Type a message...',
    send: 'Send',
    newConversation: 'New Conversation',
    
    // Contacts
    allContacts: 'All Contacts',
    departments: 'Departments',
    startChat: 'Start Chat',
    
    // Channels
    allChannels: 'All Channels',
    myChannels: 'My Channels',
    createChannel: 'Create Channel',
    channelName: 'Channel Name',
    description: 'Description',
    privacy: 'Privacy',
    publicChannel: 'Public',
    privateChannel: 'Private',
    
    // Common
    search: 'Search',
    cancel: 'Cancel',
    create: 'Create',
    save: 'Save',
  },
  zh: {
    // Navigation
    messages: '消息',
    channels: '频道',
    contacts: '通讯录',
    
    // Workspace
    workspaceSettings: '工作区设置',
    invitePeople: '邀请成员',
    signOut: '退出登录',
    
    // User
    profileSettings: '个人设置',
    preferences: '偏好设置',
    
    // Chat
    typeMessage: '输入消息...',
    send: '发送',
    newConversation: '新建会话',
    
    // Contacts
    allContacts: '所有联系人',
    departments: '部门',
    startChat: '发起聊天',
    
    // Channels
    allChannels: '所有频道',
    myChannels: '我的频道',
    createChannel: '创建频道',
    channelName: '频道名称',
    description: '描述',
    privacy: '隐私',
    publicChannel: '公开',
    privateChannel: '私密',
    
    // Common
    search: '搜索',
    cancel: '取消',
    create: '创建',
    save: '保存',
  }
}

export function getTranslation(language: Language, key: keyof typeof translations.en): string {
  return translations[language][key] || translations.en[key]
}
