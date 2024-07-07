const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/users'); // Adjust the path as necessary
app.use(express.json());
app.use(router);

describe('Users Routes', () => {
  it('should get all users', async () => {
    const res = await request('http://localhost:3000').get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a new user', async () => {
    const newUser = {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example2.com',
      password: 'SheamPass123$'
    };

    const res = await request('http://localhost:3000')
      .post('/createUser')
      .send(newUser);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
  });

  it('should login user with correct credentials', async () => {
    const loginData = {
      email: 'john.doe@example2.com',
      password: 'SheamPass123$'
    };

    const res = await request('http://localhost:3000')
      .post('/login')
      .send(loginData);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should return an error for incorrect login credentials', async () => {
    const loginData = {
      email: 'john.doe@example2.com',
      password: 'SheamPass123'
    };

    const res = await request('http://localhost:3000')
      .post('/login')
      .send(loginData);
    expect(res.status).toBe(403); 
    expect(res.body).toBe('Mot de passe incorrect'); // Assuming this is the correct error message
  });
});
