const jwt = require("jsonwebtoken")
const db = require("../config/database")

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: { message: "Access token required" } })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verify user still exists
    const [users] = await db.execute(
      "SELECT id, username, email, avatar_url, is_verified FROM users WHERE id = ? AND deleted_at IS NULL",
      [decoded.userId],
    )

    if (users.length === 0) {
      return res.status(401).json({ error: { message: "User not found" } })
    }

    req.user = users[0]
    next()
  } catch (error) {
    return res.status(403).json({ error: { message: "Invalid or expired token" } })
  }
}

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    req.user = null
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const [users] = await db.execute(
      "SELECT id, username, email, avatar_url, is_verified FROM users WHERE id = ? AND deleted_at IS NULL",
      [decoded.userId],
    )

    req.user = users.length > 0 ? users[0] : null
  } catch (error) {
    req.user = null
  }

  next()
}

module.exports = { authenticateToken, optionalAuth }
