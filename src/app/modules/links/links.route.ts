import express from 'express';
import { LinksController } from './links.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { LinksValidation } from './links.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.post(
  '/add',
  auth(USER_ROLES.ADMIN),
  fileUploadHandler(),
  LinksController.createLinks
);
router.get('/', LinksController.getAllLinkss);
router.get('/:id', LinksController.getLinksById);
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),
  fileUploadHandler(),
  LinksController.updateLinks
);
router.delete('/:id', auth(USER_ROLES.ADMIN), LinksController.deleteLinks);

export const LinksRoutes = router;
