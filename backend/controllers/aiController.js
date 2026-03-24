import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()  // reads ANTHROPIC_API_KEY from env

const suggestGoals = async (req, res) => {
  const { intent } = req.body

  if (!intent?.trim()) {
    res.status(400)
    throw new Error('Intent is required')
  }

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',   // fast + cheap for structured output
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a goal-setting coach. Break this vague intent into exactly 3 specific, measurable SMART goals.

Return ONLY a valid JSON array (no markdown, no explanation) with exactly 3 objects. Each object must have:
- "title": string, max 100 chars, actionable
- "description": string, max 200 chars, explains how to achieve it
- "category": string, one of: Career, Health, Learning, Finance, Personal, Fitness, Creative, Social
- "priority": one of: "low", "medium", "high"
- "suggestedDueDays": number of days from today to complete this goal

Intent: "${intent.slice(0, 300)}"`,
      },
    ],
  })

  const raw = message.content[0].text.trim()

  // Extract JSON array even if model wraps it in markdown fences
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) {
    res.status(500)
    throw new Error('Could not parse AI response')
  }

  const goals = JSON.parse(match[0])
  res.json(goals)
}

export { suggestGoals }
