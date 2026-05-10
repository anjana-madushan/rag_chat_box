import React from 'react'
import PromptSuggestionButton from './PromptSuggestionButton'

const PromptSuggesstionRow = ({ onPromptClick }) => {

  const prompts = [
    "Who is the current Formula One world Driver's Champion?",
    "Who is the most used card in Formula One?",
    "Who is the highest paid F1 Dirver?"
  ]

  return (
    <div className='prompt-suggestion-row'>
      {prompts.map((prompt, index) =>
        <PromptSuggestionButton key={`suggestion-${index}`} text={prompt} onClick={() => onPromptClick(prompt)} />)}
    </div>
  )
}

export default PromptSuggesstionRow