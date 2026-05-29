const educationLabels = {
  none: 'Bootcamp / Otodidak',
  sma: 'SMA/SMK',
  smk: 'SMA/SMK',
  d3: 'Diploma (D3)',
  s1: 'Sarjana (S1)',
  s1_non_it: 'Sarjana Non-IT',
  s2: 'Magister (S2)',
  s3: 'Doktor (S3)',
  non_it: 'Lulusan Non-IT / Bootcamp / Otodidak',
};

const educationAliasesForAi = {
  non_it: 'none',
  'non it': 'none',
  bootcamp: 'none',
  otodidak: 'none',
  autodidak: 'none',
  none: 'none',
  s1_non_it: 's1',
  's1 non it': 's1',
};

const targetRoleAliases = {
  fe: 'front end developer',
  frontend: 'front end developer',
  'front-end': 'front end developer',
  'front end': 'front end developer',
  'front end developer': 'front end developer',
  'frontend developer': 'front end developer',
  be: 'back end developer',
  backend: 'back end developer',
  'back-end': 'back end developer',
  'back end': 'back end developer',
  'back end developer': 'back end developer',
  'backend developer': 'back end developer',
  ds: 'data scientist',
  'data scientist': 'data scientist',
  'data science': 'data scientist',
  'data analyst': 'data analyst',
  ae: 'ai engineer',
  'ai engineer': 'ai engineer',
  'artificial intelligence engineer': 'ai engineer',
  'ml engineer': 'machine learning engineer',
  'machine learning engineer': 'machine learning engineer',
};

const targetRoleLabels = {
  'front end developer': 'Front-End Developer',
  'back end developer': 'Back-End Developer',
  'data scientist': 'Data Scientist',
  'data analyst': 'Data Analyst',
  'ai engineer': 'AI Engineer',
  'machine learning engineer': 'Machine Learning Engineer',
};

const skillLevelLabels = {
  basic: 'Basic',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const knownSkillAliases = [
  ['REST API', ['rest api', 'api restful', 'restful api']],
  ['CI/CD', ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment']],
  ['Node.js', ['node.js', 'nodejs', 'node js']],
  ['React', ['react', 'react.js', 'reactjs']],
  ['Next.js', ['next.js', 'nextjs', 'next js']],
  ['Vue', ['vue', 'vue.js', 'vuejs']],
  ['PHP', ['php']],
  ['Laravel', ['laravel']],
  ['Golang', ['golang', 'go developer', 'go language']],
  ['Python', ['python']],
  ['Django', ['django']],
  ['FastAPI', ['fastapi', 'fast api']],
  ['JavaScript', ['javascript', 'java script', 'js']],
  ['TypeScript', ['typescript', 'type script', 'ts']],
  ['SQL', ['sql']],
  ['MySQL', ['mysql']],
  ['PostgreSQL', ['postgresql', 'postgres']],
  ['MongoDB', ['mongodb', 'mongo db']],
  ['Docker', ['docker']],
  ['Kubernetes', ['kubernetes', 'k8s']],
  ['AWS', ['aws', 'amazon web services']],
  ['Azure', ['azure', 'microsoft azure']],
  ['GCP', ['gcp', 'google cloud']],
  ['Cloud', ['cloud']],
  ['Machine Learning', ['machine learning', 'ml']],
  ['Deep Learning', ['deep learning']],
  ['TensorFlow', ['tensorflow', 'tensor flow']],
  ['PyTorch', ['pytorch', 'py torch']],
  ['Computer Vision', ['computer vision']],
  ['NLP', ['nlp', 'natural language processing']],
  ['Data Mining', ['data mining']],
  ['Data Analysis', ['data analysis', 'data analytics']],
  ['Data Visualization', ['data visualization', 'visualisasi data']],
  ['Power BI', ['power bi', 'powerbi']],
  ['Tableau', ['tableau']],
  ['Excel', ['excel', 'microsoft excel']],
  ['Flutter', ['flutter']],
  ['Android', ['android']],
  ['iOS', ['ios']],
  ['Testing', ['testing', 'software testing']],
  ['Automation', ['automation', 'otomasi']],
  ['Git', ['git']],
  ['DevOps', ['devops', 'dev ops']],
  ['Microservices', ['microservices', 'microservice']],
  ['Fullstack', ['fullstack', 'full stack']],
  ['Frontend', ['frontend', 'front end']],
  ['Backend', ['backend', 'back end']],
  ['UI/UX', ['ui/ux', 'ux/ui']],
  ['Figma', ['figma']],
  ['Scrum', ['scrum']],
  ['Agile', ['agile']],
  ['Project Management', ['project management']],
  ['Communication', ['communication', 'komunikasi']],
  ['Leadership', ['leadership', 'kepemimpinan']],
  ['Problem Solving', ['problem solving']],
  ['Collaboration', ['collaboration', 'kolaborasi']],
];

const normalizeWhitespace = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const normalizeForMatch = (value) =>
  normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#./ -]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') return item.name || item.label || item.title || '';
        return '';
      })
      .map(normalizeWhitespace)
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[,;|\n\r\t]+/)
      .map(normalizeWhitespace)
      .filter(Boolean);
  }
  return [];
};

