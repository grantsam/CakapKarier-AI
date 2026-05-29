import { config } from '../config/index.js';
import AppError from '../utils/AppError.js';

const normalizeBaseUrl = (url) => url.replace(/\/+$/, '');

const getAiTimeoutMs = () => {
  const timeout = Number(config.ai.requestTimeoutMs);
  return Number.isFinite(timeout) && timeout > 0 ? timeout : 30000;
};

const parseJsonSafely = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const formatAiErrorMessage = (payload, fallback) => {
  if (!payload) return fallback;
  if (typeof payload.detail === 'string') return payload.detail;
  if (Array.isArray(payload.detail)) {
    return payload.detail
      .map((item) => {
        const path = Array.isArray(item.loc) ? item.loc.join('.') : 'payload';
        return `${path}: ${item.msg}`;
      })
      .join(', ');
  }
  if (typeof payload.message === 'string') return payload.message;
  return fallback;
};

const mapAiStatusToAppError = (statusCode, payload) => {
  if (statusCode === 422 || statusCode === 400) {
    return new AppError(formatAiErrorMessage(payload, 'Payload analisis tidak valid'), 400);
  }

  if (statusCode === 503) {
    return new AppError('Model AI belum siap digunakan', 503);
  }

  if (statusCode >= 500) {
    return new AppError('Layanan analisis AI mengalami gangguan', 502);
  }

  return new AppError(formatAiErrorMessage(payload, 'Request ke layanan analisis AI gagal'), statusCode);
};

export const getCareerMatchHealth = async () => {
  const baseUrl = normalizeBaseUrl(config.ai.careerMatchUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getAiTimeoutMs());

  try {
    const response = await fetch(`${baseUrl}/health`, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    const text = await response.text();
    const payload = parseJsonSafely(text);

    if (!response.ok) {
      throw mapAiStatusToAppError(response.status, payload);
    }

    if (!payload) {
      throw new AppError('Response health AI tidak valid', 502);
    }

    return payload;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AppError('Cek health AI melewati batas waktu', 504);
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Layanan analisis AI sedang tidak tersedia', 503);
  } finally {
    clearTimeout(timeout);
  }
};

export const getCareerMatchGenaiHealth = async () => {
  const baseUrl = normalizeBaseUrl(config.ai.careerMatchUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getAiTimeoutMs());

  try {
    const response = await fetch(`${baseUrl}/genai/health`, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    const text = await response.text();
    const payload = parseJsonSafely(text);

    if (!response.ok) {
      throw mapAiStatusToAppError(response.status, payload);
    }

    if (!payload) {
      throw new AppError('Response health GenAI tidak valid', 502);
    }

    return payload;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AppError('Cek health GenAI melewati batas waktu', 504);
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Layanan GenAI sedang tidak tersedia', 503);
  } finally {
    clearTimeout(timeout);
  }
};

export const predictCareerMatch = async (analysisPayload) => {
  const baseUrl = normalizeBaseUrl(config.ai.careerMatchUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getAiTimeoutMs());

  try {
    const response = await fetch(`${baseUrl}/predict/web`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ...analysisPayload,
        use_genai: analysisPayload.use_genai ?? false,
      }),
      signal: controller.signal,
    });

    const text = await response.text();
    const payload = parseJsonSafely(text);

    if (!response.ok) {
      throw mapAiStatusToAppError(response.status, payload);
    }

    if (!payload) {
      throw new AppError('Response layanan analisis AI tidak valid', 502);
    }

    return payload;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AppError('Analisis AI melewati batas waktu', 504);
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Layanan analisis AI sedang tidak tersedia', 503);
  } finally {
    clearTimeout(timeout);
  }
};
