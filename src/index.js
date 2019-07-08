const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
require('./db/mongoose')
const userRouter = require('./routers/user')
const invoiceRouter = require('./routers/invoice')
const versionAlive = require('./routers/versionAlive')

const app = express() // will be used to create routes and start listening port
const port = process.env.PORT // prod vs local port for server

app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(invoiceRouter)
app.use(versionAlive)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded( { extended: false }))

app.listen(port, () => {
    console.log('INVOICE SERVER is live on ', port)
})

