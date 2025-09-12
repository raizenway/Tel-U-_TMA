export function mapScoreDescription(scoreDescriptions: string[]) {
  const result: Record<string, string> = {};
  scoreDescriptions.forEach((desc, index) => {
    result[`scoreDescription${index}`] = desc;
  });
  return result;
}

export function unmapScoreDescription(data: Record<string, string>) {
  const descriptions: string[] = [];
  Object.keys(data).forEach((key) => {
    if (key.startsWith("scoreDescription")) {
      const index = parseInt(key.replace("scoreDescription", ""), 10);
      descriptions[index] = data[key];
    }
  });
  return descriptions;
}
