import cors from 'cors';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { Morgan } from './shared/morgen';
import handleStripeWebhook from './webhook/handleStripeWebhook';
import { SubscriptionControllers } from './app/modules/subscription/subscription.controller';
import { USER_ROLES } from './enums/user';
import auth from './app/middlewares/auth';
const app = express();

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);
app.use(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

//body parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Stripe webhook route
app.use(
  '/api/stripe/subscription/cancel',
  auth(USER_ROLES.SPACEPROVIDER),
  SubscriptionControllers.cancelSubscription
);
//file retrieve
app.use(express.static('uploads'));

//router
app.use('/api/v1', router);

//live response
app.get('/', (req: Request, res: Response) => {
  res.send(
    '<h1 style="text-align:center; color:#A55FEF; font-family:Verdana;">Hey, How can I assist you today!</h1>'
  );
});

//global error handle
app.use(globalErrorHandler);

//handle not found route;
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;
