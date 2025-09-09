const express = require("express")
const { body, query, validationResult } = require("express-validator")
const db = require("../config/database")
const { authenticateToken, optionalAuth } = require("../middleware/auth")

const router = express.Router()

// Get posts feed
router.get(
  "/",
  [query("page").optional().isInt({ min: 1 }), query("limit").optional().isInt({ min: 1, max: 50 })],
  optionalAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Invalid parameters" } })
      }

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10
      const offset = (page - 1) * limit

      let query = `
      SELECT p.id, p.content, p.image_url, p.created_at, p.updated_at,
             u.id as user_id, u.username, u.full_name, u.avatar_url, u.is_verified,
             COUNT(DISTINCT l.id) as likes_count,
             COUNT(DISTINCT c.id) as comments_count,
             ${req.user ? `MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) as is_liked` : "0 as is_liked"}
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id AND c.deleted_at IS NULL
      WHERE p.deleted_at IS NULL AND u.deleted_at IS NULL
    `

      const params = req.user ? [req.user.id] : []

      query += `
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `

      params.push(limit, offset)

      const [posts] = await db.execute(query, params)

      // Get total count
      const [countResult] = await db.execute(
        "SELECT COUNT(*) as total FROM posts p JOIN users u ON p.user_id = u.id WHERE p.deleted_at IS NULL AND u.deleted_at IS NULL",
      )

      res.json({
        posts: posts.map((post) => ({
          ...post,
          is_liked: Boolean(post.is_liked),
        })),
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit),
        },
      })
    } catch (error) {
      console.error("Get posts error:", error)
      res.status(500).json({ error: { message: "Failed to fetch posts" } })
    }
  },
)

// Create post
router.post(
  "/",
  [body("content").isLength({ min: 1, max: 2000 }), body("image_url").optional().isURL()],
  authenticateToken,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Invalid post data" } })
      }

      const { content, image_url } = req.body

      const [result] = await db.execute("INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)", [
        req.user.id,
        content,
        image_url || null,
      ])

      // Get the created post with user data
      const [posts] = await db.execute(
        `
      SELECT p.id, p.content, p.image_url, p.created_at, p.updated_at,
             u.id as user_id, u.username, u.full_name, u.avatar_url, u.is_verified,
             0 as likes_count, 0 as comments_count, 0 as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `,
        [result.insertId],
      )

      res.status(201).json({
        message: "Post created successfully",
        post: posts[0],
      })
    } catch (error) {
      console.error("Create post error:", error)
      res.status(500).json({ error: { message: "Failed to create post" } })
    }
  },
)

// Get single post
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const postId = req.params.id

    const [posts] = await db.execute(
      `
      SELECT p.id, p.content, p.image_url, p.created_at, p.updated_at,
             u.id as user_id, u.username, u.full_name, u.avatar_url, u.is_verified,
             COUNT(DISTINCT l.id) as likes_count,
             COUNT(DISTINCT c.id) as comments_count,
             ${req.user ? `MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) as is_liked` : "0 as is_liked"}
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id AND c.deleted_at IS NULL
      WHERE p.id = ? AND p.deleted_at IS NULL AND u.deleted_at IS NULL
      GROUP BY p.id, u.id
    `,
      req.user ? [req.user.id, postId] : [postId],
    )

    if (posts.length === 0) {
      return res.status(404).json({ error: { message: "Post not found" } })
    }

    res.json({
      post: {
        ...posts[0],
        is_liked: Boolean(posts[0].is_liked),
      },
    })
  } catch (error) {
    console.error("Get post error:", error)
    res.status(500).json({ error: { message: "Failed to fetch post" } })
  }
})

// Delete post
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id

    // Check if post exists and belongs to user
    const [posts] = await db.execute("SELECT id FROM posts WHERE id = ? AND user_id = ? AND deleted_at IS NULL", [
      postId,
      req.user.id,
    ])

    if (posts.length === 0) {
      return res.status(404).json({ error: { message: "Post not found or unauthorized" } })
    }

    // Soft delete
    await db.execute("UPDATE posts SET deleted_at = NOW() WHERE id = ?", [postId])

    res.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Delete post error:", error)
    res.status(500).json({ error: { message: "Failed to delete post" } })
  }
})

module.exports = router
