import AppError from '../utils/AppError.js';

const setRequestValue = (req, key, value) => {
  Object.defineProperty(req, key, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
};

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (Object.prototype.hasOwnProperty.call(parsed, 'body')) setRequestValue(req, 'body', parsed.body);
    if (Object.prototype.hasOwnProperty.call(parsed, 'query')) setRequestValue(req, 'query', parsed.query);
    if (Object.prototype.hasOwnProperty.call(parsed, 'params')) setRequestValue(req, 'params', parsed.params);
    next();
  } catch (error) {
    const issues = error.issues || error.errors || [];
    if (!issues.length) {
      return next(error);
    }

    const message = issues
      .map((err) => {
        const path = err.path?.slice(1).join('.') || err.path?.join('.') || 'request';
        return `${path}: ${err.message}`;
      })
      .join(', ');
    next(new AppError(message, 400));
  }
};
