import React from 'react'

function RatingStars({ value = 0, onChange, interactive = true }) {
  const stars = [1,2,3,4,5]

  return (
    <div className={`rating-stars ${interactive ? 'interactive' : ''}`}>
      {stars.map(s => (
        <span key={s}
          className={s <= value ? 'star filled' : 'star'}
          onClick={() => interactive && onChange && onChange(s)}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default RatingStars
