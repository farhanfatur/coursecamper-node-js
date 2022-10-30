// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = (req, res, next) => {
    res.status(200).json({id: 1, msg: 'Show all bootcamps'})
}

// @desc    Get one bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = (req, res, next) => {
    res.status(200).json({id: 1, msg: `Show bootcamps from id ${req.params.id}`})
}

// @desc    Create new bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = (req, res, next) => {
    res.status(201).json({id: 1, msg: 'Create new bootcamps'})
}

// @desc    Update data bootcamps
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({id: 1, msg: `Update bootcamps from id ${req.params.id}`})
}

// @desc    Delete single bootcamp
// @route   Delete /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({id: 1, msg: `Delete bootcamps from id ${req.params.id}`})
}