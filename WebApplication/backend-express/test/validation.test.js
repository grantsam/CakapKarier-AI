import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { signupSchema, loginSchema } from '../src/validations/auth.validation.js';
import { updateProfileSchema } from '../src/validations/profile.validation.js';
import { careerMatchAnalysisSchema } from '../src/validations/analysis.validation.js';

const validCareerPayload = {
  body: {
    education_level: 's1',
    skills: [{ name: 'Python', level: 'Intermediate' }],
    experience_years: 1,
    experience_text: '1 tahun membangun API Python dan SQL.',
  },
};

describe('auth validation', () => {
  it('normalizes signup and login emails', () => {
    const signup = signupSchema.parse({
      body: {
        nama: 'Budi Santoso',
        email: '  BUDI@Example.COM ',
        password: 'password123',
      },
    });

    const login = loginSchema.parse({
      body: {
        email: '  BUDI@Example.COM ',
        password: 'password123',
      },
    });

    assert.equal(signup.body.email, 'budi@example.com');
    assert.equal(login.body.email, 'budi@example.com');
  });
});

describe('profile validation', () => {
  it('normalizes email and trims profile text', () => {
    const parsed = updateProfileSchema.parse({
      body: {
        nama: ' Budi Santoso ',
        email: ' BUDI@Example.COM ',
        nomor_telepon: ' 081234567890 ',
        bio: ' Backend developer ',
      },
    });

    assert.equal(parsed.body.nama, 'Budi Santoso');
    assert.equal(parsed.body.email, 'budi@example.com');
    assert.equal(parsed.body.nomor_telepon, '081234567890');
    assert.equal(parsed.body.bio, 'Backend developer');
  });
});

describe('career-match validation', () => {
  it('defaults use_genai to false', () => {
    const parsed = careerMatchAnalysisSchema.parse(validCareerPayload);
    assert.equal(parsed.body.use_genai, false);
  });

  it('rejects invalid skill levels', () => {
    assert.throws(() => {
      careerMatchAnalysisSchema.parse({
        body: {
          ...validCareerPayload.body,
          skills: [{ name: 'Python', level: 'Expert' }],
        },
      });
    }, /Invalid option/);
  });

  it('requires experience years and experience text', () => {
    assert.throws(() => {
      careerMatchAnalysisSchema.parse({
        body: {
          education_level: 's1',
          skills: ['Python'],
        },
      });
    }, /Tahun pengalaman wajib diisi/);
  });
});
