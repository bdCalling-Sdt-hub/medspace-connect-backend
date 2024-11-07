"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../app/modules/auth/auth.route");
const user_route_1 = require("../app/modules/user/user.route");
const space_route_1 = require("../app/modules/space/space.route");
const package_route_1 = require("../app/modules/packages/package.route");
const conversation_route_1 = require("../app/modules/conversation/conversation.route");
const notification_route_1 = require("../app/modules/notifications/notification.route");
const faq_route_1 = require("../app/modules/faq/faq.route");
const subscriber_route_1 = require("../app/modules/subscribers/subscriber.route");
const about_route_1 = require("../app/modules/about/about.route");
const info_route_1 = require("../app/modules/info/info.route");
const supportItem_route_1 = require("../app/modules/supportItem/supportItem.route");
const favourite_route_1 = require("../app/modules/favourite/favourite.route");
const admin_route_1 = require("../app/modules/user/admin/admin.route");
const links_route_1 = require("../app/modules/links/links.route");
const router = express_1.default.Router();
const apiRoutes = [
    {
        path: '/user',
        route: user_route_1.UserRoutes,
    },
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes,
    },
    {
        path: '/space',
        route: space_route_1.SpaceRoutes,
    },
    {
        path: '/package',
        route: package_route_1.packageRoutes,
    },
    {
        path: '/conversation',
        route: conversation_route_1.ConversationRoutes,
    },
    {
        path: '/notification',
        route: notification_route_1.NotificationRoutes,
    },
    {
        path: '/faq',
        route: faq_route_1.FaqRoutes,
    },
    {
        path: '/subscriber',
        route: subscriber_route_1.SubscriberRoutes,
    },
    {
        path: '/about',
        route: about_route_1.AboutRoute,
    },
    {
        path: '/support-item',
        route: supportItem_route_1.SupportItemRoute,
    },
    {
        path: '/favourite',
        route: favourite_route_1.FavouriteRoute,
    },
    {
        path: '/info',
        route: info_route_1.InfoRoute,
    },
    {
        path: '/admin',
        route: admin_route_1.adminRoutes,
    },
    {
        path: '/link',
        route: links_route_1.LinksRoutes,
    },
];
apiRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
