import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';

const isWatch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: ['scr/app.js'],
  bundle: true,
  outfile: 'build/script.js',
  format: 'iife',
  globalName: 'ApiNotioTrack',
  platform: 'browser',
  target: ['es2020'],
  minify: false, // Set to true for production
  sourcemap: false, // Set to true for debugging
  banner: {
    js: `/*!
 * ApiNotioTrack Library
 * Built: ${new Date().toISOString()}
 */`
  }
};

async function build() {
  try {
    if (isWatch) {
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      console.log('Watching for changes...');
    } else {
      await esbuild.build(buildOptions);
      console.log('Build completed successfully!');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
