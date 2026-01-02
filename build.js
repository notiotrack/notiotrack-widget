import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isWatch = process.argv.includes('--watch');

// Plugin to load SVG files as text
const svgLoader = {
  name: 'svg-loader',
  setup(build) {
    build.onLoad({ filter: /\.svg$/ }, (args) => {
      const contents = readFileSync(args.path, 'utf8');
      return {
        contents,
        loader: 'text'
      };
    });
  }
};

// Plugin to load HTML files as text
const htmlLoader = {
  name: 'html-loader',
  setup(build) {
    build.onLoad({ filter: /\.html$/ }, (args) => {
      const contents = readFileSync(args.path, 'utf8');
      return {
        contents,
        loader: 'text'
      };
    });
  }
};

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
  plugins: [svgLoader, htmlLoader],
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
