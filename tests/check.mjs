import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildDystinyUrl, buildQuestion, lensQuestions } from '../app.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');

assert.equal(Object.keys(lensQuestions).length, 4);
assert.match(buildQuestion('define'), /which terms and source versions/);
assert.match(buildQuestion('evidence', 'This site conforms'), /Claim to examine: This site conforms\./);
assert.match(buildDystinyUrl('compare'), /utm_content=lens_compare/);
assert.match(buildDystinyUrl('define'), /dystiny\.com\/answer/);
assert.equal((html.match(/<link rel="canonical"/g) ?? []).length, 1);
assert.equal((html.match(/type="radio"/g) ?? []).length, 4);
assert.equal((html.match(/utm_content=example_/g) ?? []).length, 3);
assert.match(html, /W3C WCAG 2\.2/);
assert.match(html, /section508\.gov\/buy/);
assert.match(html, /Nothing is saved or sent from this page/);
assert.match(html, /dystiny\.com\/question-guide/);
assert.match(html, /dystiny\.com\/research-paths\/replay/);
assert.doesNotMatch(html + css, /clarity\.ms|Microsoft Clarity/i);
assert.match(css, /prefers-reduced-motion/);

const structured = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(structured);
assert.deepEqual(JSON.parse(structured[1])['@graph'].map((item) => item['@type']), ['WebApplication', 'ItemList']);
console.log('Dystiny claim-to-source preflight checks passed.');
