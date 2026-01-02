const express = require('express');
const router = express.Router();
const { settingsController } = require('../controllers');
const {
  protect,
  isAdmin,
  validateSettingUpdate,
  validateSetDeadline
} = require('../middleware');

router.get(
  '/',
  protect,
  isAdmin,
  settingsController.getAllSettings
);

router.get(
  '/deadline/global',
  protect,
  settingsController.getGlobalDeadline
);

router.post(
  '/deadline/global',
  protect,
  isAdmin,
  validateSetDeadline,
  settingsController.setGlobalDeadline
);

router.post(
  '/initialize',
  protect,
  isAdmin,
  settingsController.initializeDefaults
);

router.get(
  '/:key',
  protect,
  isAdmin,
  settingsController.getSettingByKey
);

router.put(
  '/:key',
  protect,
  isAdmin,
  validateSettingUpdate,
  settingsController.updateSetting
);

router.delete(
  '/:key',
  protect,
  isAdmin,
  settingsController.deleteSetting
);

module.exports = router;