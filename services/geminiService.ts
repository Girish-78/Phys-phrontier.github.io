
export const generateLearningOutcomes = async (title: string, category: string, description: string) => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ task: 'outcomes', title, description, category })
    });
    if (!response.ok) throw new Error("AI busy");
    return await response.json();
  } catch (e) {
    return ["Master theoretical principles", "Analyze experimental data", "Solve complex problems"];
  }
};
