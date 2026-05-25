const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');
const urlModule = require('url');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Local media cache setup (for offline VOD caching)
const mediaCacheDir = path.join(__dirname, 'cache', 'media');
if (!fs.existsSync(mediaCacheDir)) {
    fs.mkdirSync(mediaCacheDir, { recursive: true });
}
const activeDownloads = new Set();

// In-memory cache for IPTV responses (10 minutes TTL)
const cache = new Map();

// Bandwidth tracking stats
const usageStats = {
    apiBytes: 0,
    streamBytes: 0,
    totalBytes: 0,
    startTime: new Date().toLocaleString()
};

// Clean expired cache entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of cache.entries()) {
        if (now > val.expiry) {
            cache.delete(key);
        }
    }
}, 5 * 60 * 1000);

// Enable CORS and serve static files
app.use(cors());
app.use(express.json()); // support JSON requests
app.use(express.static(path.join(__dirname, 'public')));

// General API proxy endpoint for Xtream Codes queries
app.get('/api/proxy', (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    // Check cache (unless nocache is requested)
    const nocache = req.query.nocache === 'true';
    const cached = cache.get(targetUrl);
    if (!nocache && cached && Date.now() < cached.expiry) {
        console.log(`[Cache Hit] Serving cached response for: ${targetUrl}`);
        
        // Track stats (simulate bandwidth transfer)
        usageStats.apiBytes += cached.body.length;
        usageStats.totalBytes += cached.body.length;

        // Ensure CORS is set on the cached headers
        cached.headers['Access-Control-Allow-Origin'] = '*';
        
        res.writeHead(cached.statusCode, cached.headers);
        res.end(cached.body);
        return;
    }

    console.log(`[Proxy Request] Starting GET request to: ${targetUrl}`);

    try {
        const parsedUrl = urlModule.parse(targetUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.path,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate' // request compressed data for maximum speed
            },
            timeout: 15000 // 15 seconds timeout
        };

        const proxyReq = client.request(options, (proxyRes) => {
            console.log(`[Proxy Response] Received status ${proxyRes.statusCode} for: ${targetUrl}`);
            const responseHeaders = { ...proxyRes.headers };
            responseHeaders['Access-Control-Allow-Origin'] = '*';

            // We will buffer the response to save in cache
            const chunks = [];
            let bytesTransferred = 0;

            proxyRes.on('data', (chunk) => {
                chunks.push(chunk);
                bytesTransferred += chunk.length;
                usageStats.apiBytes += chunk.length;
                usageStats.totalBytes += chunk.length;
            });

            proxyRes.on('end', () => {
                const responseBody = Buffer.concat(chunks);
                console.log(`[Proxy Response] Finished request. Transferred ${bytesTransferred} bytes for: ${targetUrl}`);

                // Cache successful responses for 10 minutes
                if (proxyRes.statusCode === 200) {
                    cache.set(targetUrl, {
                        statusCode: proxyRes.statusCode,
                        headers: responseHeaders,
                        body: responseBody,
                        expiry: Date.now() + 10 * 60 * 1000
                    });
                    console.log(`[Cache Store] Cached response of ${bytesTransferred} bytes for: ${targetUrl}`);
                }

                if (!res.headersSent) {
                    res.writeHead(proxyRes.statusCode, responseHeaders);
                    res.end(responseBody);
                }
            });
        });

        proxyReq.on('timeout', () => {
            console.error(`[Proxy Request] Timeout (15s reached) for: ${targetUrl}`);
            proxyReq.destroy();
            if (!res.headersSent) {
                res.status(504).json({ error: 'Gateway Timeout connecting to IPTV server' });
            }
        });

        proxyReq.on('error', (err) => {
            console.error(`[Proxy Request] Error for: ${targetUrl} - ${err.message}`);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Proxy request failed', details: err.message });
            }
        });

        proxyReq.end();
    } catch (err) {
        console.error(`[Proxy Request] Exception for: ${targetUrl} - ${err.message}`);
        res.status(400).json({ error: 'Invalid URL format' });
    }
});

