# ApiNotioTrack - Single-file Bundled Library

This project creates a single-file bundled library (`build/script.js`) from the source code in `scr/app.js` and all its npm dependencies.

## Structure

- `scr/app.js` - Main source file (entry point)
- `build/script.js` - Generated bundled output (single file with all dependencies)
- `build.js` - Build configuration using esbuild
- `package.json` - Project dependencies and scripts

## Setup

1. Install dependencies:
```bash
npm install
```

## How to Add npm Dependencies

### Step 1: Install the Package

Add the npm package to your project:

```bash
npm install <package-name>
```

For example:
```bash
npm install axios
npm install lodash
```

### Step 2: Import in `scr/app.js`

Import the package in the main source file (`scr/app.js`) using ES6 import syntax:

```javascript
// Import default export
import axios from 'axios';

// Import named exports
import { debounce } from 'lodash';

// Import specific functions
import { get, post } from 'axios';
```

### Step 3: Use in Your Code

Use the imported libraries in your `ApiNotioTrack` object or other functions:

```javascript
const ApiNotioTrack = {
  async fetchData(url) {
    const response = await axios.get(url);
    return response.data;
  },

  debouncedFunction: debounce((callback) => {
    callback();
  }, 300)
};
```

### Step 4: Build

Run the build command to bundle everything into `build/script.js`:

```bash
npm run build
```

All dependencies will be automatically included in the `build/script.js` file.

## Build Commands

- `npm run build` - Build once
- `npm run watch` - Build and watch for changes (auto-rebuild on file changes)

## Usage in HTML

After building, include the bundled file in your HTML:

```html
<script src="build/script.js"></script>
<script>
  // The library is available as ApiNotioTrack
  ApiNotioTrack.init();
  console.log(ApiNotioTrack.example());
</script>
```

## Important Notes

1. **All imports must be ES6 modules** - Use `import` syntax, not `require()`
2. **Import in `scr/app.js`** - All npm packages must be imported in the main source file to be included in the bundle
3. **Browser compatibility** - The bundle targets ES2020 browsers. Adjust `target` in `build.js` if needed
4. **Minification** - Set `minify: true` in `build.js` for production builds
5. **Source maps** - Set `sourcemap: true` in `build.js` for debugging

## Example: Adding a New Library

Let's say you want to add `date-fns`:

1. Install: `npm install date-fns`
2. Import in `scr/app.js`:
   ```javascript
   import { format, parseISO } from 'date-fns';
   ```
3. Use it:
   ```javascript
   const ApiNotioTrack = {
     formatDate(date) {
       return format(parseISO(date), 'yyyy-MM-dd');
     }
   };
   ```
4. Build: `npm run build`
5. The `date-fns` library will now be included in `build/script.js`

## Troubleshooting

- **Package not included?** - Make sure you imported it in `scr/app.js`
- **Build errors?** - Check that the package supports ES modules or use a compatible version
- **Browser errors?** - Ensure the target browser supports ES2020 features
