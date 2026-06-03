const roleLabels = {
  fe: 'Front-End Developer',
  frontend: 'Front-End Developer',
  'front-end': 'Front-End Developer',
  'front-end developer': 'Front-End Developer',
  'front end': 'Front-End Developer',
  'front end developer': 'Front-End Developer',
  'frontend developer': 'Front-End Developer',
  be: 'Back-End Developer',
  backend: 'Back-End Developer',
  'back-end': 'Back-End Developer',
  'back-end developer': 'Back-End Developer',
  'back end': 'Back-End Developer',
  'back end developer': 'Back-End Developer',
  'backend developer': 'Back-End Developer',
  ds: 'Data Scientist',
  'data scientist': 'Data Scientist',
  'data science': 'Data Scientist',
  'data analyst': 'Data Analyst',
  ae: 'AI Engineer',
  'ai engineer': 'AI Engineer',
  'artificial intelligence engineer': 'AI Engineer',
  'ml engineer': 'Machine Learning Engineer',
  'machine learning engineer': 'Machine Learning Engineer',
};

const roleFamilyLabels = {
  'data-ai': 'Data & AI',
  'software-engineering': 'Software Engineering',
  'qa-security': 'QA & Security',
  'it-support-network': 'IT Support & Network',
  'product-project-business': 'Product, Project & Business',
  'sales-account': 'Sales & Account',
  'design-content': 'Design & Content',
  'admin-operations': 'Admin & Operations',
  'other-it': 'IT Lainnya',
};

const normalizeLabelKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

export const getTargetRoleLabel = (value, fallback = 'Target belum dipilih') => {
  const key = normalizeLabelKey(value);
  if (!key) return fallback;
  return roleLabels[key] || value;
};

export const getRoleFamilyLabel = (value, fallback = 'Belum tersedia') => {
  const key = normalizeLabelKey(value);
  if (!key) return fallback;
  return roleFamilyLabels[key] || value;
};
