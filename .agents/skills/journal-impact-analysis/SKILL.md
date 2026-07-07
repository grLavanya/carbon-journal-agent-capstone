---
name: journal-impact-analysis
description: Analyzes a carbon journal entry for environmental impact using real emission-factor data via the get_emission_factor MCP tool, then generates a personalized reflection for the user. Falls back to deterministic rule-based scoring if the agent call fails.
---

# Journal Impact Analysis Skill

This skill handles the evaluation of environmental impact for individual user journal entries. It utilizes real-world emission factors alongside a language model to produce realistic and personalized scores and reflections.

## Trigger Condition
- Triggers automatically upon submission of a new journal entry by the user.

## Required Inputs
To perform the analysis, the following inputs must be provided:
- **`entryText`** (string): The description of the user's activity/habit in the journal entry.
- **`category`** (string): One of the six supported categories (`Transport`, `Energy`, `Food`, `Waste`, `Water`, `Lifestyle`).
- **`mood`** (string | null): The user's self-reported mood/feeling associated with the entry (e.g. `proud`, `concerned`, `hopeful`, `motivated`, `neutral`).

## External Tools and Data Used
- **Tool called**: `get_emission_factor(category, activity)`
  - *Purpose*: Fuzzy-matches the entry's activity text against a curated dataset of emission values to retrieve the corresponding CO2e kilograms and factual context notes.

## Execution Flow & Core Logic
1. Look up the matching entry in the emission factor database using the `get_emission_factor` tool.
2. If a direct match or a high-quality fuzzy match is found, extract the estimated CO2e kilogram value and its associated factual note.
3. If no match is found, fallback to the category-specific default emission estimate.
4. Pass the retrieved emission context, original journal text, and mood to the Gemini API (`gemini-1.5-flash`).
5. Prompt the model to evaluate the overall environmental impact and return a strict JSON payload.
6. **Graceful Fallback**: If the Gemini API call fails, times out (after 8 seconds), or returns malformed data, immediately fall back to the deterministic, rule-based `analyzeEntry()` scoring logic.

## Output Format
The resulting output is a strict JSON object structure:
```json
{
  "score": number,          // Impact score from -10 to 10 based on CO2e impact (negative co2e = positive score)
  "impactType": string,     // The type of impact: "positive" | "negative" | "neutral"
  "worldEffect": string,    // Visual animation affected: "sky" | "trees" | "water" | "flowers"
  "reflection": string,     // A 1-2 sentence encouraging, factual reflection about the carbon footprint impact
  "usedFallback": boolean   // Indicates if the rule-based local fallback was utilized
}
```
