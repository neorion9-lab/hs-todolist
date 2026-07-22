import React, { useState, useEffect } from 'react'

const ScheduleModal = ({ onClose, onSave, initialData }) => {
  const [minute, setMinute] = useState('00')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (initialData) {
      if (initialData.time) {
        setMinute(initialData.time.split(':')[1] || '00')
      }
      setContent(initialData.content || '')
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...initialData,
      time: `${initialData.hour}:${minute}`,
      content
    })
  }

  const handleDelete = () => {
    onSave({
      ...initialData,
      delete: true
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>일정/업무 입력</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <div className="modal-form-group">
            <label>시간 (분 선택)</label>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{initialData?.hour} : </span>
              <select 
                className="input-field" 
                value={minute} 
                onChange={e => setMinute(e.target.value)}
                style={{width: '100px'}}
              >
                <option value="00">00분</option>
                <option value="10">10분</option>
                <option value="20">20분</option>
                <option value="30">30분</option>
                <option value="40">40분</option>
                <option value="50">50분</option>
              </select>
            </div>
          </div>
          
          <div className="modal-form-group">
            <label>일정/업무 내용</label>
            <textarea 
              className="input-field" 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              placeholder="내용을 입력하세요" 
              autoFocus
            />
          </div>

          <div className="modal-footer" style={{justifyContent: 'space-between'}}>
            <button type="button" className="btn btn-secondary" onClick={handleDelete} style={{backgroundColor: '#ffcdd2', color: '#c62828'}}>삭제</button>
            <div style={{display: 'flex', gap: '12px'}}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
              <button type="submit" className="btn btn-primary" disabled={!content.trim()}>저장</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScheduleModal
