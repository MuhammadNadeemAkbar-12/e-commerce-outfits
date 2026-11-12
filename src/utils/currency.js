/**
 * Shared PKR currency formatting for the Stock, Inventory and Sales Management System.
 * Stored monetary values are unitless decimals — this helper only changes display labels.
 */

export const CURRENCY_CODE = 'PKR'
export const CURRENCY_PREFIX = 'Rs.'

/**
 * @param {number|string|null|undefined} value
 * @param {{ decimals?: number, withPrefix?: boolean }} [options]
 * @returns {string}
 */
export function formatMoney(value, options = {}) {
  const { decimals = 2, withPrefix = true } = options
  const n = Number(value)
  const safe = Number.isFinite(n) ? n : 0
  const formatted = safe.toLocaleString('en-PK', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return withPrefix ? `${CURRENCY_PREFIX} ${formatted}` : formatted
}

/** Alias used by some views historically named formatCurrency / formatPrice / formatAmt */
export const formatCurrency = formatMoney
export const formatPrice = formatMoney
export const formatAmt = formatMoney

export default formatMoney
