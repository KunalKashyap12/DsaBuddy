import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const isWatch = process.argv.includes('--watch');

const configs = [
  // 1. Content Script (Must be IIFE / self-contained, NO ES imports)
  {
    name: 'Content Script',
    entryPoints: ['src/content/index.ts'],
    outfile: 'content/content.js',
    bundle: true,
    format: 'iife',
    target: ['chrome100'],
    loader: { '.ts': 'ts', '.tsx': 'tsx' },
    minify: !isWatch,
    treeShaking: true,
    legalComments: 'none',
    define: { 'process.env.NODE_ENV': '"production"' }
  },
  // 2. Background Service Worker
  {
    name: 'Background Service Worker',
    entryPoints: ['src/background/index.ts'],
    outfile: 'background/background.js',
    bundle: true,
    format: 'esm',
    target: ['chrome100'],
    loader: { '.ts': 'ts', '.tsx': 'tsx' },
    minify: !isWatch,
    treeShaking: true,
    legalComments: 'none',
    define: { 'process.env.NODE_ENV': '"production"' }
  },
  // 3. Popup / Options UI
  {
    name: 'Popup & Options UI',
    entryPoints: ['src/options/PopupApp.tsx'],
    outfile: 'popup/popup.js',
    bundle: true,
    format: 'esm',
    target: ['chrome100'],
    loader: { '.ts': 'ts', '.tsx': 'tsx' },
    minify: !isWatch,
    treeShaking: true,
    legalComments: 'none',
    define: { 'process.env.NODE_ENV': '"production"' }
  }
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function run() {
  console.log(`Building DsaBuddy Chrome Extension${isWatch ? ' (watch mode)' : ' (production optimized)'}...`);

  if (isWatch) {
    for (const config of configs) {
      const { name, ...buildOptions } = config;
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      console.log(`✓ Watching ${name} (${config.outfile})`);
    }
    console.log('\n[Ready] Watching for source changes in src/ ...');
  } else {
    for (const config of configs) {
      const { name, ...buildOptions } = config;
      await esbuild.build(buildOptions);
      const stat = fs.statSync(config.outfile);
      console.log(`✓ ${name} -> ${config.outfile} (${formatBytes(stat.size)})`);
    }
    console.log('\n✓ Production Build Completed Successfully!');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
