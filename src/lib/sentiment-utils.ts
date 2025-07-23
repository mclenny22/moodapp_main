export function getSentimentColor(score: number): string {
  // Normalize score from -5 to +5 range to 0 to 1
  const normalized = (score + 5) / 10
  
  if (normalized < 0.4) {
    // Blue for negative (-5 to -1)
    return 'text-blue-600'
  } else if (normalized > 0.6) {
    // Green for positive (1 to +5)
    return 'text-green-600'
  } else {
    // Grey for neutral (-1 to +1)
    return 'text-gray-600'
  }
}

export function getSentimentBackgroundColor(score: number): string {
  const normalized = (score + 5) / 10
  
  if (normalized < 0.4) {
    return 'bg-blue-50 border-blue-200'
  } else if (normalized > 0.6) {
    return 'bg-green-50 border-green-200'
  } else {
    return 'bg-gray-50 border-gray-200'
  }
}

export function formatSentimentScore(score: number): string {
  return score.toFixed(1)
}

export function getSentimentLabel(score: number): string {
  if (score <= -3) return 'Very Negative'
  if (score <= -1) return 'Negative'
  if (score <= 1) return 'Neutral'
  if (score <= 3) return 'Positive'
  return 'Very Positive'
} 

// Returns a CSS background color (as a string) for a smooth gradient between blue, gray, and green based on sentiment score (-5 to +5)
export function getSentimentGradientColor(score: number): string {
  // Normalize score from -5 to +5 range to 0 to 1
  const normalized = (score + 5) / 10
  // Blue:   #3b82f6 (rgb(59, 130, 246))
  // Gray:   #6b7280 (rgb(107, 114, 128))
  // Green:  #22c55e (rgb(34, 197, 94))
  let r, g, b
  if (normalized < 0.5) {
    // Interpolate between blue and gray
    const t = normalized / 0.5
    r = Math.round(59 + (107 - 59) * t)
    g = Math.round(130 + (114 - 130) * t)
    b = Math.round(246 + (128 - 246) * t)
  } else {
    // Interpolate between gray and green
    const t = (normalized - 0.5) / 0.5
    r = Math.round(107 + (34 - 107) * t)
    g = Math.round(114 + (197 - 114) * t)
    b = Math.round(128 + (94 - 128) * t)
  }
  return `rgb(${r}, ${g}, ${b})`
} 