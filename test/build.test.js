import {jest} from '@jest/globals';
import fs from 'fs';

test('index.html exists and has been transformed', () => {
    const contents = fs.readFileSync('./public/index.html', 'utf8');
    expect(contents.includes('{{')).toBeFalsy();
});