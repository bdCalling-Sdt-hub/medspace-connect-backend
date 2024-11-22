import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { SpaceRoutes } from '../app/modules/space/space.route';
import { packageRoutes } from '../app/modules/packages/package.route';
import { ConversationRoutes } from '../app/modules/conversation/conversation.route';
import { NotificationRoutes } from '../app/modules/notifications/notification.route';
import { FaqRoutes } from '../app/modules/faq/faq.route';
import { SubscriberRoutes } from '../app/modules/subscribers/subscriber.route';
import { AboutRoute } from '../app/modules/about/about.route';
import { InfoRoute } from '../app/modules/info/info.route';
import { SupportItemRoute } from '../app/modules/supportItem/supportItem.route';
import { FavouriteRoute } from '../app/modules/favourite/favourite.route';
import { adminRoutes } from '../app/modules/user/admin/admin.route';
import { LinksRoutes } from '../app/modules/links/links.route';
import { PracticeTypeRoutes } from '../app/modules/practiceType/practiceType.route';
import { PracticeNeedRoutes } from '../app/modules/practiceNeed/practiceNeed.route';
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

  {
    path: '/about',
    route: AboutRoute,
  },
  {
    path: '/support-item',
    route: SupportItemRoute,
  },
  {
    path: '/favourite',
    route: FavouriteRoute,
  },
  {
    path: '/info',
    route: InfoRoute,
  },
  {
    path: '/admin',
    route: adminRoutes,
  },
  {
    path: '/practicetype',
    route: PracticeTypeRoutes,
  },
  {
    path: '/practiceneed',
    route: PracticeNeedRoutes,
  },
  {
    path: '/link',
    route: LinksRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
