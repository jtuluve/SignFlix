import fs from 'fs';
import path from 'path';

describe('Infrastructure Checks', () => {
  // Shadcn UI Installation Checks
  it('should have Shadcn UI button component installed', () => {
    const buttonPath = path.resolve(__dirname, '../components/ui/button.tsx');
    expect(fs.existsSync(buttonPath)).toBe(true);
  });

  it('should have components.json file', () => {
    const componentsJsonPath = path.resolve(__dirname, '../components.json');
    expect(fs.existsSync(componentsJsonPath)).toBe(true);
  });

  it('should have lib/utils.ts file', () => {
    const utilsPath = path.resolve(__dirname, '../lib/utils.ts');
    expect(fs.existsSync(utilsPath)).toBe(true);
  });

  // Prisma ORM Installation Checks
  it('should have prisma/schema.prisma file', () => {
    const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
    expect(fs.existsSync(schemaPath)).toBe(true);
  });

  it('should have Prisma client generated', () => {
    const prismaClientPath = path.resolve(__dirname, '../node_modules/.prisma/client');
    expect(fs.existsSync(prismaClientPath)).toBe(true);
  });

  // TypeScript Check (indirect via successful compilation and test run)
  // A direct `tsc --noEmit` is recommended for full type checking in CI.
});





