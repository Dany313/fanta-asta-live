const { z } = require('zod');

const validate = (schemas) => {
    return async (req, res, next) => {
        try {
            if (schemas.params) {
                req.params = await schemas.params.parseAsync(req.params);
            }
            if (schemas.body) {
                req.body = await schemas.body.parseAsync(req.body);
            }
            if (schemas.query) {
                req.query = await schemas.query.parseAsync(req.query);
            }
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: "Dati di input non validi",
                    details: (error.issues || error.errors || []).map(err => ({ 
                        path: err.path ? err.path.join('.') : '', 
                        message: err.message 
                    }))
                });
            }
            next(error);
        }
    };
};

module.exports = validate;