"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon } from "lucide-react"
import { PostCard } from "@/components/post-card"

// Mock data for posts
const mockPosts = [
  {
    id: "1",
    author: {
      name: "Alice Johnson",
      handle: "@alicej",
      avatar: "female+developer+avatar",
    },
    content:
      "Just deployed my first microservice to Kubernetes! The learning curve was steep but totally worth it. Spring Boot + Docker + K8s = 🚀",
    timestamp: "2h ago",
    likes: 24,
    comments: 8,
    shares: 3,
    isLiked: false,
  },
  {
    id: "2",
    author: {
      name: "David Park",
      handle: "@davidp",
      avatar: "male+engineer+avatar",
    },
    content:
      "Working on a new React component library. The TypeScript integration is making development so much smoother. Anyone else loving the DX improvements?",
    timestamp: "4h ago",
    likes: 18,
    comments: 12,
    shares: 5,
    isLiked: true,
  },
  {
    id: "3",
    author: {
      name: "Emma Rodriguez",
      handle: "@emmar",
      avatar: "female+designer+avatar",
    },
    content:
      "Design systems are game changers! Just finished implementing our new component tokens and the consistency across our app is incredible.",
    timestamp: "6h ago",
    likes: 31,
    comments: 6,
    shares: 8,
    isLiked: false,
  },
]

export function PostFeed() {
  const [newPost, setNewPost] = useState("")

  const handlePost = () => {
    if (newPost.trim()) {
      // This would typically call an API endpoint
      console.log("[v0] New post:", newPost)
      setNewPost("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/diverse-user-avatars.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="text-accent">
              <ImageIcon className="h-4 w-4 mr-2" />
              Add Image
            </Button>
            <Button onClick={handlePost} disabled={!newPost.trim()} className="bg-primary hover:bg-primary/90">
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
