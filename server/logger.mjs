const sensitiveKeyPattern = /(?:answer|response|prompt|content|quote|api.?key|secret|authorization|cookie|token)/i;

export function createSafeLogger(write = (line) => console.log(line)) {
  return {
    event(name, metadata = {}) {
      const safe = {};
      for (const [key, value] of Object.entries(metadata)) {
        safe[key] = sensitiveKeyPattern.test(key) ? "[REDACTED]" : value;
      }
      write(JSON.stringify({ timestamp: new Date().toISOString(), event: name, ...safe }));
    },
  };
}

export function normalizedRequestPath(pathname) {
  return pathname
    .replace(/(\/api\/calibration-sessions\/)[^/]+$/, "$1:id")
    .replace(/(\/api\/business-dna-records\/)[^/]+$/, "$1:id");
}
