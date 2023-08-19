const express = require("express")
const path = require('path')
const env = require("dotenv")
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileupload = require("express-fileupload")
const errorHandler = require('./middleware/error')
const connectMongo = require('./config/db')

// connect DB
env.config({path: './config/config.env'})
connectMongo()

// Routes
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auths = require('./routes/auth')
const users = require('./routes/users')

const app = express()

// eligible json request
app.use(express.json())

if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'))
}

app.use(fileupload())
app.use(cookieParser())

// set static folder
app.use(express.static(path.join(__dirname, 'public')))

app.use("/api/v1/bootcamps", bootcamps)
app.use("/api/v1/courses", courses)
app.use("/api/v1/auth", auths)
app.use("/api/v1/user", users)
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