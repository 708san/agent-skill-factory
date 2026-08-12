import { json } from '../lib/http.js';

export default {
  async fetch(request) {
    const origin = new URL(request.url).origin;
    const visibility = query('visibility', true, { type: 'string', enum: ['public', 'private'] });
    const ref = query('ref', false, { type: 'string' });
    const name = query('name', true, { type: 'string' });
    const search = [query('query', true, { type: 'string' }), visibility, query('limit', false, { type: 'integer', minimum: 1, maximum: 20, default: 5 }), ref];
    const target = { type: 'string', enum: ['skill', 'registry', 'factory'], default: 'skill' };

    return json({
      openapi: '3.1.0',
      info: { title: 'Agent Skill Factory Registry API', version: '0.5.0' },
      servers: [{ url: origin }],
      paths: {
        '/api/health': get('healthCheck', 'Check the Factory API.'),
        '/api/factory-module': get('getFactoryModule', 'Load a current Factory module.', [query('name', true, { type: 'string', enum: ['orchestrator', 'architect', 'author', 'reviewer', 'publisher'] }), ref]),
        '/api/factory-file': get('getFactoryFile', 'Read one UTF-8 source file from the Factory repository.', [query('path', true, { type: 'string' }), ref]),
        '/api/skills': get('listSkills', 'List Skills.', [visibility, ref]),
        '/api/search-skills': get('searchSkills', 'Search Skills by name and SKILL.md metadata.', search),
        '/api/skill': get('getSkill', "Load a Skill's SKILL.md.", [visibility, name, ref]),
        '/api/skill-file': get('getSkillFile', 'Load one text resource within a Skill.', [visibility, name, query('path', true, { type: 'string' }), ref]),
        '/api/flows': get('listFlows', 'List saved Flows.', [visibility, ref]),
        '/api/search-flows': get('searchFlows', 'Search saved Flows independently from Skill discovery.', search),
        '/api/flow': get('getFlow', "Load a Flow's FLOW.json.", [visibility, name, ref]),
        '/api/suites': get('listSuites', 'List Suites.', [visibility, ref]),
        '/api/search-suites': get('searchSuites', 'Search Suites.', search),
        '/api/suite': get('getSuite', "Load a Suite's SUITE.json.", [visibility, name, ref]),
        '/api/skill-history': get('getSkillHistory', 'Legacy-compatible history endpoint for a Skill, Flow, Suite, or Factory module.', [query('target', false, { type: 'string', enum: ['skill', 'flow', 'suite', 'factory'], default: 'skill' }), query('visibility', false, { type: 'string', enum: ['public', 'private'] }), name, ref]),
        '/api/registry-history': get('getRegistryHistory', 'Get history for a Skill, Flow, Suite, or Factory module.', [query('target', true, { type: 'string', enum: ['skill', 'flow', 'suite', 'factory'] }), query('visibility', false, { type: 'string', enum: ['public', 'private'] }), name, ref]),
        '/api/create-branch': post('createChangeBranch', 'Create a change branch.', body({ target, visibility: visibility.schema, branch: { type: 'string' }, base: { type: 'string' } }, ['branch'])),
        '/api/write-files': post('writeRegistryFiles', 'Create or replace UTF-8 text files on a change branch.', body({ target, visibility: visibility.schema, branch: { type: 'string' }, message: { type: 'string' }, files: { type: 'array', minItems: 1, items: { type: 'object', required: ['path', 'content'], properties: { path: { type: 'string' }, content: { type: 'string' } } } }, ['branch', 'files'])),
        '/api/delete-file': post('deleteRegistryFile', 'Delete one Registry text file on a change branch.', body({ target, visibility: visibility.schema, branch: { type: 'string' }, path: { type: 'string' }, message: { type: 'string' } }, ['branch', 'path'])),
        '/api/validate-skill': post('validateSkill', 'Validate proposed SKILL.md text and scan obvious secrets.', body({ skillMd: { type: 'string' } }, ['skillMd'])),
        '/api/validate-flow': post('validateFlow', 'Validate a proposed or stored FLOW.json, references, DAG, handoffs, conditions, completion, and visibility.', body({ visibility: visibility.schema, name: { type: 'string' }, ref: { type: 'string' }, flowJson: { type: 'string' } }, ['visibility', 'name'])),
        '/api/validate-suite': post('validateSuite', 'Validate a proposed or stored SUITE.json, references, duplicates, and visibility.', body({ visibility: visibility.schema, name: { type: 'string' }, ref: { type: 'string' }, suiteJson: { type: 'string' } }, ['visibility', 'name'])),
        '/api/compare': get('compareChangeBranch', 'Compare a change branch against its base.', [query('target', false, target), query('visibility', false, visibility.schema), query('head', true, { type: 'string' }), query('base', false, { type: 'string' })]),
        '/api/pull-request': post('openSkillPullRequest', 'Open a pull request from a prepared branch.', body({ target, visibility: visibility.schema, head: { type: 'string' }, base: { type: 'string' }, title: { type: 'string' }, body: { type: 'string' } }, ['head', 'title']))
      },
      components: { schemas: {}, securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
      security: [{ bearerAuth: [] }]
    });
  }
};

function query(name, required, schema) { return { name, in: 'query', required, schema }; }
function get(operationId, summary, parameters = []) { return { get: { operationId, summary, parameters, responses: { '200': { description: 'OK' } } } }; }
function post(operationId, summary, requestBody) { return { post: { operationId, summary, requestBody, responses: { '200': { description: 'OK' } } } }; }
function body(properties, required = []) { return { required: true, content: { 'application/json': { schema: { type: 'object', properties, required } } } }; }
