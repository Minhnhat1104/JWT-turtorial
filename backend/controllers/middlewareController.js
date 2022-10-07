import jwt from "jsonwebtoken";

const middlewareController = {
  //verify token
  verifyToken: (req, res, next) => {
    const token = req.headers.token;
    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
        if (err) {
          return res.status(403).json("Token is not valid");
        }
        req.user = user;
        next();
      });
    } else {
      res.status(401).json("You are not authenticated");
    }
  },
  //verify admin token
  verifyTokenAndAdminAuth: (req, res, next) => {
    middlewareController.verifyToken(req, res, () => {
      if (req.user.admin || req.user.id === req.params.id) {
        next();
      } else {
        res.status(403).json("You are not allowed to delete other");
      }
    });
  },
};

export default middlewareController;
