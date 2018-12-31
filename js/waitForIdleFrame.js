export default function () {
  return new Promise(fulfill => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(fulfill);
    } else {
      setTimeout(fulfill, 1);
    }
  });
}
