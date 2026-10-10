import { describe, it, expect } from 'vitest';
import User from './user.model.js';

describe('User Model', () => {
  it('should correctly hash the password before saving', async () => {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });

    await user.save();
    
    expect(user.password).not.toBe('password123');
    expect(user.passwordConfirm).toBeUndefined();
  });

  it('should lock account after 5 failed login attempts', async () => {
    const user = await User.create({
      name: 'Lock Test',
      email: 'lock@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });

    for (let i = 0; i < 5; i++) {
      await user.incrementLoginAttempts();
    }

    const updatedUser = await User.findById(user._id).select('+lockUntil +failedLoginAttempts');
    
    expect(updatedUser.failedLoginAttempts).toBe(5);
    expect(updatedUser.isLocked()).toBe(true);
    expect(updatedUser.lockUntil).toBeDefined();
  });
});
