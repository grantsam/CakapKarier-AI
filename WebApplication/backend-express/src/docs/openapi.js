export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'CakapKarier-AI Backend API',
    version: '1.0.0',
    description:
      'Dokumentasi endpoint Backend Express untuk integrasi frontend CakapKarier-AI. Frontend hanya memanggil backend; AIEngine dipanggil oleh backend melalui konfigurasi AI_CAREER_MATCH_URL.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development backend',
    },
  ],
  tags: [
    { name: 'System', description: 'Endpoint status backend' },
    { name: 'Auth', description: 'Registrasi dan login user' },
    { name: 'User Profile', description: 'Profil user terautentikasi' },
    { name: 'Career Match Analysis', description: 'Integrasi frontend dengan fitur AI career match' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          status: { type: 'string', example: 'fail' },
          message: { type: 'string', example: 'Payload tidak valid' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '4f72e9f4-827d-40c5-9fbb-37c1d6c358c4' },
          nama: { type: 'string', example: 'Budi Santoso' },
          email: { type: 'string', format: 'email', example: 'budi@example.com' },
        },
      },
      AuthRequestSignup: {
        type: 'object',
        required: ['nama', 'email', 'password'],
        properties: {
          nama: { type: 'string', minLength: 3, example: 'Budi Santoso' },
          email: { type: 'string', format: 'email', example: 'budi@example.com' },
          password: { type: 'string', minLength: 8, example: 'password123' },
        },
      },
      AuthRequestLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'budi@example.com' },
          password: { type: 'string', minLength: 8, example: 'password123' },
        },
      },
      AuthForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'budi@example.com' },
        },
      },
      AuthResetPasswordRequest: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
          token: {
            type: 'string',
            minLength: 32,
            description: 'Token mentah dari link email reset password.',
            example: '0b24d2a4b3b8f6bbf3e743ff8f7e9e32cbd4f4f09b2c0dfc5a4f50c72efcf7c8',
          },
          password: { type: 'string', minLength: 8, example: 'passwordBaru123' },
        },
      },
      MessageResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operasi berhasil.' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login successful' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              token: {
                type: 'string',
                description: 'JWT token. Simpan di localStorage lalu kirim sebagai Bearer token untuk endpoint terproteksi.',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
            },
          },
        },
      },
      Profile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          nama: { type: 'string', example: 'Budi Santoso' },
          email: { type: 'string', format: 'email', example: 'budi@example.com' },
          nomor_telepon: { type: 'string', nullable: true, example: '081234567890' },
          bio: { type: 'string', nullable: true, example: 'Mahasiswa Informatika yang tertarik pada AI.' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      UpdateProfileRequest: {
        type: 'object',
        required: ['nama', 'email'],
        properties: {
          nama: { type: 'string', minLength: 3, example: 'Budi Santoso' },
          email: { type: 'string', format: 'email', example: 'budi@example.com' },
          nomor_telepon: { type: 'string', nullable: true, example: '081234567890' },
          bio: { type: 'string', nullable: true, example: 'Mahasiswa Informatika yang tertarik pada AI.' },
        },
      },
      CareerMatchRequest: {
        type: 'object',
        required: ['education_level', 'skills', 'experience_years', 'experience_text'],
        properties: {
          education_level: {
            oneOf: [
              { type: 'string', enum: ['none', 'sma', 'smk', 'd3', 's1', 's1_non_it', 's2', 's3'] },
              { type: 'string', minLength: 1 },
            ],
            example: 's1',
            description: 'Canonical key untuk pendidikan user pada kontrak frontend-backend.',
          },
          skills: {
            oneOf: [
              { type: 'string', example: 'PHP, SQL, Golang' },
              { type: 'array', items: { type: 'string' }, example: ['PHP', 'SQL', 'Golang'] },
              {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', minLength: 1, example: 'PHP' },
                    level: { type: 'string', enum: ['Basic', 'Intermediate', 'Advanced'], example: 'Intermediate' },
                  },
                },
              },
            ],
            description: 'Canonical key untuk skill eksplisit user.',
          },
          interests: {
            oneOf: [
              { type: 'string', example: 'Backend Developer, API Development' },
              { type: 'array', items: { type: 'string' }, example: ['Backend Developer', 'API Development'] },
            ],
            description: 'Canonical key untuk minat atau preferensi bidang.',
          },
          experience_text: {
            type: 'string',
            nullable: true,
            description: 'Canonical field untuk Pengalaman Relevan berupa job/project/organization experience.',
            example: '1 tahun sebagai PHP Developer membangun modul backend dan query SQL.',
          },
          experience_years: {
            type: 'number',
            minimum: 0,
            maximum: 60,
            example: 1,
            description: 'Canonical field untuk jumlah tahun pengalaman yang diisi eksplisit oleh user.',
          },
          certifications: {
            oneOf: [
              { type: 'string', example: 'AWS Practitioner, Golang Developer' },
              { type: 'array', items: { type: 'string' }, example: ['AWS Practitioner', 'Golang Developer'] },
            ],
            description: 'Daftar sertifikasi eksplisit user.',
          },
          experiences: {
            type: 'array',
            description: 'Opsional untuk structured experience v2. Frontend saat ini belum wajib mengirim field ini.',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'work' },
                role: { type: 'string', example: 'PHP Developer' },
                organization: { type: 'string', example: 'PT Contoh' },
                duration_months: { type: 'number', example: 12 },
                duration_years: { type: 'number', example: 1 },
                description: { type: 'string', example: 'Membangun modul backend dan query SQL.' },
                skills_used: {
                  oneOf: [
                    { type: 'string', example: 'PHP, SQL' },
                    { type: 'array', items: { type: 'string' }, example: ['PHP', 'SQL'] },
                  ],
                },
              },
            },
          },
          target_role: {
            type: 'string',
            enum: [
              '',
              'fe',
              'be',
              'ds',
              'ae',
              'front end developer',
              'back end developer',
              'data scientist',
              'data analyst',
              'ai engineer',
              'machine learning engineer',
            ],
            example: 'ai engineer',
          },
          preferred_location: {
            type: 'string',
            nullable: true,
            example: 'Jakarta',
          },
          top_k: {
            type: 'integer',
            minimum: 1,
            maximum: 20,
            default: 5,
            example: 5,
          },
          use_genai: {
            type: 'boolean',
            default: false,
            example: false,
          },
        },
      },
      SkillGapItem: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Docker' },
          skill: { type: 'string', example: 'Docker' },
          priority: { type: 'string', example: 'Tinggi' },
          description: { type: 'string', example: 'Skill ini relevan untuk Backend Developer dan belum kuat terdeteksi dari profil kandidat.' },
          reason: { type: 'string', example: 'Dibutuhkan untuk role Backend Developer.' },
        },
        additionalProperties: true,
      },
      RoadmapPhase: {
        type: 'object',
        properties: {
          phase: { type: 'string', example: 'Fase 1: Fundamental' },
          duration: { type: 'string', example: '1-2 bulan' },
          items: {
            type: 'array',
            items: { type: 'string' },
            example: ['Pelajari dasar TensorFlow', 'Bangun project klasifikasi sederhana'],
          },
        },
        additionalProperties: true,
      },
      ReadinessFeatures: {
        type: 'object',
        description:
          'Debug/calibration signals dari AIEngine 1.4.1. Field ini opsional dan dipakai untuk audit skor, bukan untuk input ulang ke model.',
        properties: {
          skill_overlap: { type: 'number', example: 0.72 },
          certification_overlap: { type: 'number', example: 0.2 },
          experience_ratio: { type: 'number', example: 1 },
          education_match: { type: 'number', example: 1 },
          skill_count_ratio: { type: 'number', example: 0.8 },
          missing_skill_ratio: { type: 'number', example: 0.28 },
          seniority_gap: { type: 'number', example: 0 },
          semantic_similarity: { type: 'number', example: 0.31 },
          certification_overlap_model_feature: { type: 'number', example: 0.2 },
          certification_required_overlap: { type: 'number', example: 0.5 },
          certification_completeness_boost: { type: 'number', example: 0.2 },
          certification_signal: { type: 'number', example: 0.32 },
        },
        additionalProperties: { type: 'number' },
      },
      TopMatch: {
        type: 'object',
        properties: {
          job_id: { type: 'string', example: 'job-123' },
          job_title: { type: 'string', example: 'Backend Developer' },
          company: { type: 'string', example: 'PT Teknologi Nusantara' },
          location: { type: 'string', example: 'Jakarta' },
          job_detail: { type: 'string', nullable: true, example: 'Membangun dan memelihara REST API.' },
          role_family: { type: 'string', nullable: true, example: 'software-engineering' },
          work_mode: { type: 'string', nullable: true, example: 'hybrid' },
          required_experience_years: { type: 'number', nullable: true, example: 2 },
          required_education: { type: 'string', nullable: true, example: 'Sarjana (S1)' },
          match_score: { type: 'number', example: 0.87 },
          readiness_percentage: { type: 'number', example: 87 },
          model_probability: { type: 'number', nullable: true, example: 0.81 },
          readiness_features: { allOf: [{ $ref: '#/components/schemas/ReadinessFeatures' }], nullable: true },
          matched_skills: {
            type: 'array',
            items: { type: 'string' },
            example: ['python', 'sql', 'rest api'],
          },
          missing_skills: {
            type: 'array',
            items: { type: 'string' },
            example: ['docker', 'kubernetes'],
          },
        },
        additionalProperties: true,
      },
      CareerInputInterpretation: {
        type: 'object',
        properties: {
          pendidikan: { type: 'string', example: 'Sarjana (S1)' },
          education_level: { type: 'string', example: 's1' },
          education_label: { type: 'string', example: 'Sarjana (S1)' },
          original_education_level: { type: 'string', nullable: true, example: 'non_it' },
          original_education_label: { type: 'string', nullable: true, example: 'Lulusan Non-IT / Bootcamp / Otodidak' },
          experience_years: { type: 'number', example: 1 },
          experience_text: { type: 'string', example: '1 tahun sebagai PHP Developer membangun modul backend dan query SQL.' },
          certifications: {
            type: 'array',
            items: { type: 'string' },
            example: ['AWS Practitioner', 'Golang Developer'],
          },
          skills: {
            type: 'array',
            items: { type: 'string' },
            example: ['PHP', 'SQL', 'Golang'],
          },
          skill_levels: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'React' },
                level: { type: 'string', example: 'Advanced' },
              },
            },
            example: [{ name: 'React', level: 'Advanced' }],
          },
          pengalaman_tahun: { type: 'number', example: 1 },
          pengalaman_text: { type: 'string', example: '1 tahun sebagai PHP Developer membangun modul backend dan query SQL.' },
          sertifikasi: {
            type: 'array',
            items: { type: 'string' },
            example: ['AWS Practitioner', 'Golang Developer'],
          },
          explicit_skills: {
            type: 'array',
            items: { type: 'string' },
            example: ['PHP', 'SQL', 'Golang'],
          },
          target_role_original: { type: 'string', nullable: true, example: 'ae' },
          target_role_normalized: { type: 'string', nullable: true, example: 'ai engineer' },
          target_role_label: { type: 'string', nullable: true, example: 'AI Engineer' },
          genai_requested: { type: 'boolean', example: true },
          frontend_contract_version: { type: 'string', example: 'career-match-web-v2' },
          experience_derived_skills: {
            type: 'array',
            items: { type: 'string' },
            example: ['PHP', 'SQL'],
          },
          certification_derived_skills: {
            type: 'array',
            items: { type: 'string' },
            example: ['AWS', 'Golang'],
          },
          skill_evidence: {
            type: 'object',
            additionalProperties: true,
            example: {
              PHP: { sources: ['self_declared', 'experience_text'], confidence: 'high' },
              Golang: { sources: ['self_declared', 'certification'], confidence: 'medium' },
            },
          },
          risk_flags: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'CERTIFICATION_ONLY_SKILL' },
                skill: { type: 'string', example: 'Golang' },
                message: { type: 'string', example: 'Golang belum memiliki bukti pengalaman kerja/proyek dari Pengalaman Relevan.' },
              },
            },
          },
        },
        additionalProperties: true,
      },
      CareerMatchResult: {
        type: 'object',
        properties: {
          analysis_id: { type: 'string', format: 'uuid', example: 'f40fd6e1-b7db-45cc-a0b5-bc0c91ce6407' },
          saved_at: { type: 'string', format: 'date-time' },
          predicted_role: { type: 'string', example: 'AI Engineer' },
          target_role: { type: 'string', nullable: true, example: 'ai engineer' },
          role_family: { type: 'string', nullable: true, example: 'data-ai' },
          readiness_score: { type: 'number', example: 82.4 },
          readiness_status: { type: 'string', example: 'Cukup Siap' },
          match_confidence: { type: 'number', example: 0.824 },
          mastered_skills: {
            type: 'array',
            items: { type: 'string' },
            example: ['Python', 'SQL', 'Machine Learning'],
          },
          mastered_skill_count: { type: 'integer', example: 3 },
          skill_gap: {
            type: 'array',
            items: { type: 'string' },
            example: ['Deep Learning', 'MLOps'],
          },
          skill_gap_count: { type: 'integer', example: 2 },
          skill_gap_analysis: {
            type: 'array',
            items: { $ref: '#/components/schemas/SkillGapItem' },
          },
          roadmap: {
            type: 'array',
            items: { $ref: '#/components/schemas/RoadmapPhase' },
          },
          tips: {
            type: 'array',
            items: { type: 'string' },
            example: ['Fokus pada skill prioritas tinggi terlebih dahulu.'],
          },
          recommendations: {
            type: 'array',
            items: { type: 'string' },
            example: ['Bangun portofolio project yang mendemonstrasikan skill baru.'],
          },
          top_matches: {
            type: 'array',
            items: { $ref: '#/components/schemas/TopMatch' },
          },
          ai_summary: {
            type: 'string',
            nullable: true,
            example: 'Profil paling dekat dengan AI Engineer dengan readiness 82.4%.',
          },
          ai_summary_source: { type: 'string', nullable: true, example: 'provider' },
          genai_provider: { type: 'string', nullable: true, example: 'gemini' },
          genai_model: { type: 'string', nullable: true, example: 'gemini-2.5-flash-lite' },
          genai_available: { type: 'boolean', nullable: true, example: true },
          genai_error_type: { type: 'string', nullable: true, example: null },
          analysis_metadata: {
            type: 'object',
            additionalProperties: true,
            example: {
              frontend_contract_version: 'career-match-web-v2',
              genai_requested: true,
              genai_provider: 'gemini',
              genai_model: 'gemini-2.5-flash-lite',
              genai_available: true,
              ai_summary_source: 'provider',
              target_role_normalized: 'ai engineer',
              target_role_label: 'AI Engineer',
              skill_levels_count: 1,
            },
          },
          input_interpretation: { $ref: '#/components/schemas/CareerInputInterpretation' },
        },
        additionalProperties: true,
      },
      AnalysisHistoryItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          predicted_role: { type: 'string', nullable: true, example: 'AI Engineer' },
          target_role: { type: 'string', nullable: true, example: 'ai engineer' },
          readiness_score: { type: 'number', nullable: true, example: 82.4 },
          readiness_status: { type: 'string', nullable: true, example: 'Siap Berkembang' },
          mastered_skill_count: { type: 'integer', nullable: true, example: 3 },
          skill_gap_count: { type: 'integer', nullable: true, example: 2 },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      AnalysisHistorySummary: {
        type: 'object',
        properties: {
          total_analysis: { type: 'integer', example: 12 },
          latest_score: { type: 'number', nullable: true, example: 82.4 },
          previous_score: { type: 'number', nullable: true, example: 76.2 },
          score_delta: { type: 'number', nullable: true, example: 6.2 },
          latest_mastered_skill_count: { type: 'integer', nullable: true, example: 5 },
          mastered_skill_delta: { type: 'integer', nullable: true, example: 1 },
        },
      },
      AnalysisHistoryPagination: {
        type: 'object',
        properties: {
          limit: { type: 'integer', example: 20 },
          offset: { type: 'integer', example: 0 },
          total: { type: 'integer', example: 42 },
          has_next: { type: 'boolean', example: true },
        },
      },
      AnalysisHistoryDetail: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          created_at: { type: 'string', format: 'date-time' },
          request: {
            type: 'object',
            properties: {
              original: { $ref: '#/components/schemas/CareerMatchRequest' },
              normalized: {
                type: 'object',
                additionalProperties: true,
                description: 'Profil hasil normalisasi backend yang disimpan saat analisis dibuat.',
              },
              ai_payload: {
                type: 'object',
                additionalProperties: true,
                description: 'Payload final yang dikirim backend ke layanan AI.',
              },
            },
          },
          result: {
            type: 'object',
            allOf: [{ $ref: '#/components/schemas/CareerMatchResultPayload' }],
          },
        },
      },
      CareerMatchHealth: {
        type: 'object',
        additionalProperties: true,
        example: {
          status: 'ok',
          model_loaded: true,
          catalog_size: 1280,
        },
      },
      GenAiHealth: {
        type: 'object',
        additionalProperties: true,
        example: {
          provider: 'ollama',
          api_url: 'http://localhost:11434/v1/chat/completions',
          api_key_configured: false,
          model: 'llama3.1',
          timeout_seconds: 8,
          available: false,
          error: 'URLError: <urlopen error [WinError 10061] No connection could be made because the target machine actively refused it>',
        },
      },
      CareerMatchResultPayload: {
        type: 'object',
        properties: {
          predicted_role: { type: 'string', example: 'AI Engineer' },
          target_role: { type: 'string', nullable: true, example: 'ai engineer' },
          role_family: { type: 'string', nullable: true, example: 'data-ai' },
          readiness_score: { type: 'number', nullable: true, example: 82.4 },
          readiness_status: { type: 'string', nullable: true, example: 'Cukup Siap' },
          match_confidence: { type: 'number', nullable: true, example: 0.824 },
          mastered_skills: {
            type: 'array',
            items: { type: 'string' },
            example: ['Python', 'SQL', 'Machine Learning'],
          },
          mastered_skill_count: { type: 'integer', nullable: true, example: 3 },
          skill_gap: {
            type: 'array',
            items: { type: 'string' },
            example: ['Deep Learning', 'MLOps'],
          },
          skill_gap_count: { type: 'integer', nullable: true, example: 2 },
          skill_gap_analysis: {
            type: 'array',
            items: { $ref: '#/components/schemas/SkillGapItem' },
          },
          roadmap: {
            type: 'array',
            items: { $ref: '#/components/schemas/RoadmapPhase' },
          },
          tips: {
            type: 'array',
            items: { type: 'string' },
            example: ['Fokus pada skill prioritas tinggi terlebih dahulu.'],
          },
          recommendations: {
            type: 'array',
            items: { type: 'string' },
            example: ['Bangun portofolio project yang mendemonstrasikan skill baru.'],
          },
          top_matches: {
            type: 'array',
            items: { $ref: '#/components/schemas/TopMatch' },
          },
          ai_summary: {
            type: 'string',
            nullable: true,
            example: 'Profil paling dekat dengan AI Engineer dengan readiness 82.4%.',
          },
          ai_summary_source: { type: 'string', nullable: true, example: 'provider' },
          genai_provider: { type: 'string', nullable: true, example: 'gemini' },
          genai_model: { type: 'string', nullable: true, example: 'gemini-2.5-flash-lite' },
          genai_available: { type: 'boolean', nullable: true, example: true },
          genai_error_type: { type: 'string', nullable: true, example: null },
          input_interpretation: { $ref: '#/components/schemas/CareerInputInterpretation' },
        },
        additionalProperties: true,
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['System'],
        summary: 'Cek status dasar backend',
        responses: {
          200: {
            description: 'Backend berjalan',
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Cek status backend dan koneksi database',
        responses: {
          200: {
            description: 'Backend dan database aktif',
          },
          500: {
            description: 'Koneksi database gagal',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Registrasi user baru',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRequestSignup' },
            },
          },
        },
        responses: {
          201: {
            description: 'User berhasil dibuat dan token dikembalikan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Payload registrasi tidak valid',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          409: {
            description: 'Email sudah terdaftar',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRequestLogin' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login berhasil dan token dikembalikan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: {
            description: 'Email atau password salah',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Minta link pemulihan kata sandi',
        description:
          'Mengirim link reset password ke email user jika email terdaftar. Response sukses dibuat generik agar tidak membocorkan status pendaftaran email.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthForgotPasswordRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Permintaan reset password diterima',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                example: {
                  success: true,
                  message: 'Jika email terdaftar, link pemulihan kata sandi telah dikirim.',
                },
              },
            },
          },
          400: {
            description: 'Format email tidak valid',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          502: {
            description: 'Email pemulihan gagal dikirim',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          503: {
            description: 'Konfigurasi SMTP belum lengkap',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset kata sandi dengan token email',
        description: 'Memperbarui password user menggunakan token reset password one-time use dari email.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResetPasswordRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Kata sandi berhasil diperbarui',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                example: {
                  success: true,
                  message: 'Kata sandi berhasil diperbarui.',
                },
              },
            },
          },
          400: {
            description: 'Token tidak valid, expired, atau payload tidak valid',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/api/user/profile': {
      get: {
        tags: ['User Profile'],
        summary: 'Ambil profil user login',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profil user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Profile' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Token tidak ada atau tidak valid',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          404: {
            description: 'Profil user tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
      put: {
        tags: ['User Profile'],
        summary: 'Update profil user login',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Profil berhasil diperbarui',
          },
          400: {
            description: 'Payload profil tidak valid',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          401: {
            description: 'Token tidak ada, tidak valid, expired, atau user token tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          404: {
            description: 'User tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          409: {
            description: 'Email sudah digunakan user lain',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/api/analysis/career-match/health': {
      get: {
        tags: ['Career Match Analysis'],
        summary: 'Cek health AIEngine career match melalui backend',
        description: 'Endpoint ini tetap membutuhkan JWT karena route analysis dilindungi middleware auth.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'AIEngine tersedia',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/CareerMatchHealth' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Token tidak ada, tidak valid, expired, atau user token tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          502: {
            description: 'Response health AI tidak valid atau AIEngine mengalami gangguan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          503: {
            description: 'AIEngine tidak tersedia atau model belum siap',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          504: {
            description: 'Cek health AI melewati batas waktu',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/api/analysis/career-match/genai/health': {
      get: {
        tags: ['Career Match Analysis'],
        summary: 'Cek health GenAI provider melalui backend',
        description:
          'Memanggil endpoint /genai/health di AIEngine untuk memeriksa konfigurasi provider GenAI opsional seperti Gemini atau provider lain yang aktif.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Status provider GenAI berhasil dibaca',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/GenAiHealth' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Token tidak ada, tidak valid, expired, atau user token tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          502: {
            description: 'Response health GenAI tidak valid atau AIEngine mengalami gangguan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          503: {
            description: 'AIEngine atau GenAI health tidak tersedia',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          504: {
            description: 'Cek health GenAI melewati batas waktu',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/api/analysis/career-match': {
      post: {
        tags: ['Career Match Analysis'],
        summary: 'Buat analisis career match',
        description:
          'Frontend mengirim form analisis ke backend. Backend meneruskan payload ke AIEngine, menyimpan hasil ke history, lalu mengembalikan response siap render ke halaman hasil.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CareerMatchRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Analisis berhasil',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/CareerMatchResult' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Payload analisis tidak valid',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          401: {
            description: 'User belum login, token tidak valid, expired, atau user token tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          503: {
            description: 'Layanan AI tidak tersedia',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          502: {
            description: 'Response layanan AI tidak valid atau layanan AI mengalami gangguan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          504: {
            description: 'Request AI timeout',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/api/analysis/career-match/history': {
      get: {
        tags: ['Career Match Analysis'],
        summary: 'Ambil riwayat analisis user login',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            example: 20,
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', minimum: 0, default: 0 },
            example: 0,
          },
        ],
        responses: {
          200: {
            description: 'Daftar riwayat analisis',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer', example: 2 },
                    summary: { $ref: '#/components/schemas/AnalysisHistorySummary' },
                    pagination: { $ref: '#/components/schemas/AnalysisHistoryPagination' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AnalysisHistoryItem' },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Query limit atau offset tidak valid',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          401: {
            description: 'Token tidak ada, tidak valid, expired, atau user token tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/api/analysis/career-match/history/{id}': {
      get: {
        tags: ['Career Match Analysis'],
        summary: 'Ambil detail riwayat analisis',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Detail riwayat analisis',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/AnalysisHistoryDetail' },
                  },
                },
              },
            },
          },
          400: {
            description: 'ID riwayat analisis tidak valid',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          401: {
            description: 'Token tidak ada, tidak valid, expired, atau user token tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          404: {
            description: 'Riwayat tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
  },
};

export const swaggerUiHtml = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CakapKarier-AI API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #f8fafc; }
      .swagger-ui .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api-docs.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        persistAuthorization: true,
      });
    </script>
  </body>
</html>`;
