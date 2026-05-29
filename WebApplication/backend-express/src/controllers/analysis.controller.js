import * as aiService from '../services/ai.service.js';
import * as analysisRepository from '../repositories/analysis.repository.js';
import { buildCareerEvidenceProfile } from '../services/careerEvidence.service.js';
import AppError from '../utils/AppError.js';

export const getCareerMatchHealth = async (req, res, next) => {
  try {
    const health = await aiService.getCareerMatchHealth();
    res.status(200).json({
      status: 'success',
      data: health,
    });
  } catch (error) {
    next(error);
  }
};

export const getCareerMatchGenaiHealth = async (req, res, next) => {
  try {
    const health = await aiService.getCareerMatchGenaiHealth();
    res.status(200).json({
      status: 'success',
      data: health,
    });
  } catch (error) {
    next(error);
  }
};

export const createCareerMatchAnalysis = async (req, res, next) => {
  try {
    const evidenceProfile = buildCareerEvidenceProfile(req.body);
    const result = await aiService.predictCareerMatch(evidenceProfile.aiPayload);
    const interpretation = evidenceProfile.inputInterpretation;
    const enrichedResult = {
      ...result,
      analysis_metadata: {
        frontend_contract_version: interpretation.frontend_contract_version,
        genai_requested: interpretation.genai_requested,
        genai_provider: result.genai_provider || null,
        genai_model: result.genai_model || null,
        genai_available: result.genai_available ?? null,
        ai_summary_source: result.ai_summary_source || null,
        genai_error_type: result.genai_error_type || null,
        target_role_original: interpretation.target_role_original,
        target_role_normalized: interpretation.target_role_normalized,
        target_role_label: interpretation.target_role_label,
        skill_levels_count: interpretation.skill_levels?.length || 0,
      },
      input_interpretation: interpretation,
    };
    const savedAnalysis = await analysisRepository.createCareerAnalysisResult({
      userId: req.user.id,
      requestPayload: {
        original: req.body,
        normalized: evidenceProfile.normalizedProfile,
        ai_payload: evidenceProfile.aiPayload,
      },
      responsePayload: enrichedResult,
    });

    res.status(200).json({
      status: 'success',
      data: {
        analysis_id: savedAnalysis.id,
        saved_at: savedAnalysis.created_at,
        ...enrichedResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCareerMatchHistory = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 20);
    const offset = Number(req.query.offset || 0);
    const historyResult = await analysisRepository.getCareerAnalysisHistoryByUserId(req.user.id, {
      limit,
      offset,
    });

    res.status(200).json({
      status: 'success',
      results: historyResult.data.length,
      summary: historyResult.summary,
      pagination: historyResult.pagination,
      data: historyResult.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCareerMatchHistoryDetail = async (req, res, next) => {
  try {
    const analysis = await analysisRepository.getCareerAnalysisResultById(req.user.id, req.params.id);
    if (!analysis) {
      throw new AppError('Riwayat analisis tidak ditemukan', 404);
    }

    res.status(200).json({
      status: 'success',
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};
