const { z } = require('zod');

exports.createLeagueSchema = z.object({
    name: z.string({ required_error: "Il nome della lega è obbligatorio." })
                 .min(3, "Il nome della lega deve avere almeno 3 caratteri")
                 .max(50, "Il nome della lega non può superare i 50 caratteri"),
});

exports.updateLeagueSchema = exports.createLeagueSchema;