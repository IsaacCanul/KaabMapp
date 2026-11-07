export function validateEmail(
  value
) {
  const email =
    String(value ?? "")
      .trim()
      .toLowerCase();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}


export function validatePassword(
  value
) {
  return (
    typeof value ===
      "string" &&
    value.length >= 6
  );
}


export function validateRequired(
  value
) {
  return Boolean(
    String(value ?? "")
      .trim()
  );
}