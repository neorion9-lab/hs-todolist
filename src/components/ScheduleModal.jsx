import React, { useState, useEffect } from 'react'

const ScheduleModal = ({ onClose, onSave, initialData }) => {
  const [hour, setHour] = useState('09')
  const [minute, setMinute] = useState('00')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('진행중')
  const [memo, setMemo] = useState('')

  useEffect(() => {
    if (initialData) {
      if (initialData.hour) {
        setHour(initialData.hour)
      } else if (initialData.time) {
        setHour(initialData.time.split(':')[0])
      }

      if (initialData.time) {
        setMinute(initialData.time.split(':')[1] || '00')
      }
      setContent(initialData.content || '')
      setStatus(initialData.status || '진행중')
      setMemo(initialData.memo || '')
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...initialData,
      time: `${hour}:${minute}`,
      content,
      status,
      memo
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
              <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{hour} : </span>
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

          <div className="modal-form-group">
            <label>처리 결과</label>
            <select className="input-field" value={status} onChange={e => setStatus(e.target.value)}>
              <option>진행중</option>
              <option>완료</option>
              <option>후속조치 필요</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label>조치 및 메모</label>
            <textarea 
              className="input-field" 
              value={memo} 
              onChange={e => setMemo(e.target.value)} 
              placeholder="상담 내용 요약 및 메모" 
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
