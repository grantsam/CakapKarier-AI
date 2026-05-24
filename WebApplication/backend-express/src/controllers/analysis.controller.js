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
    const enrichedResult = {
      ...result,
      input_interpretation: evidenceProfile.inputInterpretation,
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
