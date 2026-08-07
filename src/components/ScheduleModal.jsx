import React, { useState, useEffect } from 'react'

const ScheduleModal = ({ onClose, onSave, initialData }) => {
  const [hour, setHour] = useState('09')
  const [minute, setMinute] = useState('00')
  const [endHour, setEndHour] = useState('10')
  const [endMinute, setEndMinute] = useState('00')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('진행중')
  const [memo, setMemo] = useState('')

  const [isRecurring, setIsRecurring] = useState(false)
  const getLocalDateString = () => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  }

  const [startDate, setStartDate] = useState(getLocalDateString())
  const [endDate, setEndDate] = useState(getLocalDateString())
  const [repeatType, setRepeatType] = useState('daily') // 'daily', 'weekly'
  const [repeatDays, setRepeatDays] = useState([]) // 0=Sun, 1=Mon...

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
      if (initialData.endTime) {
        setEndHour(initialData.endTime.split(':')[0])
        setEndMinute(initialData.endTime.split(':')[1] || '00')
      } else {
        // 기본값: 시작시간 + 1시간
        let nextHour = parseInt(initialData.hour || (initialData.time ? initialData.time.split(':')[0] : '09')) + 1;
        if (nextHour > 23) nextHour = 23;
        setEndHour(nextHour.toString().padStart(2, '0'));
        setEndMinute(initialData.time ? (initialData.time.split(':')[1] || '00') : '00');
      }
      setContent(initialData.content || '')
      setStatus(initialData.status || '진행중')
      setMemo(initialData.memo || '')
      
      if (initialData.recurringData) {
        setIsRecurring(true)
        setStartDate(initialData.recurringData.startDate || getLocalDateString())
        setEndDate(initialData.recurringData.endDate || getLocalDateString())
        setRepeatType(initialData.recurringData.repeatType || 'daily')
        setRepeatDays(initialData.recurringData.repeatDays || [])
      }
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 유효성 검사
    if (isRecurring) {
      if (startDate > endDate) {
        alert('종료일은 시작일보다 빠를 수 없습니다.')
        return
      }
      if (repeatType === 'weekly' && repeatDays.length === 0) {
        alert('반복할 요일을 선택해주세요.')
        return
      }
    }

    const dataToSave = {
      ...initialData,
      time: `${hour}:${minute}`,
      endTime: `${endHour}:${endMinute}`,
      content,
      status,
      memo
    }

    if (isRecurring) {
      dataToSave.recurringData = {
        startDate,
        endDate,
        repeatType,
        repeatDays
      }
    } else {
      // 반복 일정을 일반 일정으로 변경할 경우 처리
      dataToSave.recurringData = null; 
    }

    onSave(dataToSave)
  }

  const handleDayToggle = (dayIndex) => {
    setRepeatDays(prev => 
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    )
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
            <label>시간 설정</label>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
              <span style={{fontWeight: 'bold', fontSize: '0.9rem'}}>시작: </span>
              <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{hour} : </span>
              <select 
                className="input-field" 
                value={minute} 
                onChange={e => setMinute(e.target.value)}
                style={{width: '80px'}}
              >
                <option value="00">00분</option>
                <option value="10">10분</option>
                <option value="20">20분</option>
                <option value="30">30분</option>
                <option value="40">40분</option>
                <option value="50">50분</option>
              </select>

              <span style={{fontWeight: 'bold', fontSize: '0.9rem', marginLeft: '10px'}}>종료: </span>
              <select
                className="input-field"
                value={endHour}
                onChange={e => setEndHour(e.target.value)}
                style={{width: '70px', padding: '8px 4px'}}
              >
                {Array.from({ length: 18 }, (_, i) => i + 6).map(h => {
                  const hStr = h.toString().padStart(2, '0');
                  return <option key={hStr} value={hStr}>{hStr}시</option>
                })}
              </select>
              <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}> : </span>
              <select 
                className="input-field" 
                value={endMinute} 
                onChange={e => setEndMinute(e.target.value)}
                style={{width: '80px'}}
              >
                <option value="00">00분</option>
                <option value="10">10분</option>
                <option value="20">20분</option>
                <option value="30">30분</option>
                <option value="40">40분</option>
                <option value="50">50분</option>
              </select>

              <label style={{display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', cursor: 'pointer'}}>
                <input 
                  type="checkbox" 
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
                <span style={{fontWeight: 'normal', fontSize: '0.9rem', color: '#555'}}>기간/반복 설정</span>
              </label>
            </div>
          </div>

          {isRecurring && (
            <div className="modal-form-group" style={{backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px', border: '1px solid #eee'}}>
              <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <input type="date" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} style={{width: '130px', padding: '4px'}}/>
                  <span>~</span>
                  <input type="date" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} style={{width: '130px', padding: '4px'}}/>
                </div>
                
                <div style={{display: 'flex', gap: '8px'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.9rem'}}>
                    <input type="radio" name="repeatType" value="daily" checked={repeatType === 'daily'} onChange={() => setRepeatType('daily')} />
                    일반복
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.9rem'}}>
                    <input type="radio" name="repeatType" value="weekly" checked={repeatType === 'weekly'} onChange={() => setRepeatType('weekly')} />
                    요일반복
                  </label>
                </div>
              </div>

              {repeatType === 'weekly' && (
                <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                  {[
                    {label: '월', val: 1}, {label: '화', val: 2}, {label: '수', val: 3}, 
                    {label: '목', val: 4}, {label: '금', val: 5}, {label: '토', val: 6}, {label: '일', val: 0}
                  ].map(day => (
                    <label key={day.val} style={{display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer', fontSize: '0.9rem'}}>
                      <input 
                        type="checkbox" 
                        checked={repeatDays.includes(day.val)}
                        onChange={() => handleDayToggle(day.val)}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          
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
            <label>메모</label>
            <textarea 
              className="input-field" 
              value={memo} 
              onChange={e => setMemo(e.target.value)} 
              placeholder="" 
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
