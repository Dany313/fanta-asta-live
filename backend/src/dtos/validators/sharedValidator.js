const { z } = require('zod');

// Schema per validare un parametro 'id' numerico
exports.paramsIdSchema = z.object({
    id: z.string().regex(/^\d+$/, "L'ID deve essere un numero intero positivo").transform(Number),
});

// Schema per validare un parametro 'leagueId' numerico
exports.paramsLeagueIdSchema = z.object({
    leagueId: z.string().regex(/^\d+$/, "L'ID della lega deve essere un numero intero positivo").transform(Number),
});

// Schema per validare un parametro 'teamId' numerico
exports.paramsTeamIdSchema = z.object({
    teamId: z.string().regex(/^\d+$/, "L'ID del team deve essere un numero intero positivo").transform(Number),
});