export const blacklistedIds: string[] = [
  // Adicione os IDs da blacklist aqui manualmente
  // Exemplo: "12345", "67890"
]

export const BLACKLIST_IDS = blacklistedIds

export function isInBlacklist(passportId: string): boolean {
  return blacklistedIds.includes(passportId.trim())
}

// Versão síncrona para uso no cliente
export function isInBlacklistSync(passportId: string, blacklist: string[]): boolean {
  return blacklist.includes(passportId.trim())
}
