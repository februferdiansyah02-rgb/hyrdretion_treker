let profile = {
  name: "Mayonggg",
  email: "mayongmiyang@gmail.com"
};

// GET Profile
const getProfile = (req, res) => {
  res.json({
    data: profile
  });
};

// PUT Profile
const updateProfile = (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: "Nama dan email harus diisi"
    });
  }

  profile.name = name;
  profile.email = email;

  res.json({
    message: "Profile berhasil diperbarui",
    data: profile
  });
};

module.exports = {
  getProfile,
  updateProfile
};