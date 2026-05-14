import { z } from 'zod';

const optionalText = z.string().trim().optional().nullable();

export const careerMatchAnalysisSchema = z.object({
  body: z.object({
    pendidikan_terakhir: z
      .union([z.enum(['sma', 'smk', 'd3', 's1', 's2', 's3']), z.string().trim().min(1)])
      .default('s1'),
    skill_yang_dikuasai: z.string().trim().min(2, 'Skill yang dikuasai wajib diisi'),
    minat_bakat: optionalText,
    pengalaman_sertifikasi: optionalText,
    target_role: z.enum(['', 'fe', 'be', 'ds', 'ae']).optional().default(''),
    preferred_location: optionalText,
    top_k: z.coerce.number().int().min(1).max(20).optional().default(5),
    use_genai: z.boolean().optional().default(false),
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
