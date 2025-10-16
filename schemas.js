  //   const Joi = require('joi');

  //   //reason that there is campground: Joi.object because in html form
  //   //there is wrap like this
  //   //<input class="form-control" type="text" id="location" name="campground[location]" required>
  // module.exports.campgroundSchema = Joi.object({
  //   campground: Joi.object({ 
  //     title: Joi.string().required(),
  //     price: Joi.number().required().min(0),
  //     // image: Joi.string().required(),
  //     location: Joi.string().required(),
  //     description: Joi.string().required(),

  //   }).required(),
  //     deleteImages: Joi.array()
  // });

  // module.exports.reviewSchema = Joi.object({
  //   review: Joi.object({
  //     rating: Joi.number().required().min(1).max(5),
  //     body: Joi.string().required()
  //   }).required()
  // });

const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: { //escapeHTML can now be used to the schemas object
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(), //escapeHTML() acquired via extension > rules
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})

module.exports.userSchema = Joi.object({
    username: Joi.string().min(5).required().pattern(/^\S+$/, 'no spaces allowed').escapeHTML()
    .min(5)
    .max(30)
    .messages({
        'string.pattern.base': 'Username cannot contain spaces.'
    }),
    email:Joi.string().email().required().escapeHTML(),
    password: Joi.string()
    .required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'))
    .escapeHTML()
    .min(1).max(30)
    .messages({'string.pattern.base': 'Password must be at least 8 characters long and include uppercase, lowercase, and a number.'}),
}).required()

module.exports.userResetPasswordSchema = Joi.object({
    password: Joi.string()
    .required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$'))
    .escapeHTML()
    .min(1).max(30)
    .messages({'string.pattern.base': 'Password must be at least 8 characters long and include uppercase, lowercase, and a number.'}),

    confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords must match.',
      'any.required': 'Please confirm your password.'
    })
}).required()