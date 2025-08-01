'use client'

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
    const weekdayOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long'
    }
    const dateOptions: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }
    const weekday = date.toLocaleDateString('en-US', weekdayOptions)
    const fullDate = date.toLocaleDateString('en-US', dateOptions)
    return `${weekday} / ${fullDate}`
  }

  const handleClick = () => {
    setIsExpanded(!isExpanded)
    onClick?.(entry)
  }

  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start p-[25px] relative rounded-[25px] size-full cursor-pointer transition-all duration-700 ease-out hover:border-[var(--annotation)] font-sans overflow-hidden"
      style={{ 
        gap: isExpanded ? '30px' : '0px',
        transition: 'all 700ms ease-out'
      }}
      onClick={handleClick}
    >
      {/* Card Border */}
      <div
        aria-hidden="true"
        className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-[25px]"
      />
      
      {/* Card Header - Always Visible */}
      <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-left w-full">
        {/* Date */}
        <div className="font-inter font-normal relative shrink-0 text-[var(--annotation)] text-[12px] text-nowrap">
          <p className="block leading-[normal] whitespace-pre">
            {formatDate(entry.date)}
          </p>
        </div>
        
        {/* Sentiment Score */}
        <div 
          className="font-inter font-medium min-w-full relative shrink-0 text-[60px] text-left"
          style={{ 
            color: getSentimentGradientColor(entry.sentiment_score),
            width: "min-content"
          }}
        >
          <p className="block leading-[60px]">
            {entry.sentiment_score < 0 ? '-' : ''}{Math.abs(entry.sentiment_score).toFixed(1)}
          </p>
        </div>
        
        {/* Tags - Only visible when expanded with fade-in animation */}
        <div 
          className={`box-border content-stretch flex flex-row gap-2 items-start justify-start p-0 relative shrink-0 transition-all duration-500 ease-out ${
            isExpanded 
              ? 'opacity-100 max-h-[50px] translate-y-0' 
              : 'opacity-0 max-h-0 translate-y-[-10px] overflow-hidden'
          }`}
        >
          {entry.tags.map((tag, index) => (
            <div
              key={index}
              className="h-[21px] relative rounded-[7px] shrink-0"
              style={{
                animationDelay: isExpanded ? `${index * 100}ms` : '0ms',
                animation: isExpanded ? 'fadeInUp 0.4s ease-out forwards' : 'none'
              }}
            >
              <div className="box-border content-stretch flex flex-row gap-1 h-[21px] items-center justify-center overflow-clip px-[9px] py-[3px] relative">
                <div className="flex flex-col font-inter font-normal justify-center leading-[0] not-italic relative shrink-0 text-[var(--base-text)] text-[12px] text-center text-nowrap">
                  <p className="block leading-[normal] whitespace-pre">{tag}</p>
                </div>
              </div>
              <div
                aria-hidden="true"
                className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-[7px]"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Summary Section - Always Visible */}
      <div className="box-border content-stretch flex flex-col font-inter font-normal gap-2 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-left w-full">
        <div className="relative shrink-0 text-[var(--annotation)] text-[12px] text-nowrap">
          <p className="block leading-[normal] whitespace-pre">Summary</p>
        </div>
        <div className="min-w-full relative shrink-0 text-[var(--base-text)] text-[16px]" style={{ width: "min-content" }}>
          <p className="block leading-[normal]">
            {entry.summary}
          </p>
        </div>
      </div>

      {/* Original Entry Section - Only visible when expanded with fade-in animation */}
      <div 
        className={`box-border content-stretch flex flex-col font-inter font-normal gap-2 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-left w-full transition-all duration-500 ease-out ${
          isExpanded 
            ? 'opacity-100 max-h-[500px] translate-y-0' 
            : 'opacity-0 max-h-0 translate-y-[-10px] overflow-hidden'
        }`}
        style={{
          animationDelay: isExpanded ? '200ms' : '0ms'
        }}
      >
        <div className="relative shrink-0 text-[var(--annotation)] text-[12px] text-nowrap">
          <p className="block leading-[normal] whitespace-pre">Original Entry</p>
        </div>
        <div className="min-w-full relative shrink-0 text-[var(--base-text)] text-[16px]" style={{ width: "min-content" }}>
          <p className="block leading-[normal] whitespace-pre-wrap">
            {entry.content}
          </p>
        </div>
      </div>

      {/* CSS Animation Keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
} 