export const UNIT_ABBREVIATIONS: Record<string, string> = {
  unit: 'U',
  liters: 'Lts',
  milliliters: 'mL',
  kilograms: 'Kg',
  grams: 'G',
  volume: 'Vol.',
  pack: 'Pack',
  pounds: 'Lb',
  ounces: 'Oz',
  centimeters: 'Cm',
  meters: 'Mts',
}

export function toUnitAbbreviation(unit?: string | null): string | null {
  if (!unit) return null
  return UNIT_ABBREVIATIONS[unit] ?? unit
}
