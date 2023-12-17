

export function sanitizeUndefined<T>(obj: T): T {
  const _obj = obj as any;
  const objectKeys = Object.keys(_obj);
  for (const key of objectKeys) {
    if (_obj[key] === undefined) {
      delete _obj[key];
    }
  }
  return obj;
}
