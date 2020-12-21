const express = require('express')
const fs = require('fs');
const cors = require('cors')
const redis = require('./redis');
const app = express()
const port = 8111

app.use(cors())

app.get('/', (req, res) => {
  res.send('near status')
})

app.get('/status', async (req, res) => {
  // res.send('Hello World!')
  try {
    const data = await redis.smembers("iplist")
    res.json({ data })
  } catch (error) {
    res.json(error)
  }

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})