import React, { useState, useEffect } from 'react'

const ALL_CATEGORIES = [
  { id: 'school_main', label: '주요일정', zone: 'school' },
  { id: 'school_gongmun', label: '처리업무(공문)', zone: 'school' },
  { id: 'school_minwon', label: '처리업무(민원)', zone: 'school' },
  { id: 'personal_main', label: '주요일정', zone: 'personal' },
  { id: 'personal_health_diet', label: '건강(식사)', zone: 'personal' },
  { id: 'personal_health_exercise', label: '건강(운동)', zone: 'personal' },
  { id: 'personal_gratitude', label: '감사일기', zone: 'personal' },
];

const SettingsModal = ({ onClose, onSave, initialSettings }) => {
  const [hiddenCategories, setHiddenCategories] = useState([])
  const [customLabels, setCustomLabels] = useState({})

  useEffect(() => {
    if (initialSettings) {
      if (initialSettings.hiddenCategories) {
        setHiddenCategories(initialSettings.hiddenCategories)
      }
      if (initialSettings.customLabels) {
        setCustomLabels(initialSettings.customLabels)
      }
    }
  }, [initialSettings])

  const handleToggle = (id) => {
    setHiddenCategories(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleLabelChange = (id, value) => {
    setCustomLabels(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ hiddenCategories, customLabels })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>환경 설정 (표시 항목 선택)</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <p style={{fontSize: '0.9rem', color: '#666'}}>요약 화면에서 보고 싶은 일정을 선택하고, 이름을 원하는 대로 수정해보세요.</p>
          
          <div style={{ marginBottom: '10px' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px', fontSize: '1.1rem', color: '#4CAF50' }}>학교 (School)</h3>
            {ALL_CATEGORIES.filter(c => c.zone === 'school').map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={!hiddenCategories.includes(c.id)} 
                    onChange={() => handleToggle(c.id)}
                    style={{ width: '18px', height: '18px' }}
                  />
                </label>
                <input 
                  type="text" 
                  value={customLabels[c.id] !== undefined ? customLabels[c.id] : c.label} 
                  onChange={(e) => handleLabelChange(c.id, e.target.value)}
                  style={{ flex: 1, padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem' }}
                />
              </div>
            ))}
          </div>

          <div>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px', fontSize: '1.1rem', color: '#FFEB3B' }}>개인 (Personal)</h3>
            {ALL_CATEGORIES.filter(c => c.zone === 'personal').map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={!hiddenCategories.includes(c.id)} 
                    onChange={() => handleToggle(c.id)}
                    style={{ width: '18px', height: '18px' }}
                  />
                </label>
                <input 
                  type="text" 
                  value={customLabels[c.id] !== undefined ? customLabels[c.id] : c.label} 
                  onChange={(e) => handleLabelChange(c.id, e.target.value)}
                  style={{ flex: 1, padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem' }}
                />
              </div>
            ))}
          </div>

          <div className="modal-footer" style={{justifyContent: 'flex-end', marginTop: '10px'}}>
            <div style={{display: 'flex', gap: '12px'}}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
              <button type="submit" className="btn btn-primary">저장</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SettingsModal
