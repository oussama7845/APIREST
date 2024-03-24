import * as request from 'supertest';
import app from '../app'; // Assuming your Express app is in app.js
import fs from 'fs';
import path from 'path';

describe('File Routes', () => {
  // Test GET /files
  it('should get all files', async () => {
    const res = await request(app).get('/files');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Add more assertions as needed
  });

  // Test POST /uploadfiles
  it('should upload a file', async () => {
    const filePath = path.join(__dirname, '../uploads/testUpload.png');
    const res = await request(app)
      .post('/uploadfiles')
      .attach('file', filePath); // Attach a file for upload
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    // Add more assertions as needed
  });

  // Test POST /uploadfiles with no file attached
  it('should return an error if no file is attached', async () => {
    const res = await request(app)
      .post('/uploadfiles')
      .expect(500);
    expect(res.body).toHaveProperty('error');
  });

  // Clean up uploaded files after tests (optional)
  afterAll(() => {
    // Delete uploaded files if any
    fs.unlinkSync(path.join(__dirname, '../uploads/testUpload.png'));
  });
});