const normalizeEducationForAi = (value) => {
  const normalized = normalizeForMatch(value);
  if (!normalized) return '';
  return educationAliasesForAi[normalized] || normalized;
};

const normalizeTargetRoleForAi = (value) => {
  const normalized = normalizeForMatch(value);
  if (!normalized) return '';
  return targetRoleAliases[normalized] || normalized;
};

const normalizeSkillLevel = (value) => {
  const normalized = normalizeForMatch(value);
  return skillLevelLabels[normalized] || null;
};

const uniqueSkillEntries = (entries) => {
  const result = [];
  const seen = new Set();
  entries.forEach((entry) => {
    const name = normalizeWhitespace(entry?.name);
    const key = name.toLowerCase();
    if (!name || seen.has(key)) return;
    seen.add(key);
    result.push({
      name,
      level: normalizeSkillLevel(entry?.level),
    });
  });
  return result;
};

const normalizeSkillEntries = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return uniqueSkillEntries(
      value.map((item) => {
        if (typeof item === 'string') return { name: item, level: null };
        if (item && typeof item === 'object') {
          return {
            name: item.name || item.label || item.title || '',
            level: item.level || item.proficiency || null,
          };
        }
        return { name: '', level: null };
      }),
    );
  }

  if (typeof value === 'string') {
    return uniqueSkillEntries(normalizeArray(value).map((name) => ({ name, level: null })));
  }

  return [];
};

const uniqueByLower = (values) => {
  const result = [];
  const seen = new Set();
  values.forEach((value) => {
    const label = normalizeWhitespace(value);
    const key = label.toLowerCase();
    if (!label || seen.has(key)) return;
    seen.add(key);
    result.push(label);
  });
  return result;
};

const addEvidence = (skillEvidence, skill, source) => {
  const label = normalizeWhitespace(skill);
  if (!label) return;

  if (!skillEvidence[label]) {
    skillEvidence[label] = {
      sources: [],
      confidence: 'low',
    };
  }

  if (!skillEvidence[label].sources.includes(source)) {
    skillEvidence[label].sources.push(source);
  }

  const sources = skillEvidence[label].sources;
  if (sources.includes('experience_text')) {
    skillEvidence[label].confidence = sources.includes('self_declared') ? 'high' : 'medium';
  } else if (sources.includes('certification')) {
    skillEvidence[label].confidence = sources.includes('self_declared') ? 'medium' : 'medium';
  } else {
    skillEvidence[label].confidence = 'low';
  }
};

const containsAlias = (text, alias) => {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const boundaryStart = alias.match(/^[a-z0-9]/i) ? '(?<![a-z0-9+#])' : '';
  const boundaryEnd = alias.match(/[a-z0-9]$/i) ? '(?![a-z0-9+#])' : '';
  return new RegExp(`${boundaryStart}${escaped}${boundaryEnd}`, 'i').test(text);
};

const extractKnownSkills = (value) => {
  const text = normalizeForMatch(value);
  if (!text) return [];

  const found = [];
  knownSkillAliases.forEach(([label, aliases]) => {
    if (aliases.some((alias) => containsAlias(text, normalizeForMatch(alias)))) {
      found.push(label);
    }
  });
  return uniqueByLower(found);
};

const certificationSkills = (certifications) =>
  uniqueByLower(certifications.flatMap((certification) => extractKnownSkills(certification)));

