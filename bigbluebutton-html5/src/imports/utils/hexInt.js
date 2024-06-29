
export function HEXToINTColor(hexColor) {
  const _rrggbb = hexColor.slice(1);
  const rrggbb = _rrggbb.substr(0, 2) + _rrggbb.substr(2, 2) + _rrggbb.substr(4, 2);
  return parseInt(rrggbb, 16);
}

export function INTToHEXColor(intColor) {
  let hex;
  hex = parseInt(intColor, 10).toString(16);
  while (hex.length < 6) {
    hex = `0${hex}`;
  }

  return `#${hex}`;
}
