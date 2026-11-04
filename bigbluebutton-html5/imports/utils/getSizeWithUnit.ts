// Formats a byte count for the upload messages: MB, or kB when the MB figure would read 0.00
export default function getSizeWithUnit(size: number) {
  // If the size in MB is negligible (0.00), switch to kB for better precision
  const mbString = (size / 1000000).toFixed(2);
  const kbString = (size / 1000).toFixed(2);
  return (mbString === '0.00' || mbString === '0,00')
    ? `${kbString} kB`
    : `${mbString} MB`;
}
