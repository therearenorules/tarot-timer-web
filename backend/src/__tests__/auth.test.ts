import request from 'supertest';
import app, { prisma } from '../index';
import jwt from 'jsonwebtoken';

// Test constants
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

describe('Authentication Endpoints', () => {
  let testUserId: string;
  let accessToken: string;

  beforeAll(async () => {
    // Ensure test database is clean
    await prisma.user.deleteMany({
      where: { email: TEST_EMAIL }
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId }
      }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          language: 'ko',
          timezone: 'Asia/Seoul'
        })
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'User registered successfully',
        user: {
          email: TEST_EMAIL,
          language: 'ko',
          timezone: 'Asia/Seoul',
          subscriptionStatus: 'trial'
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          expiresIn: expect.any(String)
        }
      });

      testUserId = response.body.user.id;
      accessToken = response.body.tokens.accessToken;

      // Verify token structure
      const decoded = jwt.decode(accessToken) as any;
      expect(decoded.userId).toBe(testUserId);
      expect(decoded.email).toBe(TEST_EMAIL);
    });

    it('should reject registration with invalid email', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: TEST_PASSWORD
        })
        .expect(400)
        .expect(res => {
          expect(res.body.error).toBe('Invalid email format');
          expect(res.body.code).toBe('INVALID_EMAIL');
        });
    });

    it('should reject registration with weak password', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          email: 'new@example.com',
          password: '123'
        })
        .expect(400)
        .expect(res => {
          expect(res.body.error).toBe('Password must be at least 6 characters long');
          expect(res.body.code).toBe('WEAK_PASSWORD');
        });
    });

    it('should reject duplicate registration', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        })
        .expect(409)
        .expect(res => {
          expect(res.body.code).toBe('USER_EXISTS');
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Login successful',
        user: {
          email: TEST_EMAIL,
          subscriptionStatus: 'trial'
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        }
      });

      accessToken = response.body.tokens.accessToken;
    });

    it('should reject login with invalid credentials', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          email: TEST_EMAIL,
          password: 'wrongpassword'
        })
        .expect(401)
        .expect(res => {
          expect(res.body.code).toBe('INVALID_CREDENTIALS');
        });
    });

    it('should reject login with missing fields', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          email: TEST_EMAIL
        })
        .expect(400)
        .expect(res => {
          expect(res.body.code).toBe('MISSING_CREDENTIALS');
        });
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user info with valid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.user).toMatchObject({
        id: testUserId,
        email: TEST_EMAIL,
        subscriptionStatus: 'trial'
      });

      expect(response.body.user.isTrialActive).toBe(true);
      expect(response.body.user.trialDaysRemaining).toBeGreaterThan(0);
    });

    it('should reject request without token', async () => {
      await request(app)
        .get('/auth/me')
        .expect(401)
        .expect(res => {
          expect(res.body.code).toBe('MISSING_TOKEN');
        });
    });

    it('should reject request with invalid token', async () => {
      await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
        .expect(res => {
          expect(res.body.code).toBe('INVALID_TOKEN');
        });
    });
  });

  describe('POST /auth/refresh-token', () => {
    let refreshToken: string;

    beforeAll(async () => {
      // Get refresh token from login
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        });

      refreshToken = response.body.tokens.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh-token')
        .send({
          refreshToken: refreshToken
        })
        .expect(200);

      expect(response.body.tokens).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(String)
      });

      // Verify new access token works
      await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${response.body.tokens.accessToken}`)
        .expect(200);
    });

    it('should reject invalid refresh token', async () => {
      await request(app)
        .post('/auth/refresh-token')
        .send({
          refreshToken: 'invalid-refresh-token'
        })
        .expect(401)
        .expect(res => {
          expect(res.body.code).toBe('INVALID_REFRESH_TOKEN');
        });
    });

    it('should reject missing refresh token', async () => {
      await request(app)
        .post('/auth/refresh-token')
        .send({})
        .expect(400)
        .expect(res => {
          expect(res.body.code).toBe('MISSING_REFRESH_TOKEN');
        });
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.message).toBe('Logout successful');
        });
    });
  });
});