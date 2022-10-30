const express = require("express")
const env = require("dotenv")
const morgan = require('morgan')

// Routes
const bootcamps = require('./routes/bootcamps')

env.config({path: './config/config.env'})

const app = express()

if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'))
}

app.use("/api/v1/bootcamps", bootcamps)

const PORT = process.env.PORT || 9090

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} at PORT: ${PORT}`)
})