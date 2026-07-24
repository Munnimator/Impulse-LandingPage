import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number.parseInt(process.env.PORT || '3000', 10);

const MIME_TYPES = new Map([
    ['.css', 'text/css; charset=utf-8'],
    ['.html', 'text/html; charset=utf-8'],
    ['.ico', 'image/x-icon'],
    ['.js', 'text/javascript; charset=utf-8'],
    ['.json', 'application/json; charset=utf-8'],
    ['.png', 'image/png'],
    ['.svg', 'image/svg+xml'],
    ['.txt', 'text/plain; charset=utf-8'],
    ['.webmanifest', 'application/manifest+json'],
]);

function getRequestedPath(requestUrl) {
    const pathname = decodeURIComponent(new URL(requestUrl || '/', 'http://localhost').pathname);
    const resolvedPath = path.resolve(__dirname, `.${pathname}`);
    const rootPrefix = `${__dirname}${path.sep}`;

    if (resolvedPath !== __dirname && !resolvedPath.startsWith(rootPrefix)) return null;
    return resolvedPath;
}

async function resolveFilePath(requestUrl) {
    const requestedPath = getRequestedPath(requestUrl);
    if (!requestedPath) return null;

    try {
        const fileStats = await stat(requestedPath);
        if (fileStats.isFile()) return requestedPath;
        if (fileStats.isDirectory()) {
            const indexPath = path.join(requestedPath, 'index.html');
            if ((await stat(indexPath)).isFile()) return indexPath;
        }
    } catch {
        // Unknown browser routes use the landing page fallback below.
    }

    return path.join(__dirname, 'index.html');
}

const server = createServer(async (req, res) => {
    try {
        const filePath = await resolveFilePath(req.url);
        if (!filePath) {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Bad request');
            return;
        }

        res.writeHead(200, {
            'Content-Type': MIME_TYPES.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream',
        });

        if (req.method === 'HEAD') {
            res.end();
            return;
        }

        createReadStream(filePath).pipe(res);
    } catch (error) {
        console.error('Local server error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Local server error');
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`
    🚀 Landing page server running!

    Local:    http://127.0.0.1:${PORT}

    Press Ctrl+C to stop
    `);
});
