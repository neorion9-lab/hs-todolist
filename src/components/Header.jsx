import React from 'react'

const Header = ({ currentDate, setCurrentDate, onDownloadCSV, onLogout, user, onOpenSettings }) => {
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
    <header className="header">
      <div className="header-left">
        <button onClick={onOpenSettings} className="icon-btn" title="환경 설정">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>

      <div className="header-center">
        <button onClick={handlePrevDay} className="nav-btn">&lt; 이전</button>
        <h1>{formatDate(currentDate)}</h1>
        <button onClick={handleNextDay} className="nav-btn">다음 &gt;</button>
        <button onClick={handleToday} className="today-btn">오늘</button>
        
        <button onClick={openDatePicker} className="icon-btn" title="날짜 선택">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>
      </div>

      <div className="header-right">
        {user && (
          <div className="user-info">
            <span>{user.displayName || '사용자'}님</span>
            <button onClick={onLogout} className="logout-btn">로그아웃</button>
          </div>
        )}
        <button onClick={onDownloadCSV} className="download-btn" title="CSV 파일로 다운로드">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span className="download-text">저장하기</span>
        </button>
      </div>
      
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
