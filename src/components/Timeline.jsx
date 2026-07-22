import React, { useState } from 'react'

const Timeline = ({ timeline, updateTimeline, openMinwonModal }) => {
  const [intervalMin, setIntervalMin] = useState(60)

  // 06:00 ~ 23:00 생성
  const times = []
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += intervalMin) {
      times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    }
  }

  const columns = [
    { id: 'school_main', label: '주요일정', zone: 'school' },
    { id: 'school_gongmun', label: '처리업무(공문)', zone: 'school' },
    { id: 'school_minwon', label: '처리업무(민원)', zone: 'school' },
    { id: 'personal_main', label: '주요일정', zone: 'personal' },
    { id: 'personal_health_diet', label: '건강(식사)', zone: 'personal' },
    { id: 'personal_health_exercise', label: '건강(운동)', zone: 'personal' },
    { id: 'personal_gratitude', label: '감사일기', zone: 'personal' }
  ]

  const handleCellClick = (time, col) => {
    // 이미 내용이 있는지 확인
    const existing = timeline.find(t => t.time === time && t.category === col.id)
    
    if (col.id === 'school_minwon') {
      openMinwonModal(existing || { time, category: col.id })
    } else {
      const text = prompt('일정/업무 내용을 입력하세요 (비우면 삭제):', existing?.content || '')
      if (text !== null) {
        let newTimeline = [...timeline]
        if (text.trim() === '') {
          // 삭제
          newTimeline = newTimeline.filter(t => !(t.time === time && t.category === col.id))
        } else {
          // 추가 또는 수정
          if (existing) {
            existing.content = text
          } else {
            newTimeline.push({ time, category: col.id, content: text })
          }
        }
        updateTimeline(newTimeline)
      }
    }
  }

  return (
    <div className="timeline-wrapper" style={{ marginTop: '30px' }}>
      <h2 className="section-title">타임라인 (Timeline)</h2>
      <div className="timeline-container">
        <table className="timeline-table">
          <thead>
            <tr>
              <th className="time-col" style={{position: 'relative', paddingRight: '20px'}}>
                시간
                <select 
                  value={intervalMin} 
                  onChange={(e) => setIntervalMin(Number(e.target.value))}
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '20px',
                    height: '20px',
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                  title="시간 간격 설정"
                >
                  <option value={10}>10분</option>
                  <option value={20}>20분</option>
                  <option value={30}>30분</option>
                  <option value={40}>40분</option>
                  <option value={50}>50분</option>
                  <option value={60}>60분</option>
                </select>
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: '4px',
                  fontSize: '0.6rem',
                  pointerEvents: 'none',
                  color: '#666'
                }}>
                  ▼
                </div>
              </th>
              {columns.map(col => (
                <th key={col.id} className={col.zone === 'school' ? 'school-col' : 'personal-col'}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map(time => (
              <tr key={time}>
                <td className="time-col">{time}</td>
                {columns.map(col => {
                  const entry = timeline.find(t => t.time === time && t.category === col.id)
                  let displayContent = entry?.content
                  if (col.id === 'school_minwon' && entry?.minwon_detail) {
                    displayContent = entry.minwon_detail.title
                  }

                  return (
                    <td 
                      key={`${time}-${col.id}`} 
                      className="timeline-cell"
                      onClick={() => handleCellClick(time, col)}
                    >
                      {displayContent && (
                        <div className="cell-content">
                          {displayContent}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Timeline
