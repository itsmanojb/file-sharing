const router = require('express').Router()
const multer = require('multer')
const {
  v4: uuid4
} = require('uuid')
const path = require('path')
const File = require('../models/file')

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqname = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqname)
  }
})

let upload = multer({
  storage,
  limits: {
    fileSize: 100000 * 100 // 100 MB
  }
}).single('myFile')

router.post('/', (req, res) => {

  upload(req, res, async (err) => {

    // Validate 
    if (!req.file) {
      return res.status(400).json({
        error: 'File missing'
      })
    }

    if (err) {
      return res.status(500).send({
        error: err.message
      })
    }
    const file = new File({
      filename: req.file.filename,
      uuid: uuid4(),
      path: req.file.path,
      size: req.file.size
    })

    const response = await file.save()
    console.log(response);
    return res.status(200).json({
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`
    })

  })


  // Response -> link

})

module.exports = router;