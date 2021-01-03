module.exports = function (req, res, next) {
    if (!req.player.isAdmin) return res.status(403).send("Accesss denied.");
    next();
}