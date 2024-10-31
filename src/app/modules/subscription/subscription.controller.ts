import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SubscriptionService } from './subscription.service';

const getSubscribedUsers = catchAsync(async (req, res) => {
  const result = await SubscriptionService.getSubscribedUsersFromDB(req?.query);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Subscribed users retrived successfully!',
    data: result,
  });
});

export const SubscriptionControllers = {
  getSubscribedUsers,
};
