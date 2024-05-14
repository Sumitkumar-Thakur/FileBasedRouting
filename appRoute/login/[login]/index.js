export const POST = (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(400).json({ message: "Invalid username or password" });
  }
};
