export const countries = [
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "South Korea", code: "KR" },
  { name: "South Africa", code: "ZA" },
  { name: "New Zealand", code: "NZ" },
  { name: "Czech Republic", code: "CZ" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Japan", code: "JP" },
  { name: "France", code: "FR" },
  { name: "Germany", code: "DE" },
  { name: "Italy", code: "IT" },
  { name: "Spain", code: "ES" },
  { name: "India", code: "IN" },
  { name: "Malaysia", code: "MY" },
  { name: "Singapore", code: "SG" },
  { name: "Thailand", code: "TH" },
  { name: "Indonesia", code: "ID" },
  { name: "Philippines", code: "PH" },
  { name: "Vietnam", code: "VN" },
  { name: "China", code: "CN" },
  { name: "Australia", code: "AU" },
  { name: "Canada", code: "CA" },
  { name: "Mexico", code: "MX" },
  { name: "Brazil", code: "BR" },
  { name: "Argentina", code: "AR" },
  { name: "Netherlands", code: "NL" },
  { name: "Switzerland", code: "CH" },
  { name: "Austria", code: "AT" },
  { name: "Portugal", code: "PT" },
  { name: "Greece", code: "GR" },
  { name: "Turkey", code: "TR" },
  { name: "Egypt", code: "EG" },
  { name: "Russia", code: "RU" },
  { name: "Sweden", code: "SE" },
  { name: "Norway", code: "NO" },
  { name: "Denmark", code: "DK" },
  { name: "Finland", code: "FI" },
  { name: "Poland", code: "PL" },
  { name: "Ireland", code: "IE" },
  { name: "Belgium", code: "BE" },
  { name: "Hungary", code: "HU" },
  { name: "Iceland", code: "IS" },
] as const;

/**
 * Best-effort match of a country name inside a free-text destination string
 * (e.g. "Paris, France" -> France). Longest names are checked first so
 * "United Arab Emirates" wins over any shorter substring collision.
 */
export function detectCountry(destination: string) {
  const lower = destination.toLowerCase();
  const sorted = [...countries].sort((a, b) => b.name.length - a.name.length);
  return sorted.find((c) => lower.includes(c.name.toLowerCase())) ?? null;
}
