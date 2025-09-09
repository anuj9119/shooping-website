const express = require("express")
const db = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Follow/Unfollow user
router.post("/:username", authenticateToken, async (req, res) => {
  try {
    const username = req.params.username

    // Get target user
    const [users] = await db.execute("SELECT id FROM users WHERE username = ? AND deleted_at IS NULL", [username])

    if (users.length === 0) {
      return res.status(404).json({ error: { message: "User not found" } })
    }

    const targetUserId = users[0].id

    // Can't follow yourself
    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: { message: "Cannot follow yourself" } })
    }

    // Check if already following
    const [existingFollows] = await db.execute("SELECT id FROM follows WHERE follower_id = ? AND following_id = ?", [
      req.user.id,
      targetUserId,
    ])

    let isFollowing
    if (existingFollows.length > 0) {
      // Unfollow
      await db.execute("DELETE FROM follows WHERE follower_id = ? AND following_id = ?", [req.user.id, targetUserId])
      isFollowing = false
    } else {
      // Follow
      await db.execute("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", [req.user.id, targetUserId])
      isFollowing = true
    }

    // Get updated follower count
    const [followerCount] = await db.execute("SELECT COUNT(*) as count FROM follows WHERE following_id = ?", [
      targetUserId,
    ])

    res.json({
      message: isFollowing ? "User followed" : "User unfollowed",
      is_following: isFollowing,
      followers_count: followerCount[0].count,
    })
  } catch (error) {
    console.error("Toggle follow error:", error)
    res.status(500).json({ error: { message: "Failed to toggle follow" } })
  }
})

// Get followers
router.get("/:username/followers", async (req, res) => {
  try {
    const username = req.params.username

    // Get user ID
    const [users] = await db.execute("SELECT id FROM users WHERE username = ? AND deleted_at IS NULL", [username])

    if (users.length === 0) {
      return res.status(404).json({ error: { message: "User not found" } })
    }

    const [followers] = await db.execute(
      `
      SELECT u.id, u.username, u.full_name, u.avatar_url, u.is_verified
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ? AND u.deleted_at IS NULL
      ORDER BY f.created_at DESC
    `,
      [users[0].id],
    )

    res.json({ followers })
  } catch (error) {
    console.error("Get followers error:", error)
    res.status(500).json({ error: { message: "Failed to fetch followers" } })
  }
})

// Get following
router.get("/:username/following", async (req, res) => {
  try {
    const username = req.params.username

    // Get user ID
    const [users] = await db.execute("SELECT id FROM users WHERE username = ? AND deleted_at IS NULL", [username])

    if (users.length === 0) {
      return res.status(404).json({ error: { message: "User not found" } })
    }

    const [following] = await db.execute(
      `
      SELECT u.id, u.username, u.full_name, u.avatar_url, u.is_verified
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ? AND u.deleted_at IS NULL
      ORDER BY f.created_at DESC
    `,
      [users[0].id],
    )

    res.json({ following })
  } catch (error) {
    console.error("Get following error:", error)
    res.status(500).json({ error: { message: "Failed to fetch following" } })
  }
})

module.exports = router
