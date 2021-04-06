// Color functions
function componentToHex(c) {
// Source: https://stackoverflow.com/a/5624139/636276
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
// Source: https://stackoverflow.com/a/5624139/636276
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


function hexToRgb(hex) {
// Source: https://stackoverflow.com/a/5624139/636276
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function mixColors(c1_hex, c2_hex, r){
  var c1_rgb = hexToRgb(c1_hex);
  var c2_rgb = hexToRgb(c2_hex);
  var output_hex = rgbToHex(
    Math.floor((1-r)*c1_rgb['r'] + r*c2_rgb['r']),
    Math.floor((1-r)*c1_rgb['g'] + r*c2_rgb['g']),
    Math.floor((1-r)*c1_rgb['b'] + r*c2_rgb['b']))
  return output_hex;
}

var hsv2rgb = function(h, s, v) {
  // adapted from http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
  var rgb, i, data = [];
  if (s === 0) {
    rgb = [v,v,v];
  } else {
    h = h / 60;
    i = Math.floor(h);
    data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
    switch(i) {
      case 0:
        rgb = [v, data[2], data[0]];
        break;
      case 1:
        rgb = [data[1], v, data[0]];
        break;
      case 2:
        rgb = [data[0], v, data[2]];
        break;
      case 3:
        rgb = [data[0], data[1], v];
        break;
      case 4:
        rgb = [data[2], data[0], v];
        break;
      default:
        rgb = [v, data[0], data[1]];
        break;
    }
  }
  return '#' + rgb.map(function(x){
    return ("0" + Math.round(x*255).toString(16)).slice(-2);
  }).join('');
};


