import { program } from 'commander';
import fs from 'fs';

// Function to generate file content based on file type
const generateFileContent = (fileType, name, capitalizedModuleName, exportName) => {
  switch (fileType) {
    case 'route':
      return `
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ${name[0].toUpperCase() + name.slice(1)}Validation } from './${name}.validation';
import { ${name[0].toUpperCase() + name.slice(1)}Controller } from './${name}.controller';
const router = express.Router();
router.post(
  '/create',
  validateRequest(${name[0].toUpperCase() + name.slice(1)}Validation.${name[0].toUpperCase() + name.slice(1)}ValidationZodSchema),
  ${name[0].toUpperCase() + name.slice(1)}Controller.random${name[0].toUpperCase() + name.slice(1)}ControllerFunction
);
export const ${name[0].toUpperCase() + name.slice(1)}Route = router;
      `;
    case 'model':
      return `
import { Schema, model } from 'mongoose';
import { I${name[0].toUpperCase() + name.slice(1)}, ${capitalizedModuleName}Model } from './${name}.interface';

const ${name}Schema = new Schema<I${name[0].toUpperCase() + name.slice(1)}, ${name[0].toUpperCase() + name.slice(1)}Model>({
  // Define schema fields here
});

export const ${name[0].toUpperCase() + name.slice(1)} = model<I${name[0].toUpperCase() + name.slice(1)}, ${name[0].toUpperCase() + name.slice(1)}Model>('${name}', ${name}Schema);
      `;
    case 'interface':
      return `
import { Model } from 'mongoose';

export type I${name[0].toUpperCase() + name.slice(1)} = {
  // Define your interface properties here
};

export type ${name[0].toUpperCase() + name.slice(1)}Model = Model<I${name[0].toUpperCase() + name.slice(1)}>;
      `;
    case 'service':
      return `
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ${name[0].toUpperCase() + name.slice(1)} } from './${name}.model';
import { I${name[0].toUpperCase() + name.slice(1)} } from './${name}.interface';

export const random${exportName}Function = async () => {
  // Define your service logic here
};

export const ${exportName} = { random${exportName}Function };
      `;
    case 'validation':
      return `
import { z } from 'zod';
export const ${exportName}ZodSchema = z.object({
  // Define your schema fields here
});
export const ${exportName} = { ${exportName}ZodSchema };
      `;
    case 'controller':
      return `
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ${name[0].toUpperCase() + name.slice(1)}Service } from './${name}.service';

export const random${exportName}Function = catchAsync(async (req: Request, res: Response) => {
  const result = await ${name[0].toUpperCase() + name.slice(1)}Service.random${name[0].toUpperCase() + name.slice(1)}ServiceFunction();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'anything happened successfully',
    data: result,
  });
});
export const ${exportName} = { random${exportName}Function };
      `;
    default:
      return `
// Define your ${fileType} logic here
export const ${exportName} = {};
      `;
  }
};

program
  .command('create <name>')
  .description('Create a new module')
  .action(name => {
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
      const capitalizedFileType = fileType[0].toUpperCase() + fileType.slice(1);
      const exportName = `${capitalizedModuleName}${capitalizedFileType}`;

      // Generate content using the new function
      const fileContent = generateFileContent(fileType, name, capitalizedModuleName, exportName).trim();

      // Write content to file
      fs.writeFileSync(file, fileContent);
    });

    console.log(`Module ${name} created with files:`);
    files.forEach(file => console.log(`- ${file}`));
  });

program.parse(process.argv);
