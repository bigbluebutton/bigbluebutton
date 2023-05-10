export default function getCurrentTime() {
  if (this.userId) {
    return Date().now();
  }

  return 0;
}
