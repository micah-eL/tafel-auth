require('dotenv').config() //used for sensitive info
const logger = require('./utils/logger')
const express = require('express')
const app = express()

const cors = require('cors')
require('express-async-errors')

const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const middleware = require('./utils/middleware')

app.use(cors())
app.use(express.json())
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


