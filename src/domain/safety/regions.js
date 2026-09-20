// Country-aware generic emergency guidance for the Help Now page.
// Only official, well-established emergency numbers are configured.
// Adding a region requires a reviewed entry here, never a hardcoded hotline.

const REGION_CONFIG = {
  ES: { emergencyNumber: "112" },
  GB: { emergencyNumber: "999" },
  US: { emergencyNumber: "911" },
  OTHER: { emergencyNumber: null }
};

export const REGION_CODES = ["ES", "GB", "US", "OTHER"];

export function getRegionConfig(code) {
  return REGION_CONFIG[code] || REGION_CONFIG.OTHER;
}