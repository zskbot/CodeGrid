module.exports = {
  authenticate(req, res, next) {
    req.user = { id: "local", name: "CodeGrid User" };
    next();
  }
};