// Stream proxy endpoint with HTTP range request forwarding & offline disk cache
app.get('/api/stream', (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send('Missing url parameter');
    }

    try {
        const parsedUrl = urlModule.parse(targetUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;

        // Check if this is a VOD request (movie or series episode)
        const isVOD = targetUrl.includes('/movie/') || targetUrl.includes('/series/');
        let cachePath = null;
        let cacheFilename = null;

        if (isVOD) {
            const pathParts = parsedUrl.pathname.split('/');
            const type = pathParts[1]; // 'movie' or 'series'
            const filename = pathParts[pathParts.length - 1]; // 'id.ext'
            
            if (type && filename) {
                cacheFilename = `${type}_${filename}`;
                cachePath = path.join(mediaCacheDir, cacheFilename);
            }
        }

        // If cached file exists and is not actively downloading, serve it directly!
        // Express res.sendFile automatically handles HTTP Range requests and status 206!
        if (cachePath && fs.existsSync(cachePath) && !activeDownloads.has(cachePath)) {
            console.log(`[Media Cache Hit] Serving local file: ${cacheFilename}`);
            
            if (req.query.download === 'true') {
                res.setHeader('Content-Disposition', `attachment; filename="${cacheFilename}"`);
            }
            return res.sendFile(cachePath);
        }

        // Propagate headers, especially Range for seeking
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*'
        };

        if (req.headers.range) {
            headers['range'] = req.headers.range;
        }

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.path,
            method: 'GET',
            headers: headers
        };

        // If VOD is not cached, start downloading it in the background
        if (cachePath && !activeDownloads.has(cachePath)) {
            const tempPath = cachePath + '.tmp';
            activeDownloads.add(cachePath);
            
            console.log(`[Media Cache] Starting background download for: ${cacheFilename}`);
            const fileStream = fs.createWriteStream(tempPath);
            
            const downloadOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port,
                path: parsedUrl.path,
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            };

            const downloadReq = client.request(downloadOptions, (downloadRes) => {
                if (downloadRes.statusCode === 200) {
                    downloadRes.pipe(fileStream);
                    fileStream.on('finish', () => {
                        fileStream.close();
                        fs.rename(tempPath, cachePath, (err) => {
                            activeDownloads.delete(cachePath);
                            if (err) {
                                console.error(`[Media Cache] Rename error for ${cacheFilename}:`, err);
                                fs.unlink(tempPath, () => {});
                            } else {
                                console.log(`[Media Cache] Successfully cached VOD file: ${cacheFilename}`);
                            }
                        });
                    });
                } else {
                    fileStream.close();
                    fs.unlink(tempPath, () => {});
                    activeDownloads.delete(cachePath);
                    console.error(`[Media Cache] Downloader status code: ${downloadRes.statusCode}`);
                }
            });

            downloadReq.on('error', (err) => {
                fileStream.close();
                fs.unlink(tempPath, () => {});
                activeDownloads.delete(cachePath);
                console.error(`[Media Cache] Downloader error: ${err.message}`);
            });

            downloadReq.end();
        }

        const proxyReq = client.request(options, (proxyRes) => {
            // Copy status and headers from IPTV server response
            const responseHeaders = { ...proxyRes.headers };
            
            // Explicitly set access control headers
            responseHeaders['Access-Control-Allow-Origin'] = '*';
            responseHeaders['Access-Control-Allow-Headers'] = 'Range, Content-Type, Content-Disposition';

            // Add download Content-Disposition attachment header if requested
            if (req.query.download === 'true') {
                const filename = path.basename(parsedUrl.pathname) || 'video.mp4';
                responseHeaders['Content-Disposition'] = `attachment; filename="${filename}"`;
                if (!responseHeaders['content-type']) {
                    responseHeaders['content-type'] = 'application/octet-stream';
                }
            }

            res.writeHead(proxyRes.statusCode, responseHeaders);

            proxyRes.on('data', (chunk) => {
                usageStats.streamBytes += chunk.length;
                usageStats.totalBytes += chunk.length;
            });

            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            console.error('Stream proxy error:', err.message);
            if (!res.headersSent) {
                res.status(500).send('Stream proxy failed: ' + err.message);
            }
        });

        proxyReq.end();
    } catch (err) {
        console.error('Invalid URL in stream proxy:', err.message);
        res.status(400).send('Invalid URL format');
    }
});

// Endpoint to fetch bandwidth usage stats
app.get('/api/usage', (req, res) => {
    res.json(usageStats);
});

// Endpoint to reset bandwidth usage stats
app.post('/api/usage/reset', (req, res) => {
    usageStats.apiBytes = 0;
    usageStats.streamBytes = 0;
    usageStats.totalBytes = 0;
    usageStats.startTime = new Date().toLocaleString();
    res.json({ success: true, message: 'Usage stats reset successfully' });
});

// Endpoint to check media cache size on disk
app.get('/api/cache/size', (req, res) => {
    let totalSize = 0;
    try {
        if (fs.existsSync(mediaCacheDir)) {
            const files = fs.readdirSync(mediaCacheDir);
            files.forEach(file => {
                const stats = fs.statSync(path.join(mediaCacheDir, file));
                totalSize += stats.size;
            });
        }
        res.json({ size: totalSize });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to clear media cache disk files
app.post('/api/cache/clear', (req, res) => {
    try {
        let deletedCount = 0;
        if (fs.existsSync(mediaCacheDir)) {
            const files = fs.readdirSync(mediaCacheDir);
            files.forEach(file => {
                fs.unlinkSync(path.join(mediaCacheDir, file));
                deletedCount++;
            });
        }
        res.json({ success: true, message: `Successfully deleted ${deletedCount} cache files` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve the index.html on any unrecognized route for SPA routing support
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` IPTV Premium Player Server running on port ${PORT}`);
    console.log(` Access it at: http://localhost:${PORT}`);
    console.log(`==================================================`);
});
