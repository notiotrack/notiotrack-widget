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

const baseBuildOptions = {
  entryPoints: ['scr/app.js'],
  bundle: true,
  format: 'iife',
  globalName: 'ApiNotioTrack',
  platform: 'browser',
  target: ['es2020'],
  plugins: [svgLoader, htmlLoader],
  banner: {
    js: `/*!
 * ApiNotioTrack Library
 * Built: ${new Date().toISOString()}
 */`
  }
};

// Build options for development version (script.js)
const devBuildOptions = {
  ...baseBuildOptions,
  outfile: 'build/script.js',
  minify: false,
  sourcemap: 'inline'
};

// Build options for production version (script.min.js)
const prodBuildOptions = {
  ...baseBuildOptions,
  outfile: 'build/script.min.js',
  minify: true,
  sourcemap: true,
  sourcemap: 'external'
};

async function build() {
  try {
    if (isWatch) {
      // For watch mode, build both versions
      const devCtx = await esbuild.context(devBuildOptions);
      const prodCtx = await esbuild.context(prodBuildOptions);

      await Promise.all([
        devCtx.watch(),
        prodCtx.watch()
      ]);

      console.log('🔍 Watching for changes in:');
      console.log('   - scr/app.js');
      console.log('   - scr/template/modal.html');
      console.log('   - icon.svg');
      console.log('   - node_modules (dependencies)');
      console.log('\n✅ Initial build completed!');
      console.log('📦 Output files:');
      console.log('   - build/script.js (development, with inline sourcemap)');
      console.log('   - build/script.min.js (production, with external sourcemap)');
      console.log('   - build/script.min.js.map (source map)');
      console.log('\n⏳ Waiting for changes... (Press Ctrl+C to stop)');

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        await Promise.all([devCtx.dispose(), prodCtx.dispose()]);
        process.exit(0);
      });
    } else {
      // Build both versions
      console.log('🔨 Building development version (script.js)...');
      await esbuild.build(devBuildOptions);
      console.log('✅ Development build completed!');

      console.log('🔨 Building production version (script.min.js)...');
      await esbuild.build(prodBuildOptions);
      console.log('✅ Production build completed!');

      console.log('\n📦 Build completed successfully!');
      console.log('   - build/script.js (development, with inline sourcemap)');
      console.log('   - build/script.min.js (production, with external sourcemap)');
      console.log('   - build/script.min.js.map (source map)');
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
