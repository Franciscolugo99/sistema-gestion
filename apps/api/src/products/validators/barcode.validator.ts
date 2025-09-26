export function normalizeBarcode(raw?: string | null): string | null {
  if (!raw) return null;
  const digits = String(raw).replace(/\D+/g, '');
  return digits || null;
}

function checksumEAN(digits: string): boolean {
  // EAN-13: 12 dígitos de datos + 1 dígito verificador
  // EAN-8:  7  dígitos de datos + 1 dígito verificador
  const len = digits.length;
  if (len !== 8 && len !== 12 && len !== 13) return false;

  const body = digits.slice(0, len - 1);
  const check = Number(digits[len - 1]);

  // UPC-A (12) usa mismo cálculo que EAN-13 sobre 11 dígitos
  const weights = (idxFromRight: number) => (idxFromRight % 2 === 0 ? 3 : 1);

  let sum = 0;
  // calcular desde la derecha sobre body
  for (let i = 0; i < body.length; i++) {
    const n = Number(body[body.length - 1 - i]);
    sum += n * weights(i);
  }
  const calc = (10 - (sum % 10)) % 10;
  return calc === check;
}

export function isValidBarcode(raw?: string | null): boolean {
  const b = normalizeBarcode(raw);
  if (!b) return true; // permitir vacío/nullable; valida en combinación con IsOptional
  if (![8, 12, 13].includes(b.length)) return false;
  return checksumEAN(b);
}
