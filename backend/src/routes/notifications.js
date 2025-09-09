const express = require("express")
const { query, validationResult } = require("express-validator")
const db = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get notifications
router.get(
  "/",
  [query("page").optional().isInt({ min: 1 }), query("limit").optional().isInt({ min: 1, max: 50 })],
  authenticateToken,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Invalid parameters" } })
      }

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 20
      const offset = (page - 1) * limit

      const [notifications] = await db.execute(
        `
      SELECT n.id, n.type, n.message, n.is_read, n.created_at,
             u.id as actor_id, u.username as actor_username, u.full_name as actor_name, u.avatar_url as actor_avatar,
             p.id as post_id, p.content as post_content
      FROM notifications n
      LEFT JOIN users u ON n.actor_id = u.id
      LEFT JOIN posts p ON n.post_id = p.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `,
        [req.user.id, limit, offset],
      )

      // Get total count
      const [countResult] = await db.execute("SELECT COUNT(*) as total FROM notifications WHERE user_id = ?", [
        req.user.id,
      ])

      // Get unread count
      const [unreadResult] = await db.execute(
        "SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE",
        [req.user.id],
      )

      res.json({
        notifications,
        pagination: {
          page,
          limit,
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit),
        },
        unread_count: unreadResult[0].unread,
      })
    } catch (error) {
      console.error("Get notifications error:", error)
      res.status(500).json({ error: { message: "Failed to fetch notifications" } })
    }
  },
)

// Mark notification as read
router.put("/:id/read", authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id

    const [result] = await db.execute("UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?", [
      notificationId,
      req.user.id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: { message: "Notification not found" } })
    }

    res.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Mark notification read error:", error)
    res.status(500).json({ error: { message: "Failed to mark notification as read" } })
  }
})

// Mark all notifications as read
router.put("/read-all", authenticateToken, async (req, res) => {
  try {
    await db.execute("UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE", [req.user.id])

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Mark all notifications read error:", error)
    res.status(500).json({ error: { message: "Failed to mark all notifications as read" } })
  }
})

module.exports = router
