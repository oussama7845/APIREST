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
const User = require('../models').User;


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
 *     summary: Upload a file and associate it with the authenticated user.
 *     tags:
 *       - Files
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
 *               id:
 *                 type: integer
 *                 description: User ID
 *     responses:
 *       '201':
 *         description: File uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 file:
 *                   type: string
 *               example:
 *                 id: 1
 *                 file: "example-file.txt"
 *       '500':
 *         description: Internal Server Error.
 */
router.post('/uploadfiles', [uploadModule], async (req, res) => {
    try {
        // Retrieve the user ID from the request body or authenticated user
        const userId = req.body.id || (req.user && req.user.id);
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Ensure the file was uploaded
        const fileField = req.uploadedFiles.find(file => file.fieldname === "file");
        if (!fileField) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Create the file instance with associated user ID
        const createdFile = await File.create({
            file: fileField.newName,
            UserId: userId, // Associate the file with the user
        });

        return res.status(201).json(createdFile);
    } catch (error) {
        console.error('Error uploading or creating file:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;
