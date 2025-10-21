const Joi = require('joi');

const customerOnboardingSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(), // E.164 format
  idNumber: Joi.string().min(5).max(20).required(),
  nextOfKin: Joi.string().min(2).max(100).required(),
  cardType: Joi.string().valid('credit', 'prepaid').required()
});

const transactionValidationSchema = Joi.object({
  rider_phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  station_id: Joi.string().required(),
  attendant_id: Joi.string().required(),
  amount: Joi.number().positive().required()
});

const cardValidationSchema = Joi.object({
  card_token: Joi.string().required(),
  station_id: Joi.string().required(),
  attendant_id: Joi.string().required(),
  amount: Joi.number().positive().required()
});

const captureTransactionSchema = Joi.object({
  reservation_id: Joi.string().required(),
  final_amount: Joi.number().positive().required(),
  litres: Joi.number().positive().optional(),
  meter_reading: Joi.string().optional()
});

const repaymentSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  amount: Joi.number().positive().required()
});

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    next();
  };
}

module.exports = {
  validate,
  customerOnboardingSchema,
  transactionValidationSchema,
  cardValidationSchema,
  captureTransactionSchema,
  repaymentSchema
};