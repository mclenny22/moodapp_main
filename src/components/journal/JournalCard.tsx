import { useState } from 'react'
import { JournalEntry } from '@/lib/database'
import { getSentimentGradientColor } from '@/lib/sentiment-utils'

interface JournalCardProps {
  entry: JournalEntry
  onClick?: (entry: JournalEntry) => void
}

export function JournalCard({ entry, onClick }: JournalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  }

  const handleClick = () => {
    setIsExpanded(!isExpanded)
    onClick?.(entry)
  }

  return (
    <div
      className="box-border flex flex-col items-start justify-start p-[25px] relative rounded-[25px] w-full cursor-pointer transition-all duration-500 ease-out hover:border-[var(--annotation)] font-sans overflow-hidden"
      style={{ gap: isExpanded ? '30px' : '0px' }}
      onClick={handleClick}
    >
      {/* Card Border */}
      <div
        aria-hidden="true"
        className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-[25px]"
      />
      
      {/* Card Header - Always Visible */}
      <div className="box-border flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
        {/* Date */}
        <div className="font-sans font-normal leading-[0] not-italic relative shrink-0 text-[var(--annotation)] text-[12px] text-left text-nowrap">
          <p className="block leading-[normal] whitespace-pre">
            {formatDate(entry.date)}
          </p>
        </div>
        
        {/* Sentiment Score */}
        <div 
          className="font-sans font-medium leading-[0] min-w-full not-italic relative shrink-0 text-[60px] text-left"
          style={{ color: getSentimentGradientColor(entry.sentiment_score) }}
        >
          <p className="block leading-[60px]">
            {entry.sentiment_score < 0 ? '-' : ''}{Math.abs(entry.sentiment_score).toFixed(1)}
          </p>
        </div>
        
        {/* Tags */}
        <div className="box-border flex flex-row gap-5 items-start justify-start p-0 relative shrink-0">
          {entry.tags.map((tag, index) => (
            <div
              key={index}
              className="relative rounded-xl shrink-0"
            >
              <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center overflow-clip px-[9px] py-[3px] relative">
                <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[var(--button-text-secondary)] dark:text-[var(--button-text-secondary)] text-[12px] text-center text-nowrap">
                  <p className="block leading-[normal] whitespace-pre">{tag}</p>
                </div>
              </div>
              <div
                aria-hidden="true"
                className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-xl"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Content - Summary and Original Entry */}
      <div 
        className={`transition-all duration-500 ease-out overflow-hidden flex flex-col gap-[30px] ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Summary Section */}
        <div className="box-border flex flex-col font-sans font-normal gap-2 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-left w-full">
          {/* Summary Label */}
          <div className="relative shrink-0 text-[var(--annotation)] text-[12px] text-nowrap">
            <p className="block leading-[normal] whitespace-pre">Summary</p>
          </div>
          
          {/* Summary Content */}
          <div className="min-w-full relative shrink-0 text-[var(--base-text)] text-[16px]">
            <p className="block leading-[normal]">
              {entry.summary}
            </p>
          </div>
        </div>

        {/* Original Entry Section */}
        <div className="box-border flex flex-col font-sans font-normal gap-2 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-left w-full">
          {/* Original Entry Label */}
          <div className="relative shrink-0 text-[var(--annotation)] text-[12px] text-nowrap">
            <p className="block leading-[normal] whitespace-pre">Original Entry</p>
          </div>
          
          {/* Original Entry Content */}
          <div className="min-w-full relative shrink-0 text-[var(--base-text)] text-[16px]">
            <p className="block leading-[normal] whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 