const parseDurationYearsFromText = (value) => {
  const text = normalizeForMatch(value);
  const matches = [...text.matchAll(/(\d+(?:[.,]\d+)?)\s*(tahun|year|years|yr|yrs|bulan|month|months)/g)];
  if (!matches.length) return null;

  const totalYears = matches.reduce((sum, match) => {
    const number = Number(String(match[1]).replace(',', '.'));
    if (!Number.isFinite(number)) return sum;
    const unit = match[2];
    return sum + (unit === 'bulan' || unit.startsWith('month') ? number / 12 : number);
  }, 0);

  return Math.round(totalYears * 100) / 100;
};

const normalizeExperiences = (experiences) => {
  if (!Array.isArray(experiences)) return [];

  return experiences
    .map((experience) => {
      if (!experience || typeof experience !== 'object') return null;
      const durationMonths = Number(experience.duration_months ?? experience.durationMonths ?? 0);
      const durationYears = Number(experience.duration_years ?? experience.durationYears ?? 0);
      const normalizedDurationMonths =
        Number.isFinite(durationMonths) && durationMonths > 0
          ? durationMonths
          : Number.isFinite(durationYears) && durationYears > 0
            ? durationYears * 12
            : 0;

      return {
        type: normalizeWhitespace(experience.type || 'experience'),
        role: normalizeWhitespace(experience.role),
        organization: normalizeWhitespace(experience.organization),
        duration_months: Math.round(normalizedDurationMonths),
        description: normalizeWhitespace(experience.description),
        skills_used: uniqueByLower(normalizeArray(experience.skills_used || experience.skillsUsed)),
      };
    })
    .filter(Boolean);
};

const computedExperienceYears = (experiences) => {
  const totalMonths = experiences.reduce((sum, experience) => sum + Number(experience.duration_months || 0), 0);
  if (!totalMonths) return null;
  return Math.round((totalMonths / 12) * 100) / 100;
};

const buildAiSkillString = (skills) => uniqueByLower(skills).join(', ');

