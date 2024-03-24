const express = require('express');
const { uuid } = require('uuidv4');
const router = express.Router();
const File = require('../models').file;
const path = require("path");
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "..", "config", "config.json"))[env];
const uploadModule = require('../modules/uploader.js');


// get all

router.get('/files', function (req, res) {
    try{
          File.findAll().then(files => {
      return res.status(200).json(files);
    })  
    }catch(err){
        console.log(err)
    }

  });



// upload files
router.post('/uploadfiles', [uploadModule], async (req, res) => {
    try {
        const createdFile = await File.create({
            file: req.uploadedFiles.find(file => file.fieldname === "file").newName,
        });
        return res.status(201).json(createdFile);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;
