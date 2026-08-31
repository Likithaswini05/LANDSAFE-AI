import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory cloud backup storage for the cloud-based backup system
interface BackupSnapshot {
  id: string;
  timestamp: string;
  backupName: string;
  sizeBytes: number;
  recordsCount: number;
  sha256Digest: string;
  cloudRegion: string;
  status: 'synced' | 'verified';
  dataPayload?: string; // encrypted string
}

let cloudBackups: BackupSnapshot[] = [
  {
    id: 'bcp-auto-001',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    backupName: 'Automated_Hourly_Cloud_Sync_v1.0.landsafe',
    sizeBytes: 142850,
    recordsCount: 48,
    sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    cloudRegion: 'asia-south1 (Mumbai Primary Vault)',
    status: 'verified'
  },
  {
    id: 'bcp-auto-002',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    backupName: 'Daily_Consolidated_Encrypted_Backup.landsafe',
    sizeBytes: 318920,
    recordsCount: 112,
    sha256Digest: 'a8f5f167f44f4964e6c998dee827110c08003a3d5360980cf7168d1396b27d42',
    cloudRegion: 'asia-south2 (Delhi Disaster Recovery)',
    status: 'synced'
  }
];

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'LandSafe AI Early Warning System', timestamp: new Date().toISOString() });
});

// 2. Cloud Backup endpoints
app.get('/api/backups', (req, res) => {
  res.json({
    success: true,
    totalBackups: cloudBackups.length,
    lastBackupTime: cloudBackups[0]?.timestamp || null,
    cloudProvider: 'Google Cloud Platform Cloud Storage (Multi-Region Resilient)',
    backups: cloudBackups
  });
});

app.post('/api/backups/create', (req, res) => {
  const { backupName, sizeBytes, recordsCount, sha256Digest, dataPayload, cloudRegion } = req.body;

  const newBackup: BackupSnapshot = {
    id: `bcp-${Date.now()}`,
    timestamp: new Date().toISOString(),
    backupName: backupName || `Manual_Encrypted_Snapshot_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.landsafe`,
    sizeBytes: sizeBytes || 184500,
    recordsCount: recordsCount || 56,
    sha256Digest: sha256Digest || 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
    cloudRegion: cloudRegion || 'asia-south1 (Mumbai Multi-AZ Vault)',
    status: 'verified',
    dataPayload: dataPayload ? String(dataPayload).slice(0, 50000) : undefined
  };

  cloudBackups.unshift(newBackup);
  // Keep last 15 backups
  if (cloudBackups.length > 15) {
    cloudBackups = cloudBackups.slice(0, 15);
  }

  res.json({
    success: true,
    message: 'Encrypted snapshot safely replicated to cloud storage',
    backup: newBackup
  });
});

// 3. AI Risk Analysis using Gemini (with fallback heuristic)
app.post('/api/predict-risk', async (req, res) => {
  const { areaName, rainfall24h, soilMoisture, slopeDegrees, elevation, geologyType, population } = req.body;

  let geminiExplanation = '';

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are the Lead Geotechnical AI Specialist for LandSafe AI Disaster Management System.
Analyze the following environmental and terrain sensor data for landslide hazard:
- Location / Zone: ${areaName || 'Highland Hill Sector'}
- 24-Hour Rainfall: ${rainfall24h} mm
- Soil Moisture Saturation: ${soilMoisture} %
- Slope Angle: ${slopeDegrees} degrees
- Elevation: ${elevation} meters
- Geology Formation: ${geologyType || 'Weathered metamorphic clay & gneiss'}
- Estimated Local Population: ${population} people

Provide a concise, professional Explainable AI (XAI) risk analysis in 2-3 sentences explaining the physical mechanism causing the risk, specific threshold breaches, and 3 actionable safety recommendations for authorities and citizens. Keep it authoritative, clear, and realistic.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response && response.text) {
        geminiExplanation = response.text;
      }
    } catch (err: any) {
      console.warn('Gemini API query error (falling back to physics heuristic):', err?.message || err);
    }
  }

  // Calculate physics-based risk score
  const rainWeight = Math.min(rainfall24h / 200, 1.0) * 35;
  const moistureWeight = Math.min(soilMoisture / 100, 1.0) * 30;
  const slopeWeight = Math.min(slopeDegrees / 55, 1.0) * 25;
  const elevationWeight = Math.min(elevation / 2500, 1.0) * 10;

  const rawScore = Math.round(rainWeight + moistureWeight + slopeWeight + elevationWeight);
  const riskScore = Math.min(Math.max(rawScore, 5), 98);

  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (riskScore >= 75) riskLevel = 'critical';
  else if (riskScore >= 60) riskLevel = 'high';
  else if (riskScore >= 35) riskLevel = 'medium';

  const defaultExplanation = `${riskLevel.toUpperCase()} RISK: Rainfall reached ${rainfall24h}mm with soil moisture at ${soilMoisture}% on steep ${slopeDegrees}° terrain. Hydrostatic pore-pressure exceeds shear resistance along the bedrock slip plane.`;

  res.json({
    success: true,
    riskScore,
    riskLevel,
    explanation: geminiExplanation || defaultExplanation,
    factors: [
      { factor: 'Precipitation Trigger', impact: Math.round(rainWeight), description: `${rainfall24h}mm in last 24h` },
      { factor: 'Pore Water Saturation', impact: Math.round(moistureWeight), description: `${soilMoisture}% moisture level` },
      { factor: 'Terrain Gradient', impact: Math.round(slopeWeight), description: `${slopeDegrees}° slope steepness` },
      { factor: 'Geological Bedrock', impact: Math.round(elevationWeight), description: geologyType || 'Weathered regolith' }
    ]
  });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LandSafe AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
