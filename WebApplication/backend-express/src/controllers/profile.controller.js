import * as profileService from '../services/profile.service.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.id);
    res.status(200).json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    await profileService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Profil berhasil diperbarui'
    });
  } catch (error) {
    next(error);
  }
};
