const path = require("path");

module.exports = {
  root(projectRoot) {
    return path.join(projectRoot, "workspace");
  }
};
