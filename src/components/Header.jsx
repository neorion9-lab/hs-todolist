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

  const dateInputRef = React.useRef(null)

  const handleDateChange = (e) => {
    if (e.target.value) {
      setCurrentDate(new Date(e.target.value))
    }
  }

  const openDatePicker = () => {
    if (dateInputRef.current) {
      try {
        if (typeof dateInputRef.current.showPicker === 'function') {
          dateInputRef.current.showPicker()
        } else {
          dateInputRef.current.click()
        }
      } catch (err) {
        dateInputRef.current.focus()
      }
    }
  }

  // 로컬 타임존 기반 yyyy-mm-dd 생성
  const localDateString = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0]

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' }
    return date.toLocaleDateString('ko-KR', options)
  }

  return (
    <header className="header" style={{ position: 'relative' }}>
      <button onClick={handlePrevDay}>&lt; 이전날</button>
      <h1>{formatDate(currentDate)}</h1>
      <button onClick={handleNextDay}>다음날 &gt;</button>
      <button onClick={handleToday} style={{ marginLeft: '10px' }}>오늘</button>
      
      <button onClick={openDatePicker} style={{ marginLeft: '5px', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="날짜 선택">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </button>
      
      <input 
        type="date"
        ref={dateInputRef}
        value={localDateString}
        onChange={handleDateChange}
        style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          width: '1px',
          height: '1px',
          border: 'none',
          padding: 0,
          margin: 0,
          opacity: 0,
          pointerEvents: 'none'
        }}
      />
    </header>
  )
}

export default Header
