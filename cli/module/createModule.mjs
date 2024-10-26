import { program } from 'commander';
import fs from 'fs';

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

      let fileContent = '';

      // Define content based on file type
      if (fileType === 'route') {
        fileContent = `
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ${name.replace(
          name[0],
          name[0].toUpperCase()
        )}Validation } from './${name}.validation';
import { ${name.replace(
          name[0],
          name[0].toUpperCase()
        )}Controller } from './${name}.controller';
const router = express.Router();
router.post(
  '/create',
  // auth() just give user role names and it will handle auth 
  validateRequest(${name.replace(
    name[0],
    name[0].toUpperCase()
  )}Validation.${name.replace(
          name[0],
          name[0].toUpperCase()
        )}ValidationZodSchema),
  ${name.replace(
    name[0],
    name[0].toUpperCase()
  )}Controller.random${name.replace(
          name[0],
          name[0].toUpperCase()
        )}ControllerFunction
);
// Example: router.get('/path', handler);
export const ${name.replace(name[0], name[0].toUpperCase())}Route = router;
        `;
      } else if (fileType === 'model') {
        fileContent = `
import { Schema, model } from 'mongoose';
import { I${name.replace(
          name[0],
          name[0].toUpperCase()
        )}, ${capitalizedModuleName}Model } from './${name}.interface';

const ${name}Schema = new Schema<I${name.replace(
          name[0],
          name[0].toUpperCase()
        )}, ${name.replace(name[0], name[0].toUpperCase())}Model>({
  // Define schema fields here
});

export const ${name.replace(
          name[0],
          name[0].toUpperCase()
        )} = model<I${name.replace(
          name[0],
          name[0].toUpperCase()
        )}, ${name.replace(name[0], name[0].toUpperCase())}Model>(
          '${name}',
          ${name}Schema
        );
        `;
      } else if (fileType === 'interface') {
        fileContent = `
import { Model } from 'mongoose';

export type I${name.replace(name[0], name[0].toUpperCase())} = {
  // Define your interface properties here
};

export type ${name.replace(
          name[0],
          name[0].toUpperCase()
        )}Model = Model<I${name.replace(name[0], name[0].toUpperCase())}>;
        `;
      } else if (fileType === 'service') {
        fileContent = `
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ${name.replace(
          name[0],
          name[0].toUpperCase()
        )} } from './${name}.model';
import { I${name.replace(
          name[0],
          name[0].toUpperCase()
        )} } from './${name}.interface';

export const random${exportName}Function = async () => {
  // Define your service logic here

};
export const ${exportName} = { random${exportName}Function };
        `;
      } else if (fileType === 'validation') {
        fileContent = `
import { z } from 'zod';
// Define your ${fileType} schema here
export const ${exportName}ZodSchema = z.object({
  // Define your schema fields here
});
export const ${exportName} = { ${exportName}ZodSchema };
        `;
      } else if (fileType === 'controller') {
        fileContent = `
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ${name.replace(
          name[0],
          name[0].toUpperCase()
        )}Service } from './${name}.service';
// Define your ${fileType} logic here
export const random${exportName}Function = catchAsync(async (req: Request, res: Response) => {
  // Define your controller logic here
  const result = await ${name.replace(
    name[0],
    name[0].toUpperCase()
  )}Service.random${name.replace(
          name[0],
          name[0].toUpperCase()
        )}ServiceFunction();
 sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'anything heppened successfully',
    data: result,
  });
});
export const ${exportName} = { random${exportName}Function };
        `;
      } else {
        fileContent = `
// Define your ${fileType} logic here
export const ${exportName} = {};
        `;
      }

      // Write content to file
      fs.writeFileSync(file, fileContent.trim());
    });

    console.log(`Module ${name} created with files:`);
    files.forEach(file => console.log(`- ${file}`));
  });

program.parse(process.argv);
