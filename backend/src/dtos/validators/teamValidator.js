const { z } = require('zod');

exports.createTeamSchema = z.object({
    name: z.string().min(3, "Il nome della squadra deve avere almeno 3 caratteri").max(50),
    leagueId: z.number().int().positive("L'ID della lega non è valido"),
});

exports.updateTeamSchema = z.object({
    name: z.string().min(3, "Il nome della squadra deve avere almeno 3 caratteri").max(50),
});

exports.verifyTokenSchema = z.object({
    token: z.string().uuid("Il token di invito non è valido"),
});

exports.getTeamsSchema = z.object({
    leagueId: z.string().regex(/^\d+$/, "L'ID della lega deve essere un numero intero positivo").transform(Number),
});