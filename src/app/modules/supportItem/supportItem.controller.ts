import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { SupportItemService } from './supportItem.service';
const createSupportItemControllerFunction = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SupportItemService.createSupportItemServiceFunction(
      req.body
    );
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Support item created successfully',
      data: result,
    });
  }
);
const getAllSupportItemControllerFunction = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SupportItemService.getAllSupportItemServiceFunction();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Support items fetched successfully',
      data: result,
    });
  }
);
const getSupportItemByIdControllerFunction = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SupportItemService.getSupportItemByIdServiceFunction(
      req.params.id
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Support item fetched successfully',
      data: result,
    });
  }
);
const updateSupportItemByIdControllerFunction = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await SupportItemService.updateSupportItemByIdServiceFunction(
        req.params.id,
        req.body
      );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Support item updated successfully',
      data: result,
    });
  }
);
const deleteSupportItemByIdControllerFunction = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await SupportItemService.deleteSupportItemByIdServiceFunction(
        req.params.id
      );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Support item deleted successfully',
      data: result,
    });
  }
);
export const SupportItemController = {
  createSupportItemControllerFunction,
  getAllSupportItemControllerFunction,
  getSupportItemByIdControllerFunction,
  updateSupportItemByIdControllerFunction,
  deleteSupportItemByIdControllerFunction,
};
