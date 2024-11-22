import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SubscriptionServices } from './subscription.service';
import { Request, Response } from 'express';

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await SubscriptionServices.cancelSubscription(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription cancelled successfully',
    data: result,
  });
});

export const SubscriptionControllers = {
  cancelSubscription,
};
