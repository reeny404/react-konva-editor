export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter((v): v is string => Boolean(v)).join(' ');
}
