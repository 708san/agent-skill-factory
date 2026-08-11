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

    const schema = {
      openapi: '3.1.0',

      info: {
        title: 'Agent Skill Factory Registry API',
        version: '0.3.1'
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
              {
                name: 'ref',
                in: 'query',
                required: false,
                schema: {
                  type: 'string'
                }
              }
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
                name: 'ref',
                in: 'query',
                required: false,
                schema: {
                  type: 'string'
                },
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
            parameters: [
              qVisibility,
              {
                name: 'ref',
                in: 'query',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Skill list'
              }
            }
          }
        },

        '/api/skill': {
          get: {
            operationId: 'getSkill',
            summary: "Load a Skill's SKILL.md.",
            parameters: [
              qVisibility,
              {
                name: 'name',
                in: 'query',
                required: true,
                schema: {
                  type: 'string'
                }
              },
              {
                name: 'ref',
                in: 'query',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Skill'
              }
            }
          }
        },

        '/api/skill-file': {
          get: {
            operationId: 'getSkillFile',
            summary: 'Load one text resource within a Skill.',
            parameters: [
              qVisibility,
              {
                name: 'name',
                in: 'query',
                required: true,
                schema: {
                  type: 'string'
                }
              },
              {
                name: 'path',
                in: 'query',
                required: true,
                schema: {
                  type: 'string'
                }
              },
              {
                name: 'ref',
                in: 'query',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Skill file'
              }
            }
          }
        },

        '/api/skill-history': {
          get: {
            operationId: 'getSkillHistory',
            summary: 'Get recent history for a Skill or Factory module.',
            parameters: [
              {
                name: 'target',
                in: 'query',
                required: false,
                schema: {
                  type: 'string',
                  enum: ['skill', 'factory'],
                  default: 'skill'
                }
              },
              {
                name: 'visibility',
                in: 'query',
                required: false,
                schema: {
                  type: 'string',
                  enum: ['public', 'private']
                }
              },
              {
                name: 'name',
                in: 'query',
                required: true,
                schema: {
                  type: 'string'
                }
              },
              {
                name: 'ref',
                in: 'query',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'History'
              }
            }
          }
        },

        '/api/create-branch': {
          post: {
            operationId: 'createChangeBranch',
            summary: 'Create a change branch.',
            requestBody: bodySchema(
              {
                target: {
                  type: 'string',
                  enum: ['skill', 'factory']
                },
                visibility: {
                  type: 'string',
                  enum: ['public', 'private']
                },
                branch: {
                  type: 'string'
                },
                base: {
                  type: 'string'
                }
              },
              ['branch']
            ),
            responses: {
              '200': {
                description: 'Branch created'
              }
            }
          }
        },

        '/api/write-files': {
          post: {
            operationId: 'writeRegistryFiles',
            summary: 'Create or replace UTF-8 text files on a change branch.',
            requestBody: bodySchema(
              {
                target: {
                  type: 'string',
                  enum: ['skill', 'factory']
                },
                visibility: {
                  type: 'string',
                  enum: ['public', 'private']
                },
                branch: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                },
                files: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['path', 'content'],
                    properties: {
                      path: {
                        type: 'string'
                      },
                      content: {
                        type: 'string'
                      }
                    }
                  }
                }
              },
              ['branch', 'files']
            ),
            responses: {
              '200': {
                description: 'Files written'
              }
            }
          }
        },

        '/api/delete-file': {
          post: {
            operationId: 'deleteRegistryFile',
            summary: 'Delete one text file on a change branch.',
            requestBody: bodySchema(
              {
                target: {
                  type: 'string',
                  enum: ['skill', 'factory']
                },
                visibility: {
                  type: 'string',
                  enum: ['public', 'private']
                },
                branch: {
                  type: 'string'
                },
                path: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                }
              },
              ['branch', 'path']
            ),
            responses: {
              '200': {
                description: 'File deleted'
              }
            }
          }
        },

        '/api/validate-skill': {
          post: {
            operationId: 'validateSkill',
            summary:
              'Validate proposed SKILL.md text and scan obvious secrets.',
            requestBody: bodySchema(
              {
                skillMd: {
                  type: 'string'
                }
              },
              ['skillMd']
            ),
            responses: {
              '200': {
                description: 'Validation result'
              }
            }
          }
        },

        '/api/compare': {
          get: {
            operationId: 'compareChangeBranch',
            summary: 'Compare a change branch against its base.',
            parameters: [
              {
                name: 'target',
                in: 'query',
                required: false,
                schema: {
                  type: 'string',
                  enum: ['skill', 'factory']
                }
              },
              {
                name: 'visibility',
                in: 'query',
                required: false,
                schema: {
                  type: 'string',
                  enum: ['public', 'private']
                }
              },
              {
                name: 'head',
                in: 'query',
                required: true,
                schema: {
                  type: 'string'
                }
              },
              {
                name: 'base',
                in: 'query',
                required: false,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Diff'
              }
            }
          }
        },

        '/api/pull-request': {
          post: {
            operationId: 'openSkillPullRequest',
            summary: 'Open a pull request from a prepared branch.',
            requestBody: bodySchema(
              {
                target: {
                  type: 'string',
                  enum: ['skill', 'factory']
                },
                visibility: {
                  type: 'string',
                  enum: ['public', 'private']
                },
                head: {
                  type: 'string'
                },
                base: {
                  type: 'string'
                },
                title: {
                  type: 'string'
                },
                body: {
                  type: 'string'
                }
              },
              ['head', 'title']
            ),
            responses: {
              '200': {
                description: 'Pull request opened'
              }
            }
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
