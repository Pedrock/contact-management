export default function promiseTimeout(t = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, t);
  });
}
