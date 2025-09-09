const express = require("express")
const { body, query, validationResult } = require("express-validator")
const db = require("../config/database")
const { authenticateToken, optionalAuth } = require("../middleware/auth")

const router = express.Router()

// Get comments for a post
router.get(
  "/post/:postId",
  [query("page").optional().isInt({ min: 1 }), query("limit").optional().isInt({ min: 1, max: 100 })],
  optionalAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Invalid parameters" } })
      }

      const postId = req.params.postId
      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 20
      const offset = (page - 1) * limit

      // Verify post exists
      const [posts] = await db.execute("SELECT id FROM posts WHERE id = ? AND deleted_at IS NULL", [postId])

      if (posts.length === 0) {
        return res.status(404).json({ error: { message: "Post not found" } })
      }

      const [comments] = await db.execute(
        `
      SELECT c.id, c.content, c.created_at, c.updated_at,
             u.id as user_id, u.username, u.full_name, u.avatar_url, u.is_verified,
             COUNT(DISTINCT l.id) as likes_count,
             ${req.user ? `MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) as is_liked` : "0 as is_liked"}
      FROM comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN comment_likes l ON c.id = l.comment_id
      WHERE c.post_id = ? AND c.deleted_at IS NULL AND u.deleted_at IS NULL
      GROUP BY c.id, u.id
      ORDER BY c.created_at ASC
      LIMIT ? OFFSET ?
    `,
        req.user ? [req.user.id, postId, limit, offset] : [postId, limit, offset],
      )

      // Get total count
      const [countResult] = await db.execute(
        "SELECT COUNT(*) as total FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? AND c.deleted_at IS NULL AND u.deleted_at IS NULL",
        [postId],
      )

      res.json({
        comments: comments.map((comment) => ({
          ...comment,
          is_liked: Boolean(comment.is_liked),
        })),
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit),
        },
      })
    } catch (error) {
      console.error("Get comments error:", error)
      res.status(500).json({ error: { message: "Failed to fetch comments" } })
    }
  },
)

// Create comment
router.post(
  "/",
  [body("post_id").isInt({ min: 1 }), body("content").isLength({ min: 1, max: 1000 })],
  authenticateToken,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Invalid comment data" } })
      }

      const { post_id, content } = req.body

      // Verify post exists
      const [posts] = await db.execute("SELECT id FROM posts WHERE id = ? AND deleted_at IS NULL", [post_id])

      if (posts.length === 0) {
        return res.status(404).json({ error: { message: "Post not found" } })
      }

      const [result] = await db.execute("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)", [
        post_id,
        req.user.id,
        content,
      ])

      // Get the created comment with user data
      const [comments] = await db.execute(
        `
      SELECT c.id, c.content, c.created_at, c.updated_at,
             u.id as user_id, u.username, u.full_name, u.avatar_url, u.is_verified,
             0 as likes_count, 0 as is_liked
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `,
        [result.insertId],
      )

      res.status(201).json({
        message: "Comment created successfully",
        comment: comments[0],
      })
    } catch (error) {
      console.error("Create comment error:", error)
      res.status(500).json({ error: { message: "Failed to create comment" } })
    }
  },
)

// Delete comment
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id

    // Check if comment exists and belongs to user
    const [comments] = await db.execute("SELECT id FROM comments WHERE id = ? AND user_id = ? AND deleted_at IS NULL", [
      commentId,
      req.user.id,
    ])

    if (comments.length === 0) {
      return res.status(404).json({ error: { message: "Comment not found or unauthorized" } })
    }

    // Soft delete
    await db.execute("UPDATE comments SET deleted_at = NOW() WHERE id = ?", [commentId])

    res.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Delete comment error:", error)
    res.status(500).json({ error: { message: "Failed to delete comment" } })
  }
})

module.exports = router
