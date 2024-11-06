import { StatusCodes } from 'http-status-codes';
import { ADMIN_TYPES, USER_ROLES } from '../../../../enums/user';
import { User } from '../user.model';
import ApiError from '../../../../errors/ApiError';

const addAdminToDB = async (data: any, adminID: string) => {
  const isExist = await User.findOne({ email: data.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }
  const isExistAdmin = await User.findOne({ _id: adminID });
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin does not exist!');
  }
  if (isExistAdmin.adminType !== ADMIN_TYPES.SUPERADMIN) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Only super admin can add admin!'
    );
  }
  const result = await User.create({
    ...data,
    role: USER_ROLES.ADMIN,
    adminType: ADMIN_TYPES.ADMIN,
    verified: true,
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create admin!');
  }
  return result;
};
const deleteAdminFromDB = async (id: string, adminID: any) => {
  const isExistAdmin = await User.findOne({ _id: adminID });
  if (!isExistAdmin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin does not exist!');
  }
  if (isExistAdmin.adminType !== ADMIN_TYPES.SUPERADMIN) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Only super admin can add admin!'
    );
  }
  const result = await User.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete admin!');
  }
  return result;
};

export const AdminService = { addAdminToDB, deleteAdminFromDB };
