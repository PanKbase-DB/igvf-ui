// igvfd data server URL
export const SERVER_URL = "http://nginx:8000"
export const API_URL = "http://localhost:8000"
export const BACKEND_URL = "http://localhost:3000"

// Auth0
export const AUTH0_CLIENT_ID = "xaO8MMn04qlT3TUnhczmKWZgBzqRySDm"
export const AUTH0_ISSUER_BASE_DOMAIN = "igvf-dacc.us.auth0.com"
export const AUTH0_AUDIENCE = "https://igvf-dacc.us.auth0.com/api/v2/"

// Site title
export const SITE_TITLE = "IGVF"
// Brand color
export const BRAND_COLOR = "#337788"

// UNICODE entity codes, needed in JSX string templates. Each property named after the equivalent
// HTML entity. Add new entries to this object as needed.
export const UC = {
  deg: "\u00B0",
  ndash: "\u2013", // en dash
  mdash: "\u2014", // em dash
  lsquo: "\u2018", // Right single quote
  rsquo: "\u2019", // Right single quote
  ldquo: "\u201c", // Left double quote
  rdquo: "\u201d", // Right double quote
}

// Keyboard event key codes.
export const KC = {
  TAB: 9,
  RETURN: 13,
  ESC: 27,
  SPACE: 32,
}
