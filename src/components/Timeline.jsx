import React from 'react'

const Timeline = ({ timeline, updateTimeline, openModal, userSettings }) => {
  const hiddenCategories = userSettings?.hiddenCategories || []
  const customLabels = userSettings?.customLabels || {}

  // 06:00 ~ 23:00 (18시간)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6)

  const allColumns = [
    { id: 'school_main', label: '주요일정', zone: 'school' },
    { id: 'school_gongmun', label: '처리업무(공문)', zone: 'school' },
    { id: 'school_minwon', label: '처리업무(민원)', zone: 'school' },
    { id: 'personal_main', label: '주요일정', zone: 'personal' },
    { id: 'personal_health_diet', label: '건강(식사)', zone: 'personal' },
    { id: 'personal_health_exercise', label: '건강(운동)', zone: 'personal' },
    { id: 'personal_gratitude', label: '감사일기', zone: 'personal' }
  ].map(col => ({
    ...col,
    label: customLabels[col.id] !== undefined ? customLabels[col.id] : col.label
  }))

  const columns = allColumns.filter(col => !hiddenCategories.includes(col.id))

  const handleCellClick = (timePrefix, hour, col, existingEntry = null) => {
    if (col.id === 'school_minwon') {
      openModal('minwon', existingEntry || { time: `${timePrefix}00`, category: col.id, zone: col.zone })
    } else {
      openModal('schedule', existingEntry || { hour: hour.toString().padStart(2, '0'), time: `${timePrefix}00`, category: col.id, zone: col.zone })
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
              const timePrefix = `${h.toString().padStart(2, '0')}:`

              return (
              <tr key={h}>
                <td className="time-col">{h.toString().padStart(2, '0')}:00</td>
                {columns.map(col => {
                  const entries = timeline.filter(t => t.time.startsWith(timePrefix) && t.category === col.id)

                  return (
                    <td 
                      key={`${timePrefix}-${col.id}`} 
                      className="timeline-cell"
                      onClick={() => handleCellClick(timePrefix, h, col, null)}
                    >
                      {entries.map((entry, idx) => {
                        let displayContent = entry.content
                        if (col.id === 'school_minwon' && entry.minwon_detail) {
                          displayContent = entry.minwon_detail.title
                        }
                        return (
                          <div 
                            key={entry.id || idx}
                            className="cell-content"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(timePrefix, h, col, { ...entry, hour: h.toString().padStart(2, '0'), zone: col.zone });
                            }}
                            style={{ marginBottom: '4px' }}
                            title="클릭하여 수정 또는 삭제"
                          >
                            <strong style={{color: '#4caf50', marginRight: '4px'}}>[{entry.time}]</strong> 
                            {displayContent}
                          </div>
                        )
                      })}
                      <div 
                        className="add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCellClick(timePrefix, h, col, null);
                        }}
                      >
                        + 추가
                      </div>
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
