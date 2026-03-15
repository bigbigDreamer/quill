#!/usr/bin/env node
const { Resvg } = require('@resvg/resvg-js');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const svg = readFileSync(path.join(root, 'icon.svg'));

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 128 },
});

const png = resvg.render().asPng();
writeFileSync(path.join(root, 'icon.png'), png);
console.log('icon.png generated from icon.svg');
