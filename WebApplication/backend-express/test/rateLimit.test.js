import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRateLimiter, __rateLimitTestUtils } from '../src/middleware/rateLimit.js';

const createRes = () => ({
  headers: {},
  set(name, value) {
    this.headers[name] = value;
  },
  setHeader(name, value) {
    this.headers[name] = value;
  },
  getHeader(name) {
    return this.headers[name];
  },
});

describe('rate limiter middleware', () => {
  it('returns 429 after the configured limit', async () => {
    __rateLimitTestUtils.stores.clear();

    const limiter = createRateLimiter({
      name: 'test-limit',
      windowMs: 10000,
      max: 2,
      keyGenerator: () => 'same-key',
      message: 'Limit tercapai',
    });

    const createReq = () => ({ ip: '127.0.0.1', body: {} });
    const firstErrors = [];
    const secondErrors = [];
    const thirdErrors = [];

    await limiter(createReq(), createRes(), (error) => firstErrors.push(error));
    await limiter(createReq(), createRes(), (error) => secondErrors.push(error));
    await limiter(createReq(), createRes(), (error) => thirdErrors.push(error));

    assert.equal(firstErrors[0], undefined);
    assert.equal(secondErrors[0], undefined);
    assert.equal(thirdErrors[0].statusCode, 429);
    assert.equal(thirdErrors[0].message, 'Limit tercapai');
  });
});
