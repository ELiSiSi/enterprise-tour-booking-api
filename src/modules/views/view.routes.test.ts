import express from 'express';
import path from 'path';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import viewRouter from './view.routes.js';
import User from '../users/user.model.js';
import { signAccessToken } from '../users/auth.controller.js';

const app = express();
app.set('view engine', 'pug');
app.set('views', path.resolve(process.cwd(), 'views'));
app.use('/', viewRouter);

const createUser = async (role: 'user' | 'admin') => {
  const user = await User.create({
    name: `${role} Views User`,
    email: `${role}-views-${Date.now()}-${Math.random()}@example.com`,
    password: 'password123',
    passwordConfirm: 'password123',
    role,
  });

  return signAccessToken({ id: user._id, roles: [role] });
};

describe('Administrative view access', () => {
  it('denies a regular user access to management pages', async () => {
    const token = await createUser('user');

    const response = await request(app)
      .get('/manage-users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('allows an administrator to access management pages', async () => {
    const token = await createUser('admin');

    const response = await request(app)
      .get('/manage-users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
