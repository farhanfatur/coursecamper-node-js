const mongoose = require('mongoose')

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    console.log(`MongoDB connected: ${conn.connection.host}`)
}

module.exports = connectDB