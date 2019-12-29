var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__, { width: 220, height: 300 });
/*!
♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
Utilities
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡
*/
// from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hex2rgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
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
// from https://www.figma.com/plugin-docs/creating-ui/
function clone(val) {
    const type = typeof val;
    if (val === null) {
        return null;
    }
    else if (type === 'undefined' || type === 'number' ||
        type === 'string' || type === 'boolean') {
        return val;
    }
    else if (type === 'object') {
        if (val instanceof Array) {
            return val.map(x => clone(x));
        }
        else if (val instanceof Uint8Array) {
            return new Uint8Array(val);
        }
        else {
            let o = {};
            for (const key in val) {
                o[key] = clone(val[key]);
            }
            return o;
        }
    }
    throw 'unknown';
}
//modified from https://www.figma.com/plugin-docs/working-with-images/
function colorizeImage(node, color) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const paint of node.fills) {
            if (paint.type === 'IMAGE') {
                const image = figma.getImageByHash(paint.imageHash);
                const bytes = yield image.getBytesAsync();
                figma.ui.postMessage({ bytes, color });
            }
        }
    });
}
/*!
♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
Capture messages from the UI
♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥♥
♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡♡
*/
figma.ui.onmessage = msg => {
    const selected = figma.currentPage.selection[0];
    if (msg.type === 'colorize') {
        if (selected !== undefined) {
            const color = hex2rgb(msg.color);
            colorizeImage(selected, color);
        }
        else {
            figma.notify('🖌️ Select an image and update the hex value in the plugin, then click colorize 🎨');
        }
    }
    else if (msg.type === 'newImg') {
        const newFills = [];
        const currentFills = clone(selected.fills);
        for (const paint of currentFills) {
            if (paint.type === 'IMAGE') {
                const bytes = msg.bytes;
                // create a new image fill
                const newPaint = JSON.parse(JSON.stringify(paint));
                newPaint.imageHash = figma.createImage(bytes).hash;
                newFills.push(newPaint);
            }
        }
        selected.fills = newFills;
    }
    else if (msg.type === 'hex error') {
        figma.notify(msg.notification);
    }
    // figma.closePlugin();
};
