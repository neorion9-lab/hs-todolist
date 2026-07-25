import React, { useState, useEffect } from 'react'

const MinwonModal = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    target: '학부모',
    channel: '전화',
    content: '',
    status: '진행중',
    memo: ''
  })
  
  const [hour, setHour] = useState('09')
  const [minute, setMinute] = useState('00')

  useEffect(() => {
    if (initialData?.minwon_detail) {
      setFormData(initialData.minwon_detail)
    } else if (initialData?.defaultTitle) {
      setFormData(prev => ({ ...prev, title: initialData.defaultTitle }))
    }

    if (initialData?.hour) {
      setHour(initialData.hour)
    } else if (initialData?.minwon_detail?.time) {
      setHour(initialData.minwon_detail.time.split(':')[0])
    }

    if (initialData?.time) {
      setMinute(initialData.time.split(':')[1] || '00')
    } else if (initialData?.minwon_detail?.time) {
      setMinute(initialData.minwon_detail.time.split(':')[1] || '00')
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('민원/상담명을 입력해주세요.')
      return
    }
    
    onSave({
      ...formData,
      time: `${hour}:${minute}`
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>민원 상세 기록</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
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
            <label>민원/상담명</label>
            <input name="title" className="input-field" value={formData.title} onChange={handleChange} placeholder="예: 돌봄강사-초과근무" />
          </div>
          
          <div style={{display: 'flex', gap: '10px'}}>
            <div className="modal-form-group" style={{flex: 1}}>
              <label>대상 구분</label>
              <select name="target" className="input-field" value={formData.target} onChange={handleChange}>
                <option>학부모</option>
                <option>학생</option>
                <option>교직원</option>
                <option>외부 민원인</option>
              </select>
            </div>
            <div className="modal-form-group" style={{flex: 1}}>
              <label>접수/진행 채널</label>
              <select name="channel" className="input-field" value={formData.channel} onChange={handleChange}>
                <option>전화</option>
                <option>방문</option>
                <option>학교알리미·하이톡</option>
                <option>서면</option>
              </select>
            </div>
          </div>
          
          <div className="modal-form-group">
            <label>상세 내용</label>
            <textarea name="content" className="input-field" value={formData.content} onChange={handleChange} placeholder="민원 요지 및 수집된 정보" />
          </div>

          <div className="modal-form-group">
            <label>처리 결과</label>
            <select name="status" className="input-field" value={formData.status} onChange={handleChange}>
              <option>진행중</option>
              <option>완료</option>
              <option>후속조치 필요</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label>조치 및 메모</label>
            <textarea name="memo" className="input-field" value={formData.memo} onChange={handleChange} placeholder="상담 내용 요약 및 메모" />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
            <button type="submit" className="btn btn-primary">저장</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MinwonModal
