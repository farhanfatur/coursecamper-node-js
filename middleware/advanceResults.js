const advanceResults = (model, populate) => async (req, res, next) => {
    let query;
    const reqQuery = {...req.query};
    const removeField = ['select', 'sort'];
    let queryStr = JSON.stringify(reqQuery);

    removeField.forEach(param => delete reqQuery[param]);

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/, match => `$${match}`);
    query = model.find(JSON.parse(queryStr));
    
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    if (req.query.sort) {
        const fields = req.query.sort.split(',').join(' ');
        query = query.sort(fields);
    }else {
        query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    if (populate) {
        query = query.populate(populate)
    }

    query = query.skip(startIndex).limit(limit)

    const resource = await query;
    const count = resource.length;
    const pagination = {}

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.previous = {
            page: page - 1,
            limit
        }
    }

    res.advanceResults = {
        success: true,
        count: count,
        pagination,
        data: resource
    }

    next()
}

module.exports = advanceResults