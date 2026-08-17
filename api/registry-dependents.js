import { requireAuth, json, errorResponse } from '../lib/http.js';
import { findRegistryDependents } from '../lib/registry.js';

export default {
  async fetch(request) {
    try {
      requireAuth(request);
      if (request.method !== 'GET') throw new Error('GET required');

      const url = new URL(request.url);
      const targetType = url.searchParams.get('targetType');
      const targetName = url.searchParams.get('targetName');
      const targetVisibility = url.searchParams.get('targetVisibility');
      const dependentVisibility = url.searchParams.get('dependentVisibility');
      const ref = url.searchParams.get('ref');

      const dependents = await findRegistryDependents({
        targetType,
        targetName,
        targetVisibility,
        dependentVisibility,
        ref
      });

      return json({
        ok: true,
        target: {
          type: targetType,
          name: targetName,
          visibility: targetVisibility
        },
        scan: {
          visibility: dependentVisibility,
          ref
        },
        dependents
      });
    } catch (e) {
      return errorResponse(
        e,
        String(e.message).includes('Unauthorized') ? 401 : 400
      );
    }
  }
};
