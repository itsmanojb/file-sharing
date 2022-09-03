const router = require('express').Router()
const connectDB = require('../config/db');
const File = require('../models/file');
const fs = require('fs');

connectDB();

router.get('/', async (req, res) => {

  let totalFiles = 0, deletedFiles = 0, tobeDeletedFiles = [];
  // const files = await File.find();
  const oldfiles = await File.find({
    createdAt: {
      $lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  })
  // const oldfiles = files;
  totalFiles = oldfiles.length;
  if (oldfiles.length) {
    for (const file of oldfiles) {
      try {
        fs.unlinkSync(file.path);
        await file.remove();
        console.log(`successfully deleted ${file.filename}`);
      } catch (err) {
        console.log(`error while deleting file ${err} `);
      } finally {
        tobeDeletedFiles.push(file._id);
      }
    }
  }
  const deleted = await File.deleteMany({ _id: { "$in": tobeDeletedFiles } })
  deletedFiles = deleted.deletedCount;
  const message = totalFiles > 0 ? `${deletedFiles} of total ${totalFiles} files have been deleted from storage.` : `No files are deleted`;
  return res.render('cleanup', {
    message: message,
    totalFiles: totalFiles
  })
})

module.exports = router;