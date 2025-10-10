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

export function formatProductName(name: string, metadata?: Record<string, unknown> | null): string {
  const unit = (metadata as any)?.unit as string | undefined
  const unitValue = (metadata as any)?.unitValue as number | undefined
  const abbr = toUnitAbbreviation(unit || null)
  if (abbr && typeof unitValue === 'number' && !isNaN(unitValue)) {
    return `${name} ${trimTrailingZeros(unitValue)} ${abbr}`.trim()
  }
  if (abbr && !unitValue) {
    return `${name} ${abbr}`.trim()
  }
  return name
}

export function formatValueWithUnit(unitValue?: number | null, unit?: string | null): string | null {
  const abbr = toUnitAbbreviation(unit || null)
  if (!abbr) return null
  if (typeof unitValue === 'number' && !isNaN(unitValue)) {
    return `${trimTrailingZeros(unitValue)} ${abbr}`
  }
  return `${abbr}`
}

function trimTrailingZeros(n: number): string {
  const s = n.toFixed(2)
  return s.replace(/\.00$/, '').replace(/(\.\d*[1-9])0+$/, '$1')
}


