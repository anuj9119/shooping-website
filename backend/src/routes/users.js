const express = require("express")
const { body, query, validationResult } = require("express-validator")
const db = require("../config/database")
const { authenticateToken, optionalAuth } = require("../middleware/auth")

const router = express.Router()

// Get user profile
router.get("/:username", optionalAuth, async (req, res) => {
  try {
    const username = req.params.username

    const [users] = await db.execute(
      `
      SELECT u.id, u.username, u.full_name, u.bio, u.avatar_url, u.is_verified, u.created_at,
             COUNT(DISTINCT f1.follower_id) as followers_count,
             COUNT(DISTINCT f2.following_id) as following_count,
             COUNT(DISTINCT p.id) as posts_count,
             ${req.user ? `MAX(CASE WHEN f3.follower_id = ? THEN 1 ELSE 0 END) as is_following` : "0 as is_following"}
      FROM users u
      LEFT JOIN follows f1 ON u.id = f1.following_id
      LEFT JOIN follows f2 ON u.id = f2.follower_id
      LEFT JOIN posts p ON u.id = p.user_id AND p.deleted_at IS NULL
      ${req.user ? "LEFT JOIN follows f3 ON u.id = f3.following_id AND f3.follower_id = ?" : ""}
      WHERE u.username = ? AND u.deleted_at IS NULL
      GROUP BY u.id
    `,
      req.user ? [req.user.id, req.user.id, username] : [username],
    )

    if (users.length === 0) {
      return res.status(404).json({ error: { message: "User not found" } })
    }

    res.json({
      user: {
        ...users[0],
        is_following: Boolean(users[0].is_following),
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ error: { message: "Failed to fetch user" } })
  }
})

// Get user posts
router.get(
  "/:username/posts",
  [query("page").optional().isInt({ min: 1 }), query("limit").optional().isInt({ min: 1, max: 50 })],
  optionalAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Invalid parameters" } })
      }

      const username = req.params.username
      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10
      const offset = (page - 1) * limit

      // First get user ID
      const [users] = await db.execute("SELECT id FROM users WHERE username = ? AND deleted_at IS NULL", [username])

      if (users.length === 0) {
        return res.status(404).json({ error: { message: "User not found" } })
      }

      const userId = users[0].id

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
      WHERE p.user_id = ? AND p.deleted_at IS NULL
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `,
        req.user ? [req.user.id, userId, limit, offset] : [userId, limit, offset],
      )

      // Get total count
      const [countResult] = await db.execute(
        "SELECT COUNT(*) as total FROM posts WHERE user_id = ? AND deleted_at IS NULL",
        [userId],
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
      console.error("Get user posts error:", error)
      res.status(500).json({ error: { message: "Failed to fetch user posts" } })
    }
  },
)

// Update profile
router.put(
  "/profile",
  [
    body("full_name").optional().isLength({ min: 1, max: 100 }),
    body("bio").optional().isLength({ max: 500 }),
    body("avatar_url").optional().isURL(),
  ],
  authenticateToken,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Invalid profile data" } })
      }

      const { full_name, bio, avatar_url } = req.body
      const updates = []
      const values = []

      if (full_name !== undefined) {
        updates.push("full_name = ?")
        values.push(full_name)
      }
      if (bio !== undefined) {
        updates.push("bio = ?")
        values.push(bio)
      }
      if (avatar_url !== undefined) {
        updates.push("avatar_url = ?")
        values.push(avatar_url)
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: { message: "No fields to update" } })
      }

      updates.push("updated_at = NOW()")
      values.push(req.user.id)

      await db.execute(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values)

      // Get updated user data
      const [users] = await db.execute(
        "SELECT id, username, email, full_name, bio, avatar_url, is_verified, created_at FROM users WHERE id = ?",
        [req.user.id],
      )

      res.json({
        message: "Profile updated successfully",
        user: users[0],
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({ error: { message: "Failed to update profile" } })
    }
  },
)

// Search users
router.get(
  "/",
  [
    query("q").notEmpty().isLength({ min: 1, max: 100 }),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Search query required" } })
      }

      const searchQuery = req.query.q
      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10
      const offset = (page - 1) * limit

      const [users] = await db.execute(
        `
      SELECT u.id, u.username, u.full_name, u.avatar_url, u.is_verified,
             COUNT(DISTINCT f.follower_id) as followers_count
      FROM users u
      LEFT JOIN follows f ON u.id = f.following_id
      WHERE (u.username LIKE ? OR u.full_name LIKE ?) AND u.deleted_at IS NULL
      GROUP BY u.id
      ORDER BY followers_count DESC, u.username ASC
      LIMIT ? OFFSET ?
    `,
        [`%${searchQuery}%`, `%${searchQuery}%`, limit, offset],
      )

      res.json({ users })
    } catch (error) {
      console.error("Search users error:", error)
      res.status(500).json({ error: { message: "Failed to search users" } })
    }
  },
)

module.exports = router
