// @ts-nocheck

function debounce(func, timeOut) {
  let timer;

  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeOut);
    return timer;
  };
}

// https://gist.github.com/nzvtrk/1a444cdf6a86a5a6e6d6a34f0db19065
export function debounce_by_type(func, wait, options) {
  const memory = {};

  return (...args) => {
    const [searchType] = args;
    const payload = args.slice(1);

    if (typeof memory[searchType] === 'function') {
      return memory[searchType](...payload);
    }

    memory[searchType] = debounce(func, wait, { ...options, leading: true });
    return memory[searchType](...payload);
  };
}

export function decode_jwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}
