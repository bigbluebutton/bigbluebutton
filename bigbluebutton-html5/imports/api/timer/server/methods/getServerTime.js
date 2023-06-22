export default function getServerTime() {
  if (this.userId) return Date.now();

  return 0;
}
