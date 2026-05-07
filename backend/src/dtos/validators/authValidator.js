const { z } = require('zod');

exports.loginSchema = z.object({
    username: z.string().min(1, "L'username è obbligatorio"),
    password: z.string().min(1, "La password è obbligatoria"),
});