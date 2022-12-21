const express = require("express")
const env = require("dotenv")
const morgan = require('morgan')
const errorHandler = require('./middleware/error')
const connectMongo = require('./config/db')

// connect DB

env.config({path: './config/config.env'})
connectMongo()

// Routes
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')

const app = express()

// eligible json request
app.use(express.json())

if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'))
}

app.use("/api/v1/bootcamps", bootcamps)
app.use("/api/v1/courses", courses)
app.use(errorHandler)

const PORT = process.env.PORT || 9090

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} at PORT: ${PORT}`)
})

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err}`)

    // close server connection
    server.close(() => process.exit(1))
})