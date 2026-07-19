// Origin of Power table -- rules.pdf, cleanly extracted (11 origins, full
// d100 ranges, no reconstruction needed).

import type { RollRange } from '@/types/reference'

export const ORIGINS: RollRange[] = [
  { name: 'Natal', min: 1, max: 10 },
  { name: 'Maturity', min: 11, max: 20 },
  { name: 'Self-Achievement', min: 21, max: 30 },
  { name: 'Endowment', min: 31, max: 35 },
  { name: 'Technical Mishap', min: 36, max: 50 },
  { name: 'Technical Procedure', min: 51, max: 60 },
  { name: 'Creation', min: 61, max: 65 },
  { name: 'Biological Exposure', min: 66, max: 76 },
  { name: 'Chemical Exposure', min: 77, max: 87 },
  { name: 'Energy Exposure', min: 88, max: 98 },
  { name: 'Rebirth', min: 99, max: 100 },
]
