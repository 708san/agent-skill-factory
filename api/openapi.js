import { json } from '../lib/http.js';

export default {
  async fetch(request) {
    const origin = new URL(request.url).origin;

    const qVisibility = {
      name: 'visibility',
      in: 'query',
      required: true,
      schema: {
        type: 'string',
        enum: ['public', 'private']
      }
    };

    const qRef = {
      name: 'ref',
      in: 'query',
      required: false,
      schema: {
        type: 'string'
      }
    };

    const qName = {
      name: 'name',
      in: 'query',
      required: true,
      schema: {
        type: 'string'
      }
    };

    const qSearch = [
      {
        name: 'query',
        in: 'query',
        required: true,
        schema: {
          type: 'string'
        }
      },
      qVisibility,
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 20,
          default: 5
        }
      },
      qRef
    ];

    const registryTarget = {
      type: 'string',
      enum: ['skill', 'registry', 'factory']
    };

    const migrationEndpoint = {
      type: 'object',
      additionalProperties: false,
      required: ['name', 'visibility', 'ref'],
      properties: {
        name: {type: 'string'},
        visibility: {type: 'string', enum: ['public', 'private']},
        ref: {type: 'string'}
      }
    };

    const migrationRequestProperties = {
      targetType: {type: 'string', enum: ['skill', 'flow']},
      from: migrationEndpoint,
      to: migrationEndpoint,
      dependentVisibility: {type: 'string', enum: ['public', 'private']},
      dependentRef: {type: 'string'}
    };

    const schema = {
      openapi: '3.1.0',

      info: {
        title: 'Agent Skill Factory Registry API',
        version: '0.8.0'
      },

      servers: [
        {
          url: origin
        }
      ],

      paths: {
        '/api/health': {
          get: {
            operationId: 'healthCheck',
            summary: 'Check the Factory API.',
            responses: {
              '200': {
                description: 'OK'
              }
            }
          }
        },

        '/api/factory-module': {
          get: {
            operationId: 'getFactoryModule',
            summary: 'Load a current Factory module.',
            parameters: [
              {
                name: 'name',
                in: 'query',
                required: true,
                schema: {
                  type: 'string',
                  enum: [
                    'orchestrator',
                    'architect',
                    'author',
                    'reviewer',
                    'publisher'
                  ]
                }
              },
              qRef
            ],
            responses: {
              '200': {
                description: 'Factory module'
              }
            }
          }
        },

        '/api/factory-file': {
          get: {
            operationId: 'getFactoryFile',
            summary: 'Read one UTF-8 source file from the Agent Skill Factory repository.',
            parameters: [
              {
                name: 'path',
                in: 'query',
                required: true,
                schema: {
                  type: 'string'
                },
                description:
                  'Repository-relative path such as api/[...route].js, lib/skills.js, or gpt/INSTRUCTIONS.md.'
              },
              {
                ...qRef,
                description:
                  'Optional Git ref such as main or a feature branch.'
              }
            ],
            responses: {
              '200': {
                description: 'Factory source file'
              },
              '400': {
                description: 'Invalid path or request'
              },
              '401': {
                description: 'Unauthorized'
              }
            }
          }
        },

        '/api/skills': {
          get: {
            operationId: 'listSkills',
            summary: 'List Skills.',
            parameters: [qVisibility, qRef],
            responses: {'200': {description: 'Skill list'}}
          }
        },

        '/api/search-skills': {
          get: {
            operationId: 'searchSkills',
            summary: 'Search Skills by name and SKILL.md metadata.',
            parameters: qSearch,
            responses: {
              '200': {description: 'Matching Skills with name, description, visibility, and optional metadata.'},
              '400': {description: 'Invalid query or visibility.'}
            }
          }
        },

        '/api/skill': {
          get: {
            operationId: 'getSkill',
            summary: "Load a Skill's SKILL.md.",
            parameters: [qVisibility, qName, qRef],
            responses: {'200': {description: 'Skill'}}
          }
        },

        '/api/skill-file': {
          get: {
            operationId: 'getSkillFile',
            summary: 'Load one text resource within a Skill.',
            parameters: [
              qVisibility,
              qName,
              {name: 'path', in: 'query', required: true, schema: {type: 'string'}},
              qRef
            ],
            responses: {'200': {description: 'Skill file'}}
          }
        },

        '/api/flows': {
          get: {
            operationId: 'listFlows',
            summary: 'List saved Flows.',
            parameters: [qVisibility, qRef],
            responses: {'200': {description: 'Flow list'}}
          }
        },

        '/api/search-flows': {
          get: {
            operationId: 'searchFlows',
            summary: 'Search saved Flows independently from Skill discovery.',
            parameters: qSearch,
            responses: {
              '200': {description: 'Matching Flows.'},
              '400': {description: 'Invalid query or visibility.'}
            }
          }
        },

        '/api/flow': {
          get: {
            operationId: 'getFlow',
            summary: "Load a Flow's FLOW.json.",
            parameters: [qVisibility, qName, qRef],
            responses: {'200': {description: 'Flow'}}
          }
        },

        '/api/suites': {
          get: {
            operationId: 'listSuites',
            summary: 'List Suites.',
            parameters: [qVisibility, qRef],
            responses: {'200': {description: 'Suite list'}}
          }
        },

        '/api/search-suites': {
          get: {
            operationId: 'searchSuites',
            summary: 'Search Suites.',
            parameters: qSearch,
            responses: {
              '200': {description: 'Matching Suites.'},
              '400': {description: 'Invalid query or visibility.'}
            }
          }
        },

        '/api/suite': {
          get: {
            operationId: 'getSuite',
            summary: "Load a Suite's SUITE.json.",
            parameters: [qVisibility, qName, qRef],
            responses: {'200': {description: 'Suite'}}
          }
        },

        '/api/registry-dependents': {
          get: {
            operationId: 'getRegistryDependents',
            summary: 'Find reverse Registry dependencies within one explicitly selected Registry scope/ref.',
            parameters: [
              {
                name: 'targetType',
                in: 'query',
                required: true,
                schema: {type: 'string', enum: ['skill', 'flow']}
              },
              {
                name: 'targetName',
                in: 'query',
                required: true,
                schema: {type: 'string'}
              },
              {
                name: 'targetVisibility',
                in: 'query',
                required: true,
                schema: {type: 'string', enum: ['public', 'private']}
              },
              {
                name: 'dependentVisibility',
                in: 'query',
                required: true,
                schema: {type: 'string', enum: ['public', 'private']}
              },
              {
                name: 'ref',
                in: 'query',
                required: true,
                schema: {type: 'string'}
              }
            ],
            responses: {
              '200': {description: 'Matching reverse dependencies from the requested Registry scope.'},
              '400': {description: 'Invalid target identity, Registry scope, or ref.'},
              '401': {description: 'Unauthorized'}
            }
          }
        },

        '/api/plan-registry-reference-migration': {
          post: {
            operationId: 'planRegistryReferenceMigration',
            summary: 'Plan a read-only structural Registry reference migration.',
            requestBody: bodySchema(
              migrationRequestProperties,
              ['targetType', 'from', 'to', 'dependentVisibility', 'dependentRef']
            ),
            responses: {
              '200': {description: 'Migration plan including destination validation, dependents, structural changes, validation previews, and expected file SHAs.'},
              '400': {description: 'Invalid migration request.'},
              '401': {description: 'Unauthorized'}
            }
          }
        },

        '/api/apply-registry-reference-migration': {
          post: {
            operationId: 'applyRegistryReferenceMigration',
            summary: 'Apply a previously planned structural Registry reference migration with SHA protection.',
            requestBody: bodySchema(
              {
                ...migrationRequestProperties,
                expectedFiles: {
                  type: 'object',
                  additionalProperties: {type: 'string'},
                  description: 'Map of dependent manifest path to expected Git blob SHA returned by the plan.'
                },
                message: {type: 'string'}
              },
              ['targetType', 'from', 'to', 'dependentVisibility', 'dependentRef', 'expectedFiles']
            ),
            responses: {
              '200': {description: 'Apply result including migrated count, post-write validation, and remaining old dependencies.'},
              '400': {description: 'Invalid migration request.'},
              '401': {description: 'Unauthorized'}
            }
          }
        },

        '/api/skill-history': {
          get: {
            operationId: 'getSkillHistory',
            summary: 'Get recent history for a Skill or Factory module.',
            parameters: [
              {
                name: 'target', in: 'query', required: false,
                schema: {type: 'string', enum: ['skill', 'flow', 'suite', 'factory'], default: 'skill'}
              },
              {name: 'visibility', in: 'query', required: false, schema: {type: 'string', enum: ['public', 'private']}},
              qName,
              qRef
            ],
            responses: {'200': {description: 'History'}}
          }
        },

        '/api/registry-history': {
          get: {
            operationId: 'getRegistryHistory',
            summary: 'Get recent history for a Skill, Flow, Suite, or Factory module.',
            parameters: [
              {
                name: 'target', in: 'query', required: true,
                schema: {type: 'string', enum: ['skill', 'flow', 'suite', 'factory']}
              },
              {name: 'visibility', in: 'query', required: false, schema: {type: 'string', enum: ['public', 'private']}},
              qName,
              qRef
            ],
            responses: {'200': {description: 'History'}}
          }
        },

        '/api/create-branch': {
          post: {
            operationId: 'createChangeBranch',
            summary: 'Create a change branch.',
            requestBody: bodySchema(
              {
                target: registryTarget,
                visibility: {type: 'string', enum: ['public', 'private']},
                branch: {type: 'string'},
                base: {type: 'string'}
              },
              ['branch']
            ),
            responses: {'200': {description: 'Branch created'}}
          }
        },

        '/api/write-files': {
          post: {
            operationId: 'writeRegistryFiles',
            summary: 'Create or replace UTF-8 text files on a change branch.',
            requestBody: bodySchema(
              {
                target: registryTarget,
                visibility: {type: 'string', enum: ['public', 'private']},
                branch: {type: 'string'},
                message: {type: 'string'},
                files: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['path', 'content'],
                    properties: {path: {type: 'string'}, content: {type: 'string'}}
                  }
                }
              },
              ['branch', 'files']
            ),
            responses: {'200': {description: 'Files written'}}
          }
        },

        '/api/delete-file': {
          post: {
            operationId: 'deleteRegistryFile',
            summary: 'Delete one text file on a change branch. Primary Skill/Flow manifests use dependency-aware fail-closed preflight.',
            requestBody: bodySchema(
              {
                target: registryTarget,
                visibility: {type: 'string', enum: ['public', 'private']},
                branch: {type: 'string'},
                path: {type: 'string'},
                message: {type: 'string'},
                dependencyRefs: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    privateRef: {
                      type: 'string',
                      description: 'Required for public primary Skill/Flow deletion; ref used to scan private Registry dependents.'
                    }
                  }
                }
              },
              ['branch', 'path']
            ),
            responses: {
              '200': {description: 'File deleted'},
              '409': {description: 'Deletion blocked because dependency preflight is incomplete or dependents exist.'}
            }
          }
        },

        '/api/validate-skill': {
          post: {
            operationId: 'validateSkill',
            summary: 'Validate proposed SKILL.md text and scan obvious secrets.',
            requestBody: bodySchema({skillMd: {type: 'string'}}, ['skillMd']),
            responses: {'200': {description: 'Validation result'}}
          }
        },

        '/api/validate-flow': {
          post: {
            operationId: 'validateFlow',
            summary: 'Validate a proposed or stored FLOW.json.',
            requestBody: bodySchema(
              {
                visibility: {type: 'string', enum: ['public', 'private']},
                name: {type: 'string'},
                ref: {type: 'string'},
                flowJson: {type: 'string'}
              },
              ['visibility', 'name']
            ),
            responses: {'200': {description: 'Validation result'}}
          }
        },

        '/api/validate-suite': {
          post: {
            operationId: 'validateSuite',
            summary: 'Validate a proposed or stored SUITE.json.',
            requestBody: bodySchema(
              {
                visibility: {type: 'string', enum: ['public', 'private']},
                name: {type: 'string'},
                ref: {type: 'string'},
                suiteJson: {type: 'string'}
              },
              ['visibility', 'name']
            ),
            responses: {'200': {description: 'Validation result'}}
          }
        },

        '/api/compare': {
          get: {
            operationId: 'compareChangeBranch',
            summary: 'Compare a change branch against its base.',
            parameters: [
              {name: 'target', in: 'query', required: false, schema: registryTarget},
              {name: 'visibility', in: 'query', required: false, schema: {type: 'string', enum: ['public', 'private']}},
              {name: 'head', in: 'query', required: true, schema: {type: 'string'}},
              {name: 'base', in: 'query', required: false, schema: {type: 'string'}}
            ],
            responses: {'200': {description: 'Diff'}}
          }
        },

        '/api/pull-request': {
          post: {
            operationId: 'openSkillPullRequest',
            summary: 'Open a pull request from a prepared branch.',
            requestBody: bodySchema(
              {
                target: registryTarget,
                visibility: {type: 'string', enum: ['public', 'private']},
                head: {type: 'string'},
                base: {type: 'string'},
                title: {type: 'string'},
                body: {type: 'string'}
              },
              ['head', 'title']
            ),
            responses: {'200': {description: 'Pull request opened'}}
          }
        }
      },

      components: {
        schemas: {},
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      },

      security: [
        {
          bearerAuth: []
        }
      ]
    };

    return json(schema);
  }
};

function bodySchema(properties, required = []) {
  return {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties,
          required
        }
      }
    }
  };
}
