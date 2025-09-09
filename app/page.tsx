import { Header } from "@/components/header"
import { PostFeed } from "@/components/post-feed"
import { Sidebar } from "@/components/sidebar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
          <div className="lg:col-span-3">
            <PostFeed />
          </div>
        </div>
      </div>
    </div>
  )
}
