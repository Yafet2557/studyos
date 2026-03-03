export function subtaskBreakdownPrompt(
  title: string,
  description?: string | null,
  hasDocument?: boolean
): string {
  return `Break down the following assignment into clear, actionable subtasks.

Assignment: ${title}
${description ? `Details: ${description}` : ""}
${hasDocument ? "A requirements document is attached — use it as the primary source for generating subtasks." : ""}

Return ONLY a JSON array of subtask title strings. No explanation, no markdown, just the array.
Example: ["Read chapters 1-3", "Outline key arguments", "Write introduction"]

Rules:
- 3 to 7 subtasks
- Each under 60 characters
- Start each with a verb (Read, Write, Research, Complete, etc.)
- Specific and actionable`;
}

export function noteSummaryPrompt(content: string): string {
  return `Summarize the following notes into concise bullet points. Focus on the most important concepts.

Notes:
${content}

Return plain text bullet points only (use • as the bullet character). No headers, no markdown formatting.`;
}

export function studyQuestionsPrompt(content: string): string {
  return `Generate study questions based on the following notes to help with retention and understanding.

Notes:
${content}

Return ONLY a JSON array of question strings. No explanation, no markdown, just the array.
Example: ["What is the difference between X and Y?", "Explain the concept of Z."]

Rules:
- 5 to 8 questions
- Mix of recall and application questions
- Clear and specific`;
}

export function dailyPlanPrompt(context: string): string {
  return `You are a study planner. Based on the student's current assignments, create a focused daily study plan.

${context}

Write a brief, encouraging daily briefing with:
1. A prioritized focus for today (1-2 assignments to work on)
2. Specific time blocks (e.g., "9-10am: Start Lab 3 outline")
3. A short motivational closing line

Keep it under 200 words. Be direct and practical.`;
}
