import React from 'react'

const Header = ({ currentDate, setCurrentDate }) => {
  const handlePrevDay = () => {
    const prev = new Date(currentDate)
    prev.setDate(prev.getDate() - 1)
    setCurrentDate(prev)
  }

  const handleNextDay = () => {
    const next = new Date(currentDate)
    next.setDate(next.getDate() + 1)
    setCurrentDate(next)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' }
    return date.toLocaleDateString('ko-KR', options)
  }

  return (
    <header className="header">
      <button onClick={handlePrevDay}>&lt; 이전날</button>
      <h1>{formatDate(currentDate)}</h1>
      <button onClick={handleNextDay}>다음날 &gt;</button>
      <button onClick={handleToday} style={{ marginLeft: '10px' }}>오늘</button>
    </header>
  )
}

export default Header
