"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react"

interface Post {
  id: string
  author: {
    name: string
    handle: string
    avatar: string
  }
  content: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)

  const handleLike = () => {
    // This would typically call an API endpoint
    console.log("[v0] Like action for post:", post.id)
    setIsLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const handleComment = () => {
    console.log("[v0] Comment action for post:", post.id)
  }

  const handleShare = () => {
    console.log("[v0] Share action for post:", post.id)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`/abstract-geometric-shapes.png?height=40&width=40&query=${post.author.avatar}`} />
              <AvatarFallback>
                {post.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-sm">{post.author.name}</div>
              <div className="text-xs text-muted-foreground">
                {post.author.handle} · {post.timestamp}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm leading-relaxed mb-4">{post.content}</p>

        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`gap-2 ${isLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            {likesCount}
          </Button>

          <Button variant="ghost" size="sm" onClick={handleComment} className="gap-2 hover:text-accent">
            <MessageCircle className="h-4 w-4" />
            {post.comments}
          </Button>

          <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2 hover:text-accent">
            <Share className="h-4 w-4" />
            {post.shares}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
