const router = require('express').Router()
const connectDB = require('../config/db');
const File = require('../models/file');
const fs = require('fs');

connectDB();

router.get('/', async (req, res) => {

  let totalFiles = 0, deletedFiles = 0, tobeDeletedFiles = [];
  const files = await File.find();
  const oldfiles = await File.find({
    createdAt: {
      $lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  })
  totalFiles = oldfiles.length;
  if (oldfiles.length) {
    for (const file of files) {
      try {
        fs.unlinkSync(file.path);
        await file.remove();
        console.log(`successfully deleted ${file.filename}`);
        tobeDeletedFiles.push(file._id)
      } catch (err) {
        console.log(`error while deleting file ${err} `);
      }
    }
  }
  // const updated = await File.updateMany({ uuid: { "$in": tobeDeletedFiles }}, { 
  //   $set: { 
  //     "status": 'deleted'
  //   }
  // })
  // deletedFiles = updated.nModified;
  const deleted = await File.deleteMany({ _id: { "$in": tobeDeletedFiles }})
  deletedFiles = deleted.deletedCount;
  const message = totalFiles > 0 ? `${deletedFiles} of total ${totalFiles} files have been deleted from storage.` : `No files are deleted`;
  return res.render('cleanup', {
    message: message,
    totalFiles: totalFiles
  })
})

module.exports = router;