// File: src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.verifyAdmin = (req, res, next) => {
  // 1. Cerchiamo l'intestazione (header) "Authorization" nella richiesta
  const authHeader = req.headers.authorization;

  // Se non c'è, o non inizia con "Bearer ", lo blocchiamo alla porta
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Accesso negato. Token mancante.' });
  }

  // 2. Estraiamo il token (togliamo la parola "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verifichiamo se il token è autentico e non è scaduto
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Se è valido, salviamo i dati dell'utente nella richiesta (potrebbero servirci dopo)
    req.user = decoded;
    
    // 4. MAGIA: "Passa la palla" al Controller successivo!
    next(); 
  } catch (error) {
    // Se il token è falso o scaduto, scatta l'allarme
    return res.status(401).json({ success: false, message: 'Token non valido o scaduto.' });
  }
};