import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Serve static files
app.use(express.static(__dirname));

// Serve index.html for all routes (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
    🚀 Landing page server running!
    
    Local:    http://localhost:${PORT}
    Network:  http://[your-ip]:${PORT}
    
    Press Ctrl+C to stop
    `);
});