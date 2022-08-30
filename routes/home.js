const router = require('express').Router()

router.get('/', (req, res) => {
  return res.render('home')
})

module.exports = router;