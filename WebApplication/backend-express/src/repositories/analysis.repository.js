import db from '../database/db.js';

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const toIntegerOrNull = (value) => {
  const numberValue = toNumberOrNull(value);
  return numberValue === null ? null : Math.trunc(numberValue);
};

const countArrayOrNull = (value) => (Array.isArray(value) ? value.length : null);

const roundToTwoDecimals = (value) => Math.round(value * 100) / 100;

const mapHistoryItem = (row) => ({
  id: row.id,
  predicted_role: row.predicted_role,
  target_role: row.target_role,
  readiness_score: toNumberOrNull(row.readiness_score),
  readiness_status: row.readiness_status,
  mastered_skill_count: toIntegerOrNull(row.mastered_skill_count),
  skill_gap_count: toIntegerOrNull(row.skill_gap_count),
  created_at: row.created_at,
});

const buildHistorySummary = (totalAnalysis, latest, previous) => {
  const latestScore = toNumberOrNull(latest?.readiness_score);
  const previousScore = toNumberOrNull(previous?.readiness_score);
  const latestMasteredSkillCount = latest ? toIntegerOrNull(latest.mastered_skill_count) : null;
  const previousMasteredSkillCount = previous ? toIntegerOrNull(previous.mastered_skill_count) : null;

  return {
    total_analysis: totalAnalysis,
    latest_score: latestScore,
    previous_score: previousScore,
    score_delta:
      latestScore !== null && previousScore !== null
        ? roundToTwoDecimals(latestScore - previousScore)
        : null,
    latest_mastered_skill_count: latestMasteredSkillCount,
    mastered_skill_delta:
      latestMasteredSkillCount !== null &&
      previousMasteredSkillCount !== null
        ? latestMasteredSkillCount - previousMasteredSkillCount
        : null,
  };
};

const mapHistoryDetail = (row) => {
  if (!row) return null;
  const responsePayload = row.response_payload || {};

  return {
    id: row.id,
    created_at: row.created_at,
    request: row.request_payload,
    result: {
      ...responsePayload,
      predicted_role: responsePayload.predicted_role ?? row.predicted_role,
      target_role: responsePayload.target_role ?? row.target_role,
      readiness_score: responsePayload.readiness_score ?? toNumberOrNull(row.readiness_score),
      readiness_status: responsePayload.readiness_status ?? row.readiness_status,
      mastered_skill_count:
        responsePayload.mastered_skill_count ?? toIntegerOrNull(row.mastered_skill_count),
      skill_gap_count: responsePayload.skill_gap_count ?? toIntegerOrNull(row.skill_gap_count),
    },
  };
};

export const createCareerAnalysisResult = async ({ userId, requestPayload, responsePayload }) => {
  const query = `
    INSERT INTO career_analysis_results (
      user_id,
      request_payload,
      response_payload,
      predicted_role,
      target_role,
      readiness_score,
      readiness_status,
      mastered_skill_count,
      skill_gap_count
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING
      id,
      user_id,
      predicted_role,
      target_role,
      readiness_score,
      readiness_status,
      mastered_skill_count,
      skill_gap_count,
      created_at;
  `;

  const values = [
    userId,
    requestPayload,
    responsePayload,
    responsePayload.predicted_role || null,
    responsePayload.target_role || null,
    responsePayload.readiness_score ?? null,
    responsePayload.readiness_status || null,
    responsePayload.mastered_skill_count ?? countArrayOrNull(responsePayload.mastered_skills),
    responsePayload.skill_gap_count ?? countArrayOrNull(responsePayload.skill_gap_analysis) ?? countArrayOrNull(responsePayload.skill_gap),
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

export const getCareerAnalysisHistoryByUserId = async (userId, { limit = 20, offset = 0 } = {}) => {
  const historyQuery = `
    SELECT
      id,
      predicted_role,
      target_role,
      readiness_score,
      readiness_status,
      mastered_skill_count,
      skill_gap_count,
      created_at
    FROM career_analysis_results
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM career_analysis_results
    WHERE user_id = $1;
  `;

  const summaryQuery = `
    SELECT
      readiness_score,
      mastered_skill_count
    FROM career_analysis_results
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 2;
  `;

  const [historyResult, countResult, summaryResult] = await Promise.all([
    db.query(historyQuery, [userId, limit, offset]),
    db.query(countQuery, [userId]),
    db.query(summaryQuery, [userId]),
  ]);

  const total = Number(countResult.rows[0]?.total || 0);

  return {
    data: historyResult.rows.map(mapHistoryItem),
    summary: buildHistorySummary(total, summaryResult.rows[0], summaryResult.rows[1]),
    pagination: {
      limit,
      offset,
      total,
      has_next: offset + historyResult.rows.length < total,
    },
  };
};

export const getCareerAnalysisResultById = async (userId, analysisId) => {
  const query = `
    SELECT
      id,
      user_id,
      request_payload,
      response_payload,
      predicted_role,
      target_role,
      readiness_score,
      readiness_status,
      mastered_skill_count,
      skill_gap_count,
      created_at
    FROM career_analysis_results
    WHERE user_id = $1 AND id = $2;
  `;

  const result = await db.query(query, [userId, analysisId]);
  return mapHistoryDetail(result.rows[0]);
};
