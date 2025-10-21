const swaggerJsdoc = require('swagger-jsdoc');
const { port } = require('./environment');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FuelNow API Documentation',
      version: '1.0.0',
      description: 'Complete API documentation for FuelNow Backend System',
      contact: {
        name: 'FuelNow API Support',
        email: 'support@fuelnow.com'
      },
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html'
      }
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server'
      },
      {
        url: 'https://fuelnow-api.onrender.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Customer: {
          type: 'object',
          required: ['name', 'phone', 'idNumber', 'nextOfKin', 'cardType'],
          properties: {
            name: {
              type: 'string',
              description: 'Full name of the customer'
            },
            phone: {
              type: 'string',
              description: 'Phone number in E.164 format'
            },
            idNumber: {
              type: 'string',
              description: 'National ID number'
            },
            nextOfKin: {
              type: 'string',
              description: 'Next of kin full name'
            },
            cardType: {
              type: 'string',
              enum: ['credit', 'prepaid'],
              description: 'Type of card'
            }
          }
        },
        Wallet: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Wallet ID'
            },
            customer_id: {
              type: 'integer',
              description: 'Customer ID'
            },
            card_type: {
              type: 'string',
              enum: ['credit', 'prepaid'],
              description: 'Type of card'
            },
            credit_limit: {
              type: 'number',
              format: 'float',
              description: 'Credit limit for credit cards'
            },
            available_balance: {
              type: 'number',
              format: 'float',
              description: 'Available balance'
            },
            reserved_balance: {
              type: 'number',
              format: 'float',
              description: 'Reserved balance for pending transactions'
            },
            used_credit: {
              type: 'number',
              format: 'float',
              description: 'Used credit amount'
            }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Transaction ID'
            },
            wallet_id: {
              type: 'integer',
              description: 'Wallet ID'
            },
            type: {
              type: 'string',
              description: 'Transaction type'
            },
            amount: {
              type: 'number',
              format: 'float',
              description: 'Transaction amount'
            },
            interest_amount: {
              type: 'number',
              format: 'float',
              description: 'Interest amount (10%)'
            },
            total_amount: {
              type: 'number',
              format: 'float',
              description: 'Total amount including interest'
            },
            status: {
              type: 'string',
              enum: ['pending', 'reserved', 'completed', 'failed', 'cancelled'],
              description: 'Transaction status'
            },
            reservation_token: {
              type: 'string',
              description: 'Unique reservation token'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;