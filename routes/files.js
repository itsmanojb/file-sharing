const router = require('express').Router()
const multer = require('multer')
const {
  v4: uuid4
} = require('uuid')
const path = require('path')
const qr = require("qrcode")
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

    const response = await file.save();
    const fileUrl = `${process.env.APP_BASE_URL}/files/${response.uuid}`;
    qr.toDataURL(fileUrl, (err, src) => {
      return res.status(200).json({
        file: fileUrl,
        qr: err ? null : src
      });
    });

  })
})

router.post('/sendmail', async (req, res) => {

  const {
    uuid,
    sender,
    recipient
  } = req.body;

  if (!uuid || !sender || !recipient) {
    return res.status(400).send({
      error: 'Missing required fields'
    })
  }

  try {
    const file = await File.findOne({
      uuid: uuid
    });

    if (!file.sender) {
      file.sender = sender;
      file.recipients = [recipient];
    } else {

      if (file.recipients.includes(recipient)) {
        return res.status(422).send({
          error: `Email already sent to ${recipient}.`
        });
      } else {
        file.recipients.push(recipient);
      }
    }

    await file.save();
    const sendMail = require('../services/emailService');
    sendMail({
      from: sender,
      to: recipient,
      subject: 'New Shared File',
      text: `${sender} shared a file with you.`,
      html: require('../services/emailTemplate')({
        sender,
        downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`,
        size: parseInt(file.size / 1000) + ' KB',
        siteLink: process.env.APP_BASE_URL,
        expires: '24 hours'
      })
    }).then(() => {
      return res.json({
        success: true
      });
    }).catch(err => {
      consolelog(err)
      return res.status(500).json({
        error: 'Error in email sending.'
      });
    });
  } catch (err) {
    console.log(err)
    return res.status(500).send({
      error: 'Something went wrong.'
    });
  }

})

module.exports = router;