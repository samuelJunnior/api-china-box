const Joi = require("joi");
const ptBr = require("./locales/ptBr");

const validate = (joiSchema, obj) => {
  let { error } = joiSchema.validate(obj);
  if (error != null) {
    let message = "";
    for (const element of error.details) {
      message += `\"${element.context.key}\" ${eval(
        "ptBr.errors." + element.type
      )}.\n`;
    }
    error.message = message;
  }

  return error;
};

Joi.validatePt = validate;
module.exports = Joi;
