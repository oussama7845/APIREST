import * as request from 'supertest';
import app from '../app'; // Assuming your Express app is in app.js

describe('User Routes', () => {
  let newUser;

  beforeEach(() => {
    newUser = {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      password: 'password',
    };
  });

  it('should get all users', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/createUser')
      .send(newUser);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
  });

  it('should login user with correct credentials', async () => {
    const { email, password } = newUser;
    const res = await request(app)
      .post('/login')
      .send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should return an error for incorrect login credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
    expect(res.status).toBe(403);
    expect(res.text).toBe('mot de passe incorrect');
  });
});
