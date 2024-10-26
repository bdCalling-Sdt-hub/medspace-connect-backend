import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { SpaceRoutes } from '../app/modules/space/space.route';
import { packageRoutes } from '../app/modules/packages/package.route';
import { ConversationRoutes } from '../app/modules/conversation/conversation.route';
import { NotificationRoutes } from '../app/modules/notifications/notification.route';
import { FaqRoutes } from '../app/modules/faq/faq.route';
import { SubscriberRoutes } from '../app/modules/subscribers/subscriber.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/space',
    route: SpaceRoutes,
  },
  {
    path: '/package',
    route: packageRoutes,
  },
  {
    path: '/conversation',
    route: ConversationRoutes,
  },
  {
    path: '/notification',
    route: NotificationRoutes,
  },
  {
    path: '/faq',
    route: FaqRoutes,
  },
  {
    path: '/subscriber',
    route: SubscriberRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