export const buildCareerEvidenceProfile = (payload) => {
  const originalEducation = payload.education_level || payload.pendidikan_terakhir || '';
  const education = normalizeEducationForAi(originalEducation);
  const explicitSkillEntries = normalizeSkillEntries(payload.skills || payload.skill_yang_dikuasai);
  const explicitSkills = uniqueByLower(explicitSkillEntries.map((skill) => skill.name));
  const skillLevels = explicitSkillEntries
    .filter((skill) => skill.level)
    .map((skill) => ({ name: skill.name, level: skill.level }));
  const interests = uniqueByLower(normalizeArray(payload.interests || payload.minat_bakat));
  const experienceText = normalizeWhitespace(payload.experience_text || payload.pengalaman_sertifikasi || '');
  const experienceYears = Number(payload.experience_years ?? payload.pengalaman_tahun);
  const certifications = uniqueByLower(normalizeArray(payload.certifications || payload.sertifikasi));
  const experiences = normalizeExperiences(payload.experiences);
  const targetRoleOriginal = normalizeWhitespace(payload.target_role);
  const targetRole = normalizeTargetRoleForAi(targetRoleOriginal);
  const preferredLocation = normalizeWhitespace(payload.preferred_location);

  const structuredExperienceSkills = uniqueByLower(experiences.flatMap((experience) => experience.skills_used || []));
  const textExperienceSkills = extractKnownSkills(experienceText);
  const experienceDerivedSkills = uniqueByLower([...structuredExperienceSkills, ...textExperienceSkills]);
  const certificationDerivedSkills = certificationSkills(certifications);
  const allSkills = uniqueByLower([...explicitSkills, ...experienceDerivedSkills, ...certificationDerivedSkills]);

  const skillEvidence = {};
  explicitSkills.forEach((skill) => addEvidence(skillEvidence, skill, 'self_declared'));
  experienceDerivedSkills.forEach((skill) => addEvidence(skillEvidence, skill, 'experience_text'));
  certificationDerivedSkills.forEach((skill) => addEvidence(skillEvidence, skill, 'certification'));

  const riskFlags = [];
  const inferredExperienceYears = parseDurationYearsFromText(experienceText);
  const computedYears = computedExperienceYears(experiences);
  const hasExperienceText = Boolean(experienceText);
  const hasExperienceEvidence = experienceDerivedSkills.length > 0 || structuredExperienceSkills.length > 0;

  if (hasExperienceText && !hasExperienceEvidence) {
    riskFlags.push({
      code: 'NO_RECOGNIZED_SKILL_IN_EXPERIENCE_TEXT',
      message: 'Pengalaman relevan belum menunjukkan skill teknis yang dikenali sistem.',
    });
  }

  Object.entries(skillEvidence).forEach(([skill, evidence]) => {
    if (!evidence.sources.includes('experience_text')) {
      riskFlags.push({
        code: evidence.sources.includes('certification') ? 'CERTIFICATION_ONLY_SKILL' : 'SKILL_WITHOUT_WORK_EVIDENCE',
        skill,
        message: `${skill} belum memiliki bukti pengalaman kerja/proyek dari Pengalaman Relevan.`,
      });
    }
  });

  const bestEvidenceYears = computedYears ?? inferredExperienceYears;
  if (
    Number.isFinite(experienceYears) &&
    experienceYears > 0 &&
    Number.isFinite(bestEvidenceYears) &&
    experienceYears > bestEvidenceYears + 1
  ) {
    riskFlags.push({
      code: 'DECLARED_EXPERIENCE_EXCEEDS_EVIDENCE',
      message: `Tahun pengalaman (${experienceYears}) lebih tinggi dari durasi yang terbaca dari pengalaman (${bestEvidenceYears}).`,
    });
  }

  const normalizedProfile = {
    education_level: education,
    skills: allSkills,
    interests,
    experience_text: experienceText,
    experience_years: Number.isFinite(experienceYears) ? experienceYears : null,
    certifications,
    pendidikan_terakhir: education,
    skill_yang_dikuasai: buildAiSkillString(allSkills),
    minat_bakat: interests.join(', '),
    pengalaman_sertifikasi: experienceText,
    target_role: targetRole || null,
    preferred_location: preferredLocation || null,
    top_k: Number(payload.top_k ?? 5),
    use_genai: Boolean(payload.use_genai ?? false),
  };

  const educationLabel = normalizedProfile.education_level
    ? educationLabels[String(normalizedProfile.education_level).toLowerCase()] || normalizedProfile.education_level
    : null;
  const targetRoleLabel = normalizedProfile.target_role
    ? targetRoleLabels[normalizedProfile.target_role] || normalizedProfile.target_role
    : null;

  return {
    normalizedProfile,
    aiPayload: {
      pendidikan_terakhir: normalizedProfile.pendidikan_terakhir,
      skill_yang_dikuasai: normalizedProfile.skill_yang_dikuasai,
      minat_bakat: normalizedProfile.minat_bakat,
      pengalaman_sertifikasi: normalizedProfile.experience_text,
      experience_years: normalizedProfile.experience_years,
      certifications: normalizedProfile.certifications,
      target_role: normalizedProfile.target_role,
      preferred_location: normalizedProfile.preferred_location,
      top_k: normalizedProfile.top_k,
      use_genai: normalizedProfile.use_genai,
    },
    inputInterpretation: {
      education_level: normalizedProfile.education_level,
      education_label: educationLabel,
      original_education_level: normalizeWhitespace(originalEducation) || null,
      original_education_label:
        educationLabels[String(originalEducation).toLowerCase()] || normalizeWhitespace(originalEducation) || null,
      experience_years: normalizedProfile.experience_years,
      experience_text: normalizedProfile.experience_text,
      certifications: normalizedProfile.certifications,
      skills: explicitSkills,
      skill_levels: skillLevels,
      pendidikan: educationLabel,
      pengalaman_tahun: normalizedProfile.experience_years,
      pengalaman_text: normalizedProfile.experience_text,
      sertifikasi: normalizedProfile.certifications,
      target_role_original: targetRoleOriginal || null,
      target_role_normalized: normalizedProfile.target_role,
      target_role_label: targetRoleLabel,
      preferred_location: normalizedProfile.preferred_location,
      genai_requested: normalizedProfile.use_genai,
      frontend_contract_version: 'career-match-web-v2',
      explicit_skills: explicitSkills,
      experience_derived_skills: experienceDerivedSkills,
      certification_derived_skills: certificationDerivedSkills,
      skill_evidence: skillEvidence,
      risk_flags: riskFlags,
      evidence_summary: {
        declared_experience_years: normalizedProfile.experience_years,
        computed_experience_years: computedYears,
        inferred_experience_years_from_text: inferredExperienceYears,
        total_profile_skills_sent_to_ai: allSkills.length,
      },
      experiences,
    },
  };
};

export const __careerEvidenceTestUtils = {
  extractKnownSkills,
  normalizeArray,
  parseDurationYearsFromText,
};
