import colors from 'colors';
import { User } from '../app/modules/user/user.model';
import config from '../config';
import { ADMIN_TYPES, USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';
import { IUser } from '../app/modules/user/user.interface';

const superUser:any = {
    name: 'Super Admin',
    role: USER_ROLES.ADMIN,
    adminType: ADMIN_TYPES.SUPERADMIN,
    email: config.admin.email,
    password: config.admin.password,
    verified: true,
};

const seedSuperAdmin = async () => {
    const isExistSuperAdmin = await User.findOne({
        role: USER_ROLES.ADMIN,
        adminType: ADMIN_TYPES.SUPERADMIN,
    });

    if (!isExistSuperAdmin) {
        await User.create(superUser);
        logger.info(colors.green('✔ Super admin created successfully!'));
    }
};

export default seedSuperAdmin;