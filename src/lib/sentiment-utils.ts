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