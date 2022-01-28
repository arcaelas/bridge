const config = require("./webpack.config");
module.exports = Object.assign({}, config[0], {
    watch: true,
});