import { Suspense } from 'react'
import ChatPageContent from './chat-content'

// Force dynamic rendering to avoid SSR issues with useSearchParams
export const dynamic = 'force-dynamic'

export default function ChatWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  )
}

