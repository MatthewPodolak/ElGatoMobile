export function truncate(str, max = 7) {
  return str && str.length > max ? `${str.slice(0, max)}…` : str;
}