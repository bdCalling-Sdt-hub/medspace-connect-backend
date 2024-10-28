import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AboutValidation } from './about.validation';
import { AboutController } from './about.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();
router.post(
  '/create',
  auth(USER_ROLES.ADMIN),
  fileUploadHandler(),
  AboutController.createAbout
);
export const AboutRoute = router;
