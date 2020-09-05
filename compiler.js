const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { performance } = require('perf_hooks');

const readdir = require('recursive-readdir');

const postcss = require('postcss');
const plugins = require('./postcss.config');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const makeDirectory = promisify(fs.mkdir);
const readDirectory = promisify(fs.readdir);

const PATHS = {};
PATHS.CSS = path.join(__dirname, 'src');
PATHS.OUT = path.join(__dirname, 'output');

const roound = (n, decimals) => {
    const exp = 10 ** decimals;

    return Math.round(n * exp) / exp;
};

(async () => {
    const start = performance.now();

    await makeDirectory(PATHS.OUT, { recursive: true });
	const files = await readdir(PATHS.CSS);
    const contents = await Promise.all(
        files.map(async filePath => {
            const file = await readFile(filePath, { encoding: 'utf8' });
            return file.trim();
        })
    );

    const dest = path.join(PATHS.OUT, 'index.css');

    postcss(plugins).process(contents.join('\n\n'), { from: undefined }).then(result => {
        writeFile(dest, result.css);
    });

    const end = performance.now();
    console.error(`✨ Done in ${roound(end - start, 3)}ms`);
})();