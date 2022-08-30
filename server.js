const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')

const PORT = process.env.PORT || 3000
const connectDB = require('./config/db')
connectDB()

const corsOptions = {
  origin: process.env.ALLOWED_CLIENTS.split(',')
}
app.use(cors(corsOptions));

app.use(express.json())
app.use(express.static('public'))
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

app.use('/', require('./routes/home'))
app.use('/uploaded-files', require('./routes/listing'))
app.use('/cleanup', require('./routes/cleanup'))
app.use('/api/files', require('./routes/files'))
app.use('/files', require('./routes/filePreview'))
app.use('/files/download', require('./routes/download'))

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`)
});