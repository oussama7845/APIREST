/**
 * @swagger
 * tags:
 *   name: Files
 *   description: API endpoints for managing files
 */

const express = require('express');
const { uuid } = require('uuidv4');
const router = express.Router();
const File = require('../models').file;
const path = require("path");
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "..", "config", "config.json"))[env];
const uploadModule = require('../modules/uploader.js');

/**
 * @swagger
 * /files:
 *   get:
 *     summary: Retrieve all files
 *     description: Retrieve a list of all files from the database.
 *     responses:
 *       '200':
 *         description: A successful response with a list of files.
 *       '500':
 *         description: Internal server error.
 */
router.get('/files', function (req, res) {
    File.findAll().then(files => {
        return res.status(200).json(files);
    }).catch(err => {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    });
});

/**
 * @swagger
 * /uploadfiles:
 *   post:
 *     summary: Upload a file
 *     description: Uploads a file and creates a new file entry in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201':
 *         description: Successfully uploaded file and created a new file entry.
 *       '500':
 *         description: Internal server error.
 */
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
