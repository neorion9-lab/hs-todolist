import React, { useState } from 'react'

const SummaryGrid = ({ summary, updateSummary, openMinwonModal, openScheduleModal, userSettings }) => {
  const hiddenCategories = userSettings?.hiddenCategories || []
  const customLabels = userSettings?.customLabels || {}
  const isVisible = (id) => !hiddenCategories.includes(id)
  const getLabel = (id, defaultLabel) => customLabels[id] !== undefined ? customLabels[id] : defaultLabel;

  const handleAdd = (zone, category) => {
    const currentList = summary[zone][category] || []
    if (currentList.length >= 5) {
      alert('최대 5개까지만 입력할 수 있습니다.')
      return
    }
    
    // 민원 영역이면 민원 모달, 아니면 일정 모달 오픈
    if (category === 'minwon') {
      openMinwonModal({ zone, category })
    } else {
      openScheduleModal({ zone, category })
    }
  }

  const handleDelete = (zone, category, index) => {
    const currentList = summary[zone][category]
    const itemToDelete = currentList[index]
    
    if (itemToDelete && itemToDelete.isRecurring) {
      alert('반복 일정은 타임라인에서 수정/삭제해주세요.')
      return
    }

    const newList = [...currentList]
    newList.splice(index, 1)
    
    // updateSummary에는 일반 일정(문자열 또는 일반 객체)만 전달되도록 필터링
    const itemsToSave = newList.filter(i => !i.isRecurring).map(i => i.originalItem || i)
    updateSummary(zone, category, itemsToSave)
  }

  return (
    <div className="grid-container">
      {/* 학교 요약 */}
      <div className="school-zone">
        <h2 className="section-title">학교 (School)</h2>
        <div className="grid-row">
          {isVisible('school_main') && <Column zone="school" category="main" title={getLabel('school_main', '주요일정')} summary={summary} handleAdd={handleAdd} handleDelete={handleDelete} />}
          {isVisible('school_gongmun') && <Column zone="school" category="gongmun" title={getLabel('school_gongmun', '처리업무(공문)')} summary={summary} handleAdd={handleAdd} handleDelete={handleDelete} />}
          {isVisible('school_minwon') && <Column zone="school" category="minwon" title={getLabel('school_minwon', '처리업무(민원)')} summary={summary} handleAdd={handleAdd} handleDelete={handleDelete} />}
        </div>
      </div>

      {/* 개인 요약 */}
      <div className="personal-zone">
        <h2 className="section-title">개인 (Personal)</h2>
        <div className="grid-row">
          {isVisible('personal_main') && <Column zone="personal" category="main" title={getLabel('personal_main', '주요일정')} summary={summary} handleAdd={handleAdd} handleDelete={handleDelete} />}
          {isVisible('personal_health_diet') && <Column zone="personal" category="health_diet" title={getLabel('personal_health_diet', '건강(식사)')} summary={summary} handleAdd={handleAdd} handleDelete={handleDelete} />}
          {isVisible('personal_health_exercise') && <Column zone="personal" category="health_exercise" title={getLabel('personal_health_exercise', '건강(운동)')} summary={summary} handleAdd={handleAdd} handleDelete={handleDelete} />}
          {isVisible('personal_gratitude') && <Column zone="personal" category="gratitude" title={getLabel('personal_gratitude', '감사일기')} summary={summary} handleAdd={handleAdd} handleDelete={handleDelete} />}
        </div>
      </div>
    </div>
  )
}

const Column = ({ zone, category, title, summary, handleAdd, handleDelete }) => {
  const items = summary[zone][category] || []
  return (
    <div className={`grid-col ${category}-col`}>
      <div className="col-header">{title}</div>
      <div className="col-content">
        {items.map((item, idx) => (
          <div key={idx} className="item-row" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
            <span>{idx + 1}.</span>
            <span style={{flex: 1}}>
              {item.isRecurring && <span style={{fontSize: '0.8em', backgroundColor: '#e0f7fa', color: '#006064', padding: '2px 4px', borderRadius: '4px', marginRight: '4px'}}>반복</span>}
              {item.title || item.content || item.originalItem || item}
            </span>
            <button onClick={() => handleDelete(zone, category, idx)} style={{border: 'none', background: 'transparent', cursor: 'pointer', color: '#999'}}>X</button>
          </div>
        ))}
        {items.length < 5 && (
          <div 
            className="add-btn" 
            onClick={() => handleAdd(zone, category)}
            style={{ padding: '8px', border: '1px dashed #ccc', borderRadius: '4px', textAlign: 'center', cursor: 'pointer', color: '#999', marginTop: '4px' }}
          >
            + 추가
          </div>
        )}
      </div>
    </div>
  )
}

export default SummaryGrid
