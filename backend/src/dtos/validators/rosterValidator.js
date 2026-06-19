const { z } = require('zod');

const rosterBodyBase = {
    teamId: z.coerce.number().int().positive("L'ID del team non è valido"),
    playerId: z.coerce.number().int().positive("L'ID del giocatore non è valido"),
};

exports.rosterMutationSchema = z.object({
    ...rosterBodyBase,
    purchasePrice: z.coerce.number().int().min(0, "Il prezzo di acquisto non può essere negativo"),
});

exports.rosterDeleteSchema = z.object({
    ...rosterBodyBase
});