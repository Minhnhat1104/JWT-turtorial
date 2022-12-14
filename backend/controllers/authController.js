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
    // x??a access l??m ??? frontend
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
// 1) local storage d??? b??? t???n c??ng XSS (ch???y script l???y token ra)
// 2) cookie ??t b??? XSS m???i khi x??c th???c d??? b??? CSRF(c??c trang web gi??? m???o y??u c???u r???i ????nh c???p c?? th??? kh???c ph???c SAMESITE o??? HTTPONLY cookie)
// 3) REDUX store -> ACCESS TOKEN
// cookie HTTPONLY -> REFRESH TOKEN

// BFF PATTERN (Backend for FrontEnd)

export default authController;
