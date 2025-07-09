'use strict';

var renderGraph = require('@aduh95/viz.js/async');
var promises = require('fs/promises');

function readStandardInput () {
  return new Promise(resolve => {
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin
      .on('data', chunk => (input += chunk))
      .on('end', () => resolve(input))
      .resume();
  })
}

let convertSVGToPNG;

const engines = ['circo', 'dot', 'fdp', 'neato', 'osage', 'twopi'];
const formats = ['svg', 'png', 'dot', 'xdot', 'plain', 'plain-ext', 'ps', 'ps2', 'json', 'json0', 'canon'];

async function getConvertSVGToPNG () {
  if (!convertSVGToPNG) {
    try {
      convertSVGToPNG = require('./svg-to-png.cjs');
    /* c8 ignore next 4 */
    } catch (err) {
      console.error('Did you forget to install the NPM package "canvas"?');
      throw err
    }
  }
  return convertSVGToPNG
}

async function renderGraphFromSource ({ name: inputName, input } = {},
  { name: outputName, engine, format, yInvert, nop } = {}) {
  if (engine && !engines.includes(engine)) throw new Error(`Invalid layout engine: "${engine}".`)
  if (format && !formats.includes(format)) throw new Error(`Invalid output format: "${format}".`)
  if (nop !== undefined && nop !== 0 && nop !== 1) throw new Error(`Invalid no-layout mode: "${nop}".`)
  if (!input) input = await (inputName ? promises.readFile(inputName, 'utf-8') : readStandardInput());
  const isPNG = format === 'png';
  if (isPNG) format = 'svg';
  let output = await renderGraph(input, { engine, format, yInvert });
  if (isPNG) output = await (await getConvertSVGToPNG())(output);
  if (outputName) await promises.writeFile(outputName, output);
  return output
}

exports.engines = engines;
exports.formats = formats;
exports.renderGraphFromSource = renderGraphFromSource;
