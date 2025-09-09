const express = require("express")
const { body, validationResult } = require("express-validator")
const db = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Toggle post like
router.post("/posts/:postId", authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId

    // Verify post exists
    const [posts] = await db.execute("SELECT id FROM posts WHERE id = ? AND deleted_at IS NULL", [postId])

    if (posts.length === 0) {
      return res.status(404).json({ error: { message: "Post not found" } })
    }

    // Check if already liked
    const [existingLikes] = await db.execute("SELECT id FROM likes WHERE post_id = ? AND user_id = ?", [
      postId,
      req.user.id,
    ])

    let isLiked
    if (existingLikes.length > 0) {
      // Unlike
      await db.execute("DELETE FROM likes WHERE post_id = ? AND user_id = ?", [postId, req.user.id])
      isLiked = false
    } else {
      // Like
      await db.execute("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [postId, req.user.id])
      isLiked = true
    }

    // Get updated like count
    const [likeCount] = await db.execute("SELECT COUNT(*) as count FROM likes WHERE post_id = ?", [postId])

    res.json({
      message: isLiked ? "Post liked" : "Post unliked",
      is_liked: isLiked,
      likes_count: likeCount[0].count,
    })
  } catch (error) {
    console.error("Toggle like error:", error)
    res.status(500).json({ error: { message: "Failed to toggle like" } })
  }
})

// Toggle comment like
router.post("/comments/:commentId", authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.commentId

    // Verify comment exists
    const [comments] = await db.execute("SELECT id FROM comments WHERE id = ? AND deleted_at IS NULL", [commentId])

    if (comments.length === 0) {
      return res.status(404).json({ error: { message: "Comment not found" } })
    }

    // Check if already liked
    const [existingLikes] = await db.execute("SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?", [
      commentId,
      req.user.id,
    ])

    let isLiked
    if (existingLikes.length > 0) {
      // Unlike
      await db.execute("DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?", [commentId, req.user.id])
      isLiked = false
    } else {
      // Like
      await db.execute("INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)", [commentId, req.user.id])
      isLiked = true
    }

    // Get updated like count
    const [likeCount] = await db.execute("SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?", [
      commentId,
    ])

    res.json({
      message: isLiked ? "Comment liked" : "Comment unliked",
      is_liked: isLiked,
      likes_count: likeCount[0].count,
    })
  } catch (error) {
    console.error("Toggle comment like error:", error)
    res.status(500).json({ error: { message: "Failed to toggle comment like" } })
  }
})

module.exports = router
