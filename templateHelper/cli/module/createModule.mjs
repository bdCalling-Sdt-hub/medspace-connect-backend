// Main CLI code
import { program } from 'commander';
import fs from 'fs';

const generateRouteTemplate = (name, capitalizedModuleName) => `
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

// templates/model.template.js
const generateModelTemplate = (name, capitalizedModuleName, fields) => {
  const generateSchemaFields = fields => {
    return fields.map(field => {
      if (field.type.includes('array') && !field.type.includes('ref')) {
        return `${field.name}: {type: [${field.type.split('=>')[1].replace(field.type.split('=>')[1][0], field.type.split('=>')[1][0].toUpperCase())}], required: true }`;
      }
      
      if (field.type.includes("ref")) {
        if (field.type.includes('array=>ref')) {
          return `${field.name}: [{ type: Schema.Types.ObjectId, ref: '${field.type.split('ref=>')[1]}'},]`;
        }
        return `${field.name}: { type: Schema.Types.ObjectId, ref: '${field.type.split('=>')[1]}', required: true }`;
      }
      
      return `${field.name}: { type: ${field.type.replace(field.type[0], field.type[0].toUpperCase())}, required: true }`;
    }).join(',\n  ');
  };

  return `
import { Schema, model } from 'mongoose';
import { I${capitalizedModuleName}, ${capitalizedModuleName}Model } from './${name}.interface';

const ${name}Schema = new Schema<I${capitalizedModuleName}, ${capitalizedModuleName}Model>({
  ${generateSchemaFields(fields)}
}, { timestamps: true });

export const ${capitalizedModuleName} = model<I${capitalizedModuleName}, ${capitalizedModuleName}Model>('${capitalizedModuleName}', ${name}Schema);
`;
};

// templates/interface.template.js
const generateInterfaceTemplate = (name, capitalizedModuleName, fields) => {
  const generateFieldTypes = fields => {
    return fields.map(field => {
      if (field.type.includes('ref')) {
        return `${field.name}: ${field.type.includes('array=>ref=>') ? '[Types.ObjectId]' : 'Types.ObjectId'}`;
      }
      if (field.type === 'date') return `${field.name}: Date`;
      if (field.type.includes('array')) {
        const baseType = field.type.split('=>')[1];
        return `${field.name}: Array<${baseType.includes('ref') ? 'Types.ObjectId' : baseType}>`;
      }
      return `${field.name}: ${field.type}`;
    }).join(';\n  ');
  };

  return `
import { Model, Types } from 'mongoose';

export type I${capitalizedModuleName} = {
  ${generateFieldTypes(fields)}
};

export type ${capitalizedModuleName}Model = Model<I${capitalizedModuleName}>;
`;
};

// templates/service.template.js
const generateServiceTemplate = (name, capitalizedModuleName, fields) => {
  const generateSearchFields = fields => {
    return fields
      .map(field => {
        if (field.type.includes('ref') || 
            field.type.includes('date') || 
            field.type.includes('number') || 
            field.type.includes('boolean')) {
          return null;
        }
        return `{ ${field.name}: { $regex: search, $options: 'i' } }`;
      })
      .filter(Boolean)
      .join(',\n        ');
  };

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
        ${generateSearchFields(fields)}
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
};

// templates/validation.template.js
const generateValidationTemplate = (name, capitalizedModuleName, fields) => {
  const generateCreateValidationFields = fields => {
    return fields.map(field => {
      if (field.type.includes('array=>ref=>')) {
        return `${field.name}: z.array(z.string({ required_error:"${field.name} is required", invalid_type_error:"${field.name} array item should have type string" }))`;
      }
      if (field.type.includes('array')) {
        return `${field.name}: z.array(z.${field.type.split('=>')[1]}({ required_error:"${field.name} is required", invalid_type_error:"${field.name} array item should have type ${field.type.split('=>')[1]}" }))`;
      }
      return `${field.name}: z.${field.type.includes('ref') ? "string" : field.type}({ required_error:"${field.name === 'Date' ? 'date' : field.name} is required", invalid_type_error:"${field.name} should be type ${field.type.includes('ref') ? "objectID or string" : field.type}" })`;
    }).join(',\n      ');
  };

  const generateUpdateValidationFields = fields => {
    return fields.map(field => {
      if (field.type.includes('array=>ref=>')) {
        return `${field.name}: z.array(z.string({ invalid_type_error:"${field.name} array item should have type string" })).optional()`;
      }
      if (field.type.includes('array')) {
        return `${field.name}: z.array(z.${field.type.split('=>')[1]}({ invalid_type_error:"${field.name} array item should have type ${field.type.split('=>')[1]}" })).optional()`;
      }
      return `${field.name}: z.${field.type.includes('ref') ? "string" : field.type}({ invalid_type_error:"${field.name} should be type ${field.type}" }).optional()`;
    }).join(',\n      ');
  };

  return `import { z } from 'zod';
      
const create${capitalizedModuleName}ZodSchema = z.object({
  body: z.object({
    ${generateCreateValidationFields(fields)}
  }),
});

const update${capitalizedModuleName}ZodSchema = z.object({
  body: z.object({
    ${generateUpdateValidationFields(fields)}
  }),
});

export const ${capitalizedModuleName}Validation = {
  create${capitalizedModuleName}ZodSchema,
  update${capitalizedModuleName}ZodSchema
};`;
};

// templates/controller.template.js
const generateControllerTemplate = (name, capitalizedModuleName) => `
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

// File generator configuration
const fileGenerators = {
  'route.ts': generateRouteTemplate,
  'controller.ts': generateControllerTemplate,
  'service.ts': generateServiceTemplate,
  'validation.ts': generateValidationTemplate,
  'interface.ts': generateInterfaceTemplate,
  'model.ts': generateModelTemplate,
};



const generateFileContent = (fileType, name, capitalizedModuleName, exportName, fields) => {
  const generator = fileGenerators[`${fileType}.ts`];
  if (!generator) {
    return `// Define your ${fileType} logic here\nexport const ${exportName} = {};`;
  }
  return generator(name, capitalizedModuleName, fields);
};

const createModule = (name, fields) => {
  try {
    const parsedFields = fields.map(field => {
      const [fieldName, fieldType] = field.split(':');
      if (!fieldName || !fieldType) {
        throw new Error(`Invalid field format: ${field}. Expected format: name:type`);
      }
      return { name: fieldName, type: fieldType };
    });

    const moduleDir = `src/app/modules/${name}`;
    fs.mkdirSync(moduleDir, { recursive: true });

    const files = Object.keys(fileGenerators).map(type => ({
      path: `${moduleDir}/${name}.${type}`,
      type: type.split('.')[0]
    }));

    files.forEach(({ path, type }) => {
      const capitalizedModuleName = name.charAt(0).toUpperCase() + name.slice(1);
      const exportName = `${capitalizedModuleName}${type.charAt(0).toUpperCase() + type.slice(1)}`;
      const content = generateFileContent(type, name, capitalizedModuleName, exportName, parsedFields);
      fs.writeFileSync(path, content.trim() + '\n');
      console.log(`Created: ${path}`);
    });

    console.log(`\nSuccessfully created module '${name}' with all required files.`);
  } catch (error) {
    console.error('Error creating module:', error.message);
    process.exit(1);
  }
};

program
  .command('create <name> <fields...>')
  .description('Create a new module with specified fields')
  .action(createModule);

program.parse(process.argv);