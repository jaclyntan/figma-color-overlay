figma.showUI(__html__, { width: 200, height: 300 });

/*!
♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
Utilities
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡
*/

//credit: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hex2rgb(hex) {
  hex = hex.replace("#", "");

  if (hex.length === 4) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])$/i;
  } else if (hex.length === 5) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])([a-f\d])$/i;
  } else {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  }

  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

//credit:  https://www.figma.com/plugin-docs/creating-ui/
function clone(val) {
  const type = typeof val
  if (val === null) {
    return null
  } else if (type === 'undefined' || type === 'number' ||
    type === 'string' || type === 'boolean') {
    return val
  } else if (type === 'object') {
    if (val instanceof Array) {
      return val.map(x => clone(x))
    } else if (val instanceof Uint8Array) {
      return new Uint8Array(val)
    } else {
      let o = {}
      for (const key in val) {
        o[key] = clone(val[key])
      }
      return o
    }
  }
  throw 'unknown'
}

let messageHandler;
//credit: https://www.figma.com/plugin-docs/working-with-images/
async function colorizeImage(node, color, removeColor) {
  if("fills" in node) {
    for (const paint of node.fills) {
      if (paint.type === 'IMAGE') {
        const image = figma.getImageByHash(paint.imageHash)
        const bytes = await image.getBytesAsync()
        figma.ui.postMessage({ bytes, color, removeColor })
      }
    }
  } else {
    messageHandler = figma.notify('🖌️ Please select an image. 🎨', { timeout: 3000 })
  }
}



/*!
♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
Capture messages from the UI
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡
*/


figma.ui.onmessage = msg => {
  //select current selection
  const selected = figma.currentPage.selection[0] as GeometryMixin;

  //gather original image data to be processed
  if (msg.type === 'colorize') {

    if (selected !== undefined) {
      if ( msg.color || msg.removeColor ) {
        const color = hex2rgb(msg.color);
        const removeColor = hex2rgb(msg.removeColor);
        colorizeImage(selected, color, removeColor);
      }
    }

  //apply new image data
  } else if (msg.type === 'newImg') {

    const newFills = [];
    const currentFills = clone(selected.fills);

    for (const paint of currentFills) {
      if (paint.type === 'IMAGE') {
        const bytes = msg.bytes
        // create a new image fill
        const newPaint = JSON.parse(JSON.stringify(paint))
        newPaint.imageHash = figma.createImage(bytes).hash
        newFills.push(newPaint)

        messageHandler = figma.notify('✨Done ✨', { timeout: 1000 })
      }
    }

    selected.fills = newFills;

  } else if (msg.type === 'hex error') {

    figma.notify(msg.notification);

  }
};
