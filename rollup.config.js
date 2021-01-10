import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';
const {markdown} = require('svelte-preprocess-markdown');
const workbox = require('rollup-plugin-workbox-inject');
import {version} from './package.json';
import watchAssets from 'rollup-plugin-watch-assets';
const Mustache = require('mustache');
//import scss from 'rollup-plugin-scss';

const production = !process.env.ROLLUP_WATCH;
const relPath = (url) => url.replace('./', './public/'); // public path for a local url
const U = {
    //'CONF_BOOTSTRAP_CSS': 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.0/css/bootstrap.min.css',
    'CONF_PDFJS_WORKER_JS': 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.worker.min.js',
    'CONF_PDFJS_JS': 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.min.js',
    'CONF_JSPDF_JS': 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.2.0/jspdf.umd.min.js',
    'CONF_JSPDF_TABLE_JS': 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.13/jspdf.plugin.autotable.min.js',
    'CONF_JSPDF_FONT_TTF': './fonts/HelveticaUTF8.ttf',
    'CONF_BUNDLE_JS': './js/bundle.js',
    'CONF_BUNDLE_CSS': './css/bundle.css'
};
function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
                stdio: ['ignore', 'inherit', 'inherit'],
                shell: true
            });

            process.on('SIGTERM', toExit);
            process.on('exit', toExit);
        }
    };
}

export default [{
    input: 'src/main.js',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'app',
        dir: 'public',
        entryFileNames: U.CONF_BUNDLE_JS.replace('./', '')
    },
    plugins: [
        watchAssets({ assets: ['./src/index.html'] }),
        replace({...U, ...{
            'APP_VERSION': version
        }}),
        svelte({
            compilerOptions: {
                // enable run-time checks when not in production
                dev: !production
            },
            extensions: ['.svelte','.md'],
            preprocess: [ 
                markdown()
            ]
        }),
        // we'll extract any component CSS out into
        // a separate file - better for performance

        //scss({ output: 'public/' + U.CONF_BUNDLE_CSS}), // scss needs public/ prefix
        css({ output: U.CONF_BUNDLE_CSS.replace('./', '')}),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
            browser: true,
            dedupe: ['svelte']
        }),
        commonjs(),
        json(),
        copy({
            targets: [{ src: 'assets/**/*', dest: 'public' }],
            flatten: false,
            copyOnce: true,
            verbose: true
          }),
        copy({
            targets: [
                {
                    src: './data/airports.json',
                    dest: './public/data'
                },
                {
                    src: './data/data*.json',
                    dest: './public/data'
                }
            ],
            copyOnce: true,
            verbose: true
        }),
        copy({
            targets: [{ 
                src: 'src/index.html',
                dest: 'public',
                transform: (contents) => Mustache.render(contents.toString(), U)
            }],
            verbose: true
        }),
        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve(),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload({watch: 'public', port:35728}),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser()
    ],
    watch: {
        clearScreen: false
    }
},
{
  input: 'src/sw.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'sw',
    file: 'public/sw.js'
  },
  plugins: [
    replace({...U, ...{
      'process.env.NODE_ENV': JSON.stringify('production')
    }}),
    commonjs(),
    resolve({
      browser: true
    }),
    watchAssets({ assets: ['./src/index.html', 'rollup.config.js'] }),
    workbox({
      "globDirectory": "public/",
      "globPatterns": [
        "index.html",
        "apple-touch-icon.png",
        "css/bundle.css",
        "js/bundle.js"
      ]
    }),
    production && terser()
  ]
}]
;
