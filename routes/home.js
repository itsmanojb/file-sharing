const router = require('express').Router()
const File = require('../models/file')

router.get('/', (req, res) => {
  return res.render('home')
})

module.exports = router;