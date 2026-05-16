import { z } from 'zod';

const optionalText = z.string().trim().optional().nullable();
const optionalProfileNumber = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce.number().min(0).max(60).optional(),
);
const stringArrayOrText = z.union([z.array(z.string().trim().min(1)), z.string().trim()]).optional();
const skillObject = z.object({
  name: z.string().trim().min(1),
  level: z.string().trim().optional(),
});

const experienceSchema = z.object({
  type: z.string().trim().optional(),
  role: z.string().trim().optional(),
  organization: z.string().trim().optional(),
  duration_months: z.coerce.number().min(0).max(720).optional(),
  duration_years: z.coerce.number().min(0).max(60).optional(),
  description: z.string().trim().optional(),
  skills_used: stringArrayOrText,
});

export const careerMatchAnalysisSchema = z.object({
  body: z
    .object({
      pendidikan_terakhir: z
        .union([z.enum(['sma', 'smk', 'd3', 's1', 's2', 's3']), z.string().trim().min(1)])
        .optional(),
      education_level: z.string().trim().optional(),
      skill_yang_dikuasai: optionalText,
      skills: z
        .union([z.string().trim(), z.array(z.string().trim().min(1)), z.array(skillObject)])
        .optional(),
      minat_bakat: optionalText,
      interests: stringArrayOrText,
      pengalaman_sertifikasi: optionalText,
      experience_text: optionalText,
      experience_years: optionalProfileNumber,
      pengalaman_tahun: optionalProfileNumber,
      certifications: stringArrayOrText,
      sertifikasi: stringArrayOrText,
      experiences: z.array(experienceSchema).optional(),
      target_role: z.enum(['', 'fe', 'be', 'ds', 'ae']).optional(),
      preferred_location: optionalText,
      top_k: z.coerce.number().int().min(1).max(20).optional().default(5),
      use_genai: z.boolean().optional().default(false),
    })
    .superRefine((body, ctx) => {
      const hasEducation =
        (typeof body.education_level === 'string' && body.education_level.trim().length > 0) ||
        (typeof body.pendidikan_terakhir === 'string' && body.pendidikan_terakhir.trim().length > 0);
      const hasLegacySkills = typeof body.skill_yang_dikuasai === 'string' && body.skill_yang_dikuasai.trim().length >= 2;
      const hasCanonicalSkills =
        typeof body.skills === 'string'
          ? body.skills.trim().length >= 2
          : Array.isArray(body.skills) && body.skills.length > 0;
      const hasExperienceYears =
        (typeof body.experience_years === 'number' && Number.isFinite(body.experience_years)) ||
        (typeof body.pengalaman_tahun === 'number' && Number.isFinite(body.pengalaman_tahun));
      const hasExperienceText =
        (typeof body.experience_text === 'string' && body.experience_text.trim().length > 0) ||
        (typeof body.pengalaman_sertifikasi === 'string' && body.pengalaman_sertifikasi.trim().length > 0);

      if (!hasEducation) {
        ctx.addIssue({
          code: 'custom',
          path: ['education_level'],
          message: 'Pendidikan wajib diisi',
        });
      }

      if (!hasLegacySkills && !hasCanonicalSkills) {
        ctx.addIssue({
          code: 'custom',
          path: ['skills'],
          message: 'Skills wajib diisi',
        });
      }

      if (!hasExperienceYears) {
        ctx.addIssue({
          code: 'custom',
          path: ['experience_years'],
          message: 'Tahun pengalaman wajib diisi',
        });
      }

      if (!hasExperienceText) {
        ctx.addIssue({
          code: 'custom',
          path: ['experience_text'],
          message: 'Pengalaman relevan wajib diisi',
        });
      }
    }),
});

export const careerMatchHistoryQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    offset: z.coerce.number().int().min(0).optional().default(0),
  }),
});

export const careerMatchHistoryDetailSchema = z.object({
  params: z.object({
    id: z.uuid('ID riwayat analisis tidak valid'),
  }),
});
