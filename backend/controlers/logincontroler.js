const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "rahasia_banget_jangan_bocor";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    global.users = global.users || [];
    const user = global.users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ status: "error", message: "Email atau password salah!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: "error", message: "Email atau password salah!" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      status: "success",
      message: "Login berhasil",
      token: token,
      userName: user.name || email.split("@")[0]
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = { login };