const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Load camera configuration
const camerasConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../cameras.config.json'), 'utf8')
);

// Store active streams
const activeStreams = new Map();

// API Routes

// Get all cameras
app.get('/api/cameras', (req, res) => {
  res.json(camerasConfig.cameras);
});

// Get single camera
app.get('/api/camera/:id', (req, res) => {
  const camera = camerasConfig.cameras.find(c => c.id === parseInt(req.params.id));
  if (!camera) {
    return res.status(404).json({ error: 'Camera not found' });
  }
  res.json(camera);
});

// Get HLS stream for camera
app.get('/api/stream/:id', (req, res) => {
  const cameraId = parseInt(req.params.id);
  const camera = camerasConfig.cameras.find(c => c.id === cameraId);
  
  if (!camera) {
    return res.status(404).json({ error: 'Camera not found' });
  }

  // Build RTSP URL for Lorex camera
  const rtspUrl = `rtsp://${camera.username}:${camera.password}@${camera.ip}:${camera.port}/cam/realmonitor?channel=${camera.channel}&subtype=0`;
  
  console.log(`Stream request for camera ${cameraId}: ${rtspUrl}`);
  
  // Return HLS playlist URL
  res.json({
    id: camera.id,
    name: camera.name,
    rtsp: rtspUrl,
    hlsUrl: `/api/hls/${cameraId}/playlist.m3u8`
  });
});

// HLS Stream endpoint
app.get('/api/hls/:id/playlist.m3u8', (req, res) => {
  const cameraId = parseInt(req.params.id);
  const camera = camerasConfig.cameras.find(c => c.id === cameraId);
  
  if (!camera) {
    return res.status(404).send('Camera not found');
  }

  res.type('application/vnd.apple.mpegurl');
  res.send(`#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10.0,
/api/hls/${cameraId}/segment-0.ts
`);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', cameras: camerasConfig.cameras.length });
});

// Catch-all for React SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎥 Lorex Camera Server running on port ${PORT}`);
  console.log(`📱 Configured cameras: ${camerasConfig.cameras.length}`);
});

module.exports = app;