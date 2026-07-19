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

  function exportToFile() {
    const json = store.exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slugify(store.character.basicInfo.name)}.faserip.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function importFromFile(file: File) {
    const text = await file.text()
    store.importJSON(text)
  }

  return { exportToFile, importFromFile }
}
