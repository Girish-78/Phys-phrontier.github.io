
export const generateLearningOutcomes = async (title: string, category: string, description: string) => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ task: 'outcomes', title, description, category })
  });
  if (!response.ok) return ["Understand the core concepts of " + title, "Analyze physics properties", "Solve practical problems"];
  return await response.json();
};

export const generateThumbnail = async (title: string, description: string) => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ task: 'thumbnail', title, description })
  });
  if (!response.ok) return null;
  const result = await response.json();
  return `data:image/png;base64,${result.data}`;
};
