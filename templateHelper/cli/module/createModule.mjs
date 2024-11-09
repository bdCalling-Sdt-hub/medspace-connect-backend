import { program } from 'commander';
import fs from 'fs';

// Function to generate file content based on file type
const generateFileContent = (fileType, name, capitalizedModuleName, exportName, fields) => {
  switch (fileType) {
    case 'route':
      return `
import express from 'express';
import { ${capitalizedModuleName}Controller } from './${name}.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ${capitalizedModuleName}Validation } from './${name}.validation';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLES.ADMIN),
  validateRequest(${capitalizedModuleName}Validation.create${capitalizedModuleName}ZodSchema),
  ${capitalizedModuleName}Controller.create${capitalizedModuleName}
);
router.get('/', ${capitalizedModuleName}Controller.getAll${capitalizedModuleName}s);
router.get('/:id', ${capitalizedModuleName}Controller.get${capitalizedModuleName}ById);
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN),
  validateRequest(${capitalizedModuleName}Validation.update${capitalizedModuleName}ZodSchema),
  ${capitalizedModuleName}Controller.update${capitalizedModuleName}
);
router.delete('/:id', auth(USER_ROLES.ADMIN), ${capitalizedModuleName}Controller.delete${capitalizedModuleName});

export const ${capitalizedModuleName}Routes = router;
      `;
    case 'model':
      return `
import { Schema, model } from 'mongoose';
import { I${capitalizedModuleName}, ${capitalizedModuleName}Model } from './${name}.interface';

const ${name}Schema = new Schema<I${capitalizedModuleName}, ${capitalizedModuleName}Model>({
  ${fields.map(field => 
    field.type.includes('array') 
      ? `${field.name}: {type: [${field.type.split('=>')[1].replace(field.type.split('=>')[1][0], field.type.split('=>')[1][0].toUpperCase())}], required: true }` 
      : `${field.name}: ${
          field.type.includes("ref")
            ? `{ type: Schema.Types.ObjectId, ref: '${field.type.split('=>')[1]}', required: true }`
            : `{ type: ${field.type.replace(field.type[0], field.type[0].toUpperCase())}, required: true }`
        }`
  ).join(',\n  ')}
}, { timestamps: true });

export const ${capitalizedModuleName} = model<I${capitalizedModuleName}, ${capitalizedModuleName}Model>('${capitalizedModuleName}', ${name}Schema);
      `;
    case 'interface':
      return `
import { Model, Types } from 'mongoose';

export type I${capitalizedModuleName} = {
  ${fields.map(field => `${field.name}: ${field.type.includes('ref') ? 'Types.ObjectId' : `${field.type==='date'?'Date':field.type.includes('array')?`Array<${field.type.split('=>')[1].includes('ref') ? 'Types.ObjectId' : field.type.split('=>')[1]}>`:field.type}`};`).join('\n  ')}
};

export type ${capitalizedModuleName}Model = Model<I${capitalizedModuleName}>;
      `;
    case 'service':
      return `
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ${capitalizedModuleName} } from './${name}.model';
import { I${capitalizedModuleName} } from './${name}.interface';

const create${capitalizedModuleName} = async (payload: I${capitalizedModuleName}): Promise<I${capitalizedModuleName}> => {
  const result = await ${capitalizedModuleName}.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create ${name}!');
  }
  return result;
};

const getAll${capitalizedModuleName}s = async (search: string): Promise<I${capitalizedModuleName}[]> => {
 let result: any;
  if (search !== '') {
    result = await ${capitalizedModuleName}.find({
      $or: [
        ${fields.map(field => 
          field.type.includes('ref') || field.type.includes('date') || field.type.includes('number') || field.type.includes('boolean')
            ? null 
            : `{ ${field.name}: { $regex: search, $options: 'i' } }`
        ).filter(Boolean).join(',\n        ')}
      ],
    });
    return result;
  } else {
    result = await ${capitalizedModuleName}.find();
  }
  return result;
};

const get${capitalizedModuleName}ById = async (id: string): Promise<I${capitalizedModuleName} | null> => {
  const result = await ${capitalizedModuleName}.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, '${capitalizedModuleName} not found!');
  }
  return result;
};

const update${capitalizedModuleName} = async (id: string, payload: I${capitalizedModuleName}): Promise<I${capitalizedModuleName} | null> => {
  const result = await ${capitalizedModuleName}.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update ${name}!');
  }
  return result;
};

const delete${capitalizedModuleName} = async (id: string): Promise<I${capitalizedModuleName} | null> => {
  const result = await ${capitalizedModuleName}.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete ${name}!');
  }
  return result;
};

export const ${capitalizedModuleName}Service = {
  create${capitalizedModuleName},
  getAll${capitalizedModuleName}s,
  get${capitalizedModuleName}ById,
  update${capitalizedModuleName},
  delete${capitalizedModuleName},
};
      `;
      case 'validation':
        return ` import { z } from 'zod';
      
        const create${capitalizedModuleName}ZodSchema = z.object({
          body: z.object({
            ${fields.map(field => {
              if (field.type.includes('array')) {
                return `${field.name}: z.array(z.${field.type.split('=>')[1]}({ required_error:"${field.name} is required", invalid_type_error:"${field.name} array item should have type ${field.type.split('=>')[1]}" }))`;
              }
              return `${field.name}: z.${field.type.includes('ref')?"string":field.type}({ required_error:"${field.name==='Date'?'date':field.name} is required", invalid_type_error:"${field.name} should be type ${field.type.includes('ref')?"objectID or string":field.type}" })`;
            }).join(',\n      ')}
          }),
        });
      
        const update${capitalizedModuleName}ZodSchema = z.object({
          body: z.object({
            ${fields.map(field => {
              if (field.type.includes('array')) {
                return `${field.name}: z.array(z.${field.type.split('=>')[1]}({ invalid_type_error:"${field.name} array item should have type ${field.type.split('=>')[1]}" })).optional()`;
              }
              return `${field.name}: z.${field.type.includes('ref')?"string":field.type}({ invalid_type_error:"${field.name} should be type ${field.type}" }).optional()`;
            }).join(',\n      ')}
          }),
        });
      
      export const ${capitalizedModuleName}Validation = {
        create${capitalizedModuleName}ZodSchema,
        update${capitalizedModuleName}ZodSchema
      };`;
    case 'controller':
      return `
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ${capitalizedModuleName}Service } from './${name}.service';

const create${capitalizedModuleName} = catchAsync(async (req: Request, res: Response) => {
  const result = await ${capitalizedModuleName}Service.create${capitalizedModuleName}(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: '${capitalizedModuleName} created successfully',
    data: result,
  });
});

const getAll${capitalizedModuleName}s = catchAsync(async (req: Request, res: Response) => {
  const search: any = req.query.search || '';
  const result = await ${capitalizedModuleName}Service.getAll${capitalizedModuleName}s(search as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: '${capitalizedModuleName}s fetched successfully',
    data: result,
  });
});

const get${capitalizedModuleName}ById = catchAsync(async (req: Request, res: Response) => {
  const result = await ${capitalizedModuleName}Service.get${capitalizedModuleName}ById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: '${capitalizedModuleName} fetched successfully',
    data: result,
  });
});

const update${capitalizedModuleName} = catchAsync(async (req: Request, res: Response) => {
  const result = await ${capitalizedModuleName}Service.update${capitalizedModuleName}(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: '${capitalizedModuleName} updated successfully',
    data: result,
  });
});

const delete${capitalizedModuleName} = catchAsync(async (req: Request, res: Response) => {
  const result = await ${capitalizedModuleName}Service.delete${capitalizedModuleName}(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: '${capitalizedModuleName} deleted successfully',
    data: result,
  });
});

export const ${capitalizedModuleName}Controller = {
  create${capitalizedModuleName},
  getAll${capitalizedModuleName}s,
  get${capitalizedModuleName}ById,
  update${capitalizedModuleName},
  delete${capitalizedModuleName},
};
      `;
    default:
      return `
// Define your ${fileType} logic here
export const ${exportName} = {};
      `;
  }
};

program
  .command('create <name> <fields...>')
  .description('Create a new module with specified fields')
  .action((name, fields) => {
    const parsedFields = fields.map(field => {
      const [name, type] = field.split(':');
      return { name, type};
    });

    fs.mkdirSync(`src/app/modules/${name}`, { recursive: true });

    const files = [
      'route.ts',
      'controller.ts',
      'service.ts',
      'validation.ts',
      'interface.ts',
      'model.ts',
    ].map(type => `src/app/modules/${name}/${name}.${type}`);

    files.forEach(file => {
      const fileType = file.split('.')[1];
      const capitalizedModuleName = name[0].toUpperCase() + name.slice(1);
      const exportName = `${capitalizedModuleName}${fileType[0].toUpperCase() + fileType.slice(1)}`;

      // Generate content using the new function
      const fileContent = generateFileContent(fileType, name, capitalizedModuleName, exportName, parsedFields).trim();

      // Write content to file
      fs.writeFileSync(file, fileContent);
    });

    console.log(`Module ${name} created with files:`);
    files.forEach(file => console.log(`- ${file}`));
  });
 
program.parse(process.argv);