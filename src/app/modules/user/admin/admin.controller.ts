import catchAsync from '../../../../shared/catchAsync';
import { Request, Response, NextFunction } from 'express';
import sendResponse from '../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { AdminService } from './admin.service';

const addAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const adminID = req.user.id;
    const result = await AdminService.addAdminToDB(userData, adminID as string);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Registration successful please check your email for OTP.',
      data: result,
    });
  }
);
const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const AdminID = req.user.id;
  const result = await AdminService.deleteAdminFromDB(id, AdminID);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin deleted successfully',
    data: result,
  });
});
export const AdminController = { addAdmin, deleteAdmin };
