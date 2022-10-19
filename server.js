const express = require("express")
const env = require("dotenv")

env.config({path: './config/config.env'})

const app = express()

const PORT = process.env.PORT || 9090

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} at PORT: ${PORT}`)
})