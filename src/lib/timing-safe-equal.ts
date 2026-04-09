/**
 * Сравнение строк с постоянным временем (для ASCII-токенов в cookie).
 * Без Node `crypto` — подходит для Edge (middleware).
 */
export function timingSafeEqualUtf8(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
