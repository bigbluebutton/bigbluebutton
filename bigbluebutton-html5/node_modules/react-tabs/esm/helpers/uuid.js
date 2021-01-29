// Get a universally unique identifier
var count = 0;
export default function uuid() {
  return "react-tabs-" + count++;
}
export function reset() {
  count = 0;
}