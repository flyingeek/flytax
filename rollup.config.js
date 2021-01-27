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
import html from '@open-wc/rollup-plugin-html';
import {DATASET} from './src/stores';
const Mustache = require('mustache');
import fs from 'fs';

const production = !process.env.ROLLUP_WATCH;
const relPath = (url) => url.replace('./', './public/'); // public path for a local url

//For adding/remove year, change DATASET is src/stores.js

const U = {
    'APP_VERSION': version,
    'process.env.NODE_ENV': (production) ? JSON.stringify('production') : JSON.stringify('development'),
    'CONF_PDFJS_WORKER_JS': 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.worker.min.js',
    'CONF_PDFJS_JS': 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.min.js',
    'CONF_JSPDF_JS': 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.2.0/jspdf.umd.min.js',
    'CONF_JSPDF_TABLE_JS': 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.13/jspdf.plugin.autotable.min.js',
    'CONF_JSPDF_FONT_TTF': './fonts/HelveticaUTF8.ttf',
    'CONF_BUNDLE_JS': './js/bundle.js',
    'CONF_BUNDLE_CSS': './css/bundle.css',
    'CONF_ABRILFATFACE_WOFF2': '../fonts/abril-fatface-v12-latin-ext_latin-regular.woff2', /* relative to public/css/bundle.css */
    'CONF_ABRILFATFACE_WOFF': '../fonts/abril-fatface-v12-latin-ext_latin-regular.woff',
    'CONF_DATASET_URLS': Array.from(new Set(DATASET.map(o => o.url))).join(';'),
    'CONF_FM_EXAMPLE_IMG': './img/fm_exemple3.jpg',
    'CONF_S_EXAMPLE_IMG': './img/s_exemple3.jpg',
    // 'CONF_FM_EXAMPLE_WEBP': './img/fm_exemple2.jpg'.replace('.jpg', '.webp'),
    // 'CONF_S_EXAMPLE_WEBP': './img/s_exemple2.jpg'.replace('.jpg', '.webp')

};
function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            const command = (process.env.SERVE === 'start2') ? 'start2' : 'start';
            server = require('child_process').spawn('npm', ['run', command, '--', '--dev'], {
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
        replace({...U}),
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

        //scss({ output: relPath(U.CONF_BUNDLE_CSS) }), // scss needs public/ prefix
        css({ output: U.CONF_BUNDLE_CSS.replace('./', '') }),

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
                },
                {
                    src: './data/*.?sv',
                    dest: './public/data'
                },
                {
                    src: './src/reset.html',
                    dest: './public'
                }//,
                // {
                //     src: './src/index.html',
                //     dest: './public',
                //     transform: (contents) => Mustache.render(contents.toString(), U)
                // }
            ],
            copyOnce: true,
            verbose: true
        }),
        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve(),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload({watch: 'public', port:35728, https: (process.env.SERVE === 'start2') ? {
            key: fs.readFileSync('localhost-key.pem'),
            cert: fs.readFileSync('localhost-cert.pem')
        } : null}),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser()
    ],
    watch: {
        clearScreen: false
    }
},
{
    input: 'src/index.html',
    output: { dir: 'public'},
    plugins: [html({
        minify: false,
        transform: [
            htmlString => Mustache.render(htmlString, U)
        ],
    })],
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
        replace({...U}),
        commonjs(),
        resolve({
            browser: true
        }),
        watchAssets({ assets: ['rollup.config.js', './public/css/bundle.css', './public/js/bundle.js'] }),
        workbox({
            "globDirectory": "public/",
            "globPatterns": [
                "index.html",
                "css/bundle.css",
                "js/bundle.js"
            ]
        }),
        production && terser()
    ],
    watch: {
        clearScreen: false,
        include: []
    }
}];
