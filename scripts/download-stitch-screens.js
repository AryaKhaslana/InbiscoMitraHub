#!/usr/bin/env node
/**
 * Stitch Screens & Assets Downloader
 * Connects to Google Stitch API using STITCH_API_KEY and downloads HTML + PNG screenshots.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ID = '14458223726399373382';
const API_KEY = process.env.STITCH_API_KEY || 'AQ.Ab8RN6IxwPBpMTnou98fs2Rg-TeH9sq3oCt6SvGO86QdFvIqKQ';

async function main() {
  const outDir = path.join(__dirname, '..', 'stitch_screens');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`🚀 Connecting to Stitch API for Project: ${PROJECT_ID}...`);

  const npxPath = '/home/wisesa/.npm/_npx/829c6278c197c365/node_modules/@google/stitch-sdk/dist/src/index.js';
  const { StitchToolClient } = await import(npxPath);

  const client = new StitchToolClient({ apiKey: API_KEY });
  await client.connect();
  console.log('✅ Connected to Stitch MCP Gateway!');

  console.log('🔍 Listing all screens in project...');
  const res = await client.callTool('list_screens', { projectId: PROJECT_ID });
  const screens = res.screens || [];
  console.log(`📊 Found ${screens.length} total screens in project.\n`);

  for (let i = 0; i < screens.length; i++) {
    const s = screens[i];
    const screenId = s.name.split('/').pop();
    const title = s.title || `Screen_${i + 1}`;
    const slug = `${String(i + 1).padStart(2, '0')}_${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${screenId.slice(0, 8)}`;

    console.log(`[${i + 1}/${screens.length}] Processing: "${title}" (${screenId})`);

    // Download HTML
    if (s.htmlCode?.downloadUrl) {
      try {
        const resp = await fetch(s.htmlCode.downloadUrl, {
          headers: { 'X-Goog-Api-Key': API_KEY },
        });
        if (resp.ok) {
          const json = await resp.json();
          const htmlContent = json.dataString || '';
          const htmlFile = path.join(outDir, `${slug}.html`);
          fs.writeFileSync(htmlFile, htmlContent, 'utf8');
          console.log(`   📄 HTML: Saved ${htmlFile} (${htmlContent.length} chars)`);
        } else {
          console.error(`   ⚠️ HTML download HTTP error: ${resp.status}`);
        }
      } catch (err) {
        console.error(`   ❌ Failed downloading HTML:`, err.message);
      }
    }

    // Download Screenshot PNG
    if (s.screenshot?.downloadUrl) {
      try {
        const resp = await fetch(s.screenshot.downloadUrl, {
          headers: { 'X-Goog-Api-Key': API_KEY },
        });
        if (resp.ok) {
          const json = await resp.json();
          if (json.dataString) {
            const imgBuffer = Buffer.from(json.dataString, 'base64');
            const pngFile = path.join(outDir, `${slug}.png`);
            fs.writeFileSync(pngFile, imgBuffer);
            console.log(`   🖼️  PNG:  Saved ${pngFile} (${imgBuffer.length} bytes)`);
          }
        } else {
          console.error(`   ⚠️ Image download HTTP error: ${resp.status}`);
        }
      } catch (err) {
        console.error(`   ❌ Failed downloading Image:`, err.message);
      }
    }
  }

  await client.close();
  console.log('\n🎉 ALL SCREENS & ASSETS DOWNLOADED SUCCESSFULLY TO stitch_screens/');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
