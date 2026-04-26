// Locks in the JSON shape produced from a fixture changelog. The fixture
// follows the Keep a Changelog spec (https://keepachangelog.com) with all
// six valid section types: Added, Changed, Deprecated, Removed, Fixed,
// Security.
//
// It also includes two intentional non-spec edge cases that the parser must
// handle robustly because real-world changelogs aren't always strict:
//   - A version with free-form prose instead of categorized subsections
//     (the project's own CHANGELOG.md does this for v1.0.0)
//   - Two h2 headings back-to-back with no content between them
import {readFileSync} from 'fs';
import {mdToJson} from '../src/utilities/mdToJson';

const md = readFileSync('test/fixtures/changelog.md', 'utf8');

test('parses CHANGELOG markdown into expected JSON shape', () => {
    expect(mdToJson(md)).toMatchSnapshot();
});
