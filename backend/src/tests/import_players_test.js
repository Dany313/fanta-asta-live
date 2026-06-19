// Importiamo la libreria per leggere i file Excel/ODS
const xlsx = require('xlsx');

// Il nome del tuo file (assicurati che sia scritto esattamente così)
const FILE_NAME = 'Quotazioni_Fantacalcio_Stagione_2024_25.ods';

const FILE_PATH = `./${FILE_NAME}`;

async function test_lettura_file() {
    try {
        console.log("Apertura del file in corso...");

        // 1. Leggiamo l'intero file (Workbook)
        const workbook = xlsx.readFile(FILE_PATH);

        // 2. Prendiamo il nome della prima "pagina" (Sheet)
        const firstSheetName = workbook.SheetNames[0];
        console.log(`Pagina trovata: "${firstSheetName}"`);

        // 3. Estraiamo quella pagina
        const sheet = workbook.Sheets[firstSheetName];

        // 4. Magia di xlsx: convertiamo la pagina in un Array di oggetti JSON
        // Di default, usa la prima riga del file come "chiavi" (nomi delle colonne)
        const playersData = xlsx.utils.sheet_to_json(sheet);

        console.log(`Trovati ${playersData.length} giocatori/righe nel file.`);

        // 5. Stampiamo il PRIMO giocatore per vedere la struttura esatta delle colonne
        console.log("\n--- STRUTTURA DEL PRIMO GIOCATORE ---");
        console.log(playersData[0]);
        console.log("-------------------------------------\n");
    } catch (error) {
        console.error("Errore durante la lettura del file:", error.message);
    }
}

// Eseguiamo la funzione di test
test_lettura_file();