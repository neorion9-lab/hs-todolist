import React from 'react'

const Timeline = ({ timeline, updateTimeline, openMinwonModal, customMinutes, updateCustomMinutes }) => {
  // 06:00 ~ 23:00 (18시간)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6)

  const columns = [
    { id: 'school_main', label: '주요일정', zone: 'school' },
    { id: 'school_gongmun', label: '처리업무(공문)', zone: 'school' },
    { id: 'school_minwon', label: '처리업무(민원)', zone: 'school' },
    { id: 'personal_main', label: '주요일정', zone: 'personal' },
    { id: 'personal_health_diet', label: '건강(식사)', zone: 'personal' },
    { id: 'personal_health_exercise', label: '건강(운동)', zone: 'personal' },
    { id: 'personal_gratitude', label: '감사일기', zone: 'personal' }
  ]

  const handleCellClick = (timeString, col) => {
    // 이미 내용이 있는지 확인
    const existing = timeline.find(t => t.time === timeString && t.category === col.id)
    
    if (col.id === 'school_minwon') {
      openMinwonModal(existing || { time: timeString, category: col.id })
    } else {
      const text = prompt('일정/업무 내용을 입력하세요 (비우면 삭제):', existing?.content || '')
      if (text !== null) {
        let newTimeline = [...timeline]
        if (text.trim() === '') {
          // 삭제
          newTimeline = newTimeline.filter(t => !(t.time === timeString && t.category === col.id))
          updateTimeline(newTimeline)
        } else {
          // 추가 또는 수정
          if (existing) {
            existing.content = text
          } else {
            newTimeline.push({ time: timeString, category: col.id, content: text })
          }
          const cat = col.id.replace(`${col.zone}_`, '')
          updateTimeline(newTimeline, text, col.zone, cat)
        }
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
              <th className="time-col">시간</th>
              {columns.map(col => (
                <th key={col.id} className={col.zone === 'school' ? 'school-col' : 'personal-col'}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(h => {
              const minute = customMinutes[h] || '00'
              const timeString = `${h.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

              return (
              <tr key={h}>
                <td className="time-col" style={{position: 'relative'}}>
                  {timeString}
                  <select 
                    value={minute} 
                    onChange={(e) => {
                      const newMinute = e.target.value
                      updateCustomMinutes({ ...customMinutes, [h]: newMinute })
                      
                      const newTimeString = `${h.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`
                      const updatedTimeline = timeline.map(t => 
                        t.time === timeString ? { ...t, time: newTimeString } : t
                      )
                      updateTimeline(updatedTimeline)
                    }}
                    style={{
                      position: 'absolute',
                      top: '0px',
                      right: '0px',
                      width: '15px',
                      height: '15px',
                      opacity: 0,
                      cursor: 'pointer',
                      zIndex: 2
                    }}
                    title="분 설정"
                  >
                    <option value="00">00분</option>
                    <option value="10">10분</option>
                    <option value="20">20분</option>
                    <option value="30">30분</option>
                    <option value="40">40분</option>
                    <option value="50">50분</option>
                    <option value="60">60분</option>
                  </select>
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    fontSize: '0.6rem',
                    pointerEvents: 'none',
                    color: '#999'
                  }}>
                    ▼
                  </div>
                </td>
                {columns.map(col => {
                  const entry = timeline.find(t => t.time === timeString && t.category === col.id)
                  let displayContent = entry?.content
                  if (col.id === 'school_minwon' && entry?.minwon_detail) {
                    displayContent = entry.minwon_detail.title
                  }

                  return (
                    <td 
                      key={`${timeString}-${col.id}`} 
                      className="timeline-cell"
                      onClick={() => handleCellClick(timeString, col)}
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
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Timeline
