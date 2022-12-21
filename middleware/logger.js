// @desc    Log to console
const logger = (err, req, res, next) => {
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`)
    next()
}

module.exports = logger