type AppWithName = { name?: string };

function sortAppKeysByName<T extends Record<string, AppWithName>>(
  appKeys: string[],
  registeredApps: T,
): string[] {
  return [...appKeys].sort((a, b) => {
    const nameA = registeredApps[a]?.name?.toLowerCase() || '';
    const nameB = registeredApps[b]?.name?.toLowerCase() || '';
    return nameA.localeCompare(nameB);
  });
}

export default sortAppKeysByName;
