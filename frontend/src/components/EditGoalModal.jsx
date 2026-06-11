import { useEffect, useState } from 'react'
import { IconPlus, IconX } from './icons'

// Owns its draft state, initialized once from the goal being edited.
// Renders as a centered dialog on desktop and a bottom sheet on mobile.
export default function EditGoalModal({ goal, onClose, onSave }) {
  const [title, setTitle] = useState(goal.title || '')
  const [description, setDescription] = useState(goal.description || '')
  const [category, setCategory] = useState(goal.category || 'General')
  const [priority, setPriority] = useState(goal.priority || 'medium')
  const [status, setStatus] = useState(goal.status || 'active')
  const [dueDate, setDueDate] = useState(goal.dueDate ? String(goal.dueDate).slice(0, 10) : '')
  const [notes, setNotes] = useState(goal.notes || '')
  const [subtasks, setSubtasks] = useState(goal.subtasks ? goal.subtasks.map((s) => ({ ...s })) : [])
  const [newSubtask, setNewSubtask] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    setSubtasks((prev) => [...prev, { localId: Date.now(), text: newSubtask.trim(), completed: false }])
    setNewSubtask('')
  }

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title,
      description,
      category: category.trim() || 'General',
      priority,
      status,
      notes,
      subtasks: subtasks.map((s) => ({ _id: s._id, text: s.text, completed: s.completed })),
      dueDate: dueDate ? `${dueDate}T12:00:00` : null,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="panel-head" style={{ marginBottom: 14 }}>
          <div>
            <div className="mono-label" style={{ marginBottom: 3 }}>Edit</div>
            <div className="section-title">Goal Parameters</div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconX size={17} />
          </button>
        </div>

        <form onSubmit={submit} className="modal-body">
          <div>
            <label className="label">Objective</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          </div>

          <div>
            <label className="label">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does success look like?"
              maxLength={500}
            />
          </div>

          <div className="form-grid-2">
            <div>
              <label className="label">Category</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} maxLength={50} />
            </div>
            <div>
              <label className="label">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label className="label">Target date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Subtasks</label>
            <div style={{ display: 'grid', gap: 6, marginBottom: 8 }}>
              {subtasks.map((s, i) => (
                <div
                  key={s._id || s.localId}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '8px 11px', borderRadius: 'var(--r-xs)',
                    background: 'var(--panel-2)', border: '1px solid var(--line)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={s.completed}
                    onChange={() => setSubtasks((prev) => prev.map((t, j) => (j === i ? { ...t, completed: !t.completed } : t)))}
                    style={{ width: 15, height: 15, accentColor: 'var(--acc)', flexShrink: 0, margin: 0 }}
                  />
                  <span
                    style={{
                      flex: 1, fontSize: 13,
                      textDecoration: s.completed ? 'line-through' : 'none',
                      color: s.completed ? 'var(--dim)' : 'var(--text)',
                    }}
                  >
                    {s.text}
                  </span>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: 26, height: 26 }}
                    onClick={() => setSubtasks((prev) => prev.filter((_, j) => j !== i))}
                    aria-label="Remove subtask"
                  >
                    <IconX size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask() } }}
                placeholder="Break it into a step, press Enter"
                maxLength={200}
              />
              <button type="button" className="icon-btn" style={{ flexShrink: 0, alignSelf: 'center' }} onClick={addSubtask} aria-label="Add subtask">
                <IconPlus />
              </button>
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context, links, research..."
              rows={3}
              maxLength={5000}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', paddingTop: 2 }}>
            <button type="button" style={{ fontSize: 12.5 }} onClick={() => setDueDate('')}>
              Clear date
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '11px 26px' }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
