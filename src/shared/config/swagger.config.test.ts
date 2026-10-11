import { describe, expect, it } from 'vitest';

import { swaggerSpec } from './swagger.config.js';

describe('OpenAPI specification', () => {
  it('documents the implemented API and keeps authentication requirements accurate', () => {
    expect(swaggerSpec.openapi).toBe('3.0.3');
    expect(swaggerSpec.paths['/api/v1/users/login'].post.security).toBeUndefined();
    expect(swaggerSpec.paths['/api/v1/tours'].get.security).toEqual([
      { bearerAuth: [] },
    ]);
    expect(swaggerSpec.paths['/webhook-checkout'].post).toBeDefined();
    expect(swaggerSpec.paths['/api/v1/tours/top-5-cheap']).toBeUndefined();
  });

  it('defines a path parameter for every templated path', () => {
    for (const [path, pathItem] of Object.entries(swaggerSpec.paths)) {
      const expectedParameters = [...path.matchAll(/\{([^}]+)\}/g)].map(
        (match) => match[1]
      );

      for (const operation of Object.values(pathItem)) {
        const documentedParameters = (operation as any).parameters
          .filter((parameter: any) => parameter.in === 'path')
          .map((parameter: any) => parameter.name);
        expect(documentedParameters.sort()).toEqual(expectedParameters.sort());
      }
    }
  });
});
