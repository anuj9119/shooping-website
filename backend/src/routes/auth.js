const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const db = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Register
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("full_name").isLength({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { message: "Validation failed", details: errors.array() } })
      }

      const { username, email, password, full_name } = req.body

      // Check if user exists
      const [existingUsers] = await db.execute("SELECT id FROM users WHERE username = ? OR email = ?", [
        username,
        email,
      ])

      if (existingUsers.length > 0) {
        return res.status(409).json({ error: { message: "Username or email already exists" } })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user
      const [result] = await db.execute(
        "INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
        [username, email, hashedPassword, full_name],
      )

      // Generate token
      const token = jwt.sign({ userId: result.insertId, username }, process.env.JWT_SECRET, { expiresIn: "7d" })

      // Get user data
      const [users] = await db.execute(
        "SELECT id, username, email, full_name, avatar_url, is_verified, created_at FROM users WHERE id = ?",
        [result.insertId],
      )

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: users[0],
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ error: { message: "Registration failed" } })
    }
  },
)

// Login
router.post("/login", [body("username").notEmpty(), body("password").notEmpty()], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: "Username and password required" } })
    }

    const { username, password } = req.body

    // Find user
    const [users] = await db.execute(
      "SELECT id, username, email, password_hash, full_name, avatar_url, is_verified FROM users WHERE (username = ? OR email = ?) AND deleted_at IS NULL",
      [username, username],
    )

    if (users.length === 0) {
      return res.status(401).json({ error: { message: "Invalid credentials" } })
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: { message: "Invalid credentials" } })
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" })

    // Remove password from response
    delete user.password_hash

    res.json({
      message: "Login successful",
      token,
      user,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: { message: "Login failed" } })
  }
})

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      `SELECT u.id, u.username, u.email, u.full_name, u.bio, u.avatar_url, u.is_verified, u.created_at,
              COUNT(DISTINCT f1.follower_id) as followers_count,
              COUNT(DISTINCT f2.following_id) as following_count,
              COUNT(DISTINCT p.id) as posts_count
       FROM users u
       LEFT JOIN follows f1 ON u.id = f1.following_id
       LEFT JOIN follows f2 ON u.id = f2.follower_id
       LEFT JOIN posts p ON u.id = p.user_id AND p.deleted_at IS NULL
       WHERE u.id = ? AND u.deleted_at IS NULL
       GROUP BY u.id`,
      [req.user.id],
    )

    if (users.length === 0) {
      return res.status(404).json({ error: { message: "User not found" } })
    }

    res.json({ user: users[0] })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ error: { message: "Failed to get user data" } })
  }
})

module.exports = router
