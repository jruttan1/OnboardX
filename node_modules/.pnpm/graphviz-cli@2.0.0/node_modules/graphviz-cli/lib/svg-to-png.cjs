'use strict';

var canvas = require('canvas');

const svgSizeRegExp = /<svg width="(\d+)pt" height="(\d+)pt"/;

function convertSVGToPNG (svg) {
  return new Promise((resolve, reject) => {
    const size = svgSizeRegExp.exec(svg);
    /* c8 ignore next */
    if (!size) throw new Error('Unknown SVG size.')
    const canvas$1 = new canvas.Canvas(size[1] / 0.75, size[2] / 0.75);
    const context = canvas$1.getContext('2d');
    const image = new canvas.Image();
    image.onload = () => {
      try {
        context.drawImage(image, 0, 0);
        resolve(canvas$1.toBuffer());
      /* c8 ignore next 3 */
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = reject;
    image.src = Buffer.from(svg);
  })
}

module.exports = convertSVGToPNG;
