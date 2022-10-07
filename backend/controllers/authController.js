import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

let refreshTokens = [];

const authController = {
  //RESGISTER
  registerUser: async (req, res) => {
    try {
      //hash password
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      //Create new user
      const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
      });

      //Save to DB
      const user = await newUser.save();
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },

  //GENERATE ACCESS TOKEN
  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "20s" }
    );
  },

  //GENERATE REFRESH TOKEN
  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "365d" }
    );
  },
  //LOGIN
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        return res.status(404).json("Wrong username");
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(404).json("Wrong password");
      }
      if (user && validPassword) {
        const accessToken = authController.generateAccessToken(user);
        const refreshToken = authController.generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        const { password, ...other } = user._doc;
        res.status(200).json({ ...other, accessToken });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //LOG OUT
  logoutUser: (req, res) => {
    res.clearCookie("refreshToken");
    // xóa access làm ở frontend
    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshToken
    );
    res.status(200).json("Log out successfully");
  },

  //REQUEST REFRESH TOKEN
  requestRefreshToken: (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json("Refresh is not valid");
    }
    if (!refreshToken) {
      res.status(401).json("You're not authenticated");
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
      if (err) {
        return console.log(err);
      }
      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateRefreshToken(user);
      refreshTokens.push(newRefreshToken);
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      res.status(200).json({ accessToken: newAccessToken });
    });
  },
};

//STORE TOKEN
// 1) local storage dễ bị tấn công XSS (chạy script lấy token ra)
// 2) cookie ít bị XSS mỗi khi xác thực dễ bị CSRF(các trang web giả mạo yêu cầu rồi đánh cắp có thể khắc phục SAMESITE oở HTTPONLY cookie)
// 3) REDUX store -> ACCESS TOKEN
// cookie HTTPONLY -> REFRESH TOKEN

// BFF PATTERN (Backend for FrontEnd)

export default authController;
