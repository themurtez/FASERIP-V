// Save/load is entirely client-side: File > Export downloads a JSON file via
// a throwaway Blob URL, File > Import reads a chosen file back in. No
// backend involved, per PLAN.md.

import { useCharacterStore } from '@/stores/character'

function slugify(name: string): string {
  const cleaned = name.trim().replace(/[^a-z0-9-_]+/gi, '_')
  return cleaned || 'character'
}

export function useCharacterIO() {
  const store = useCharacterStore()

  /** Suggested filename for the current character, without extension --
   * shown pre-filled in the export dialog so the player can override it. */
  function suggestedFileName(): string {
    return slugify(store.character.basicInfo.name)
  }

  function exportToFile(fileName?: string) {
    const json = store.exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slugify(fileName || suggestedFileName())}.faserip.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function importFromFile(file: File) {
    const text = await file.text()
    store.importJSON(text)
  }

  return { exportToFile, importFromFile, suggestedFileName }
}
