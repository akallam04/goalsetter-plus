import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import client from '../../api/client'
import { dayKey, todayKey } from '../../lib/dates'
import friendlyError from '../../lib/apiError'

export const fetchGoals = createAsyncThunk('goals/list', async (params, thunkAPI) => {
  try {
    const { data } = await client.get('/goals', { params: params || {} })
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(friendlyError(err))
  }
})

export const fetchAnalytics = createAsyncThunk('goals/analytics', async (days = 90, thunkAPI) => {
  try {
    const { data } = await client.get('/goals/analytics', { params: { days } })
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(friendlyError(err))
  }
})

export const createGoal = createAsyncThunk('goals/create', async (payload, thunkAPI) => {
  try {
    const { data } = await client.post('/goals', payload)
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(friendlyError(err))
  }
})

export const updateGoal = createAsyncThunk('goals/update', async ({ id, updates }, thunkAPI) => {
  try {
    const { data } = await client.put(`/goals/${id}`, updates)
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(friendlyError(err))
  }
})

export const deleteGoal = createAsyncThunk('goals/delete', async (id, thunkAPI) => {
  try {
    await client.delete(`/goals/${id}`)
    return id
  } catch (err) {
    return thunkAPI.rejectWithValue(friendlyError(err))
  }
})

// Stats derive from the local items array: zero extra round-trips
function computeStats(items) {
  const today = todayKey()
  return {
    total: items.length,
    active: items.filter((g) => g.status === 'active').length,
    completed: items.filter((g) => g.status === 'completed').length,
    overdue: items.filter((g) => {
      if (!g.dueDate || g.status !== 'active') return false
      return dayKey(new Date(g.dueDate)) < today
    }).length,
  }
}

const goalsSlice = createSlice({
  name: 'goals',
  initialState: {
    items: [],
    listStatus: 'idle',
    createStatus: 'idle',
    error: null,
    actionError: null,
    filter: 'all',
    stats: { total: 0, active: 0, completed: 0, overdue: 0 },
    analytics: { completionsByDay: [], byCategory: [] },
    analyticsStatus: 'idle',
    // requestId -> snapshot, used to roll back a failed optimistic write
    rollback: {},
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload
    },
    clearActionError: (state) => {
      state.actionError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.listStatus = 'loading'
        state.error = null
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.items = action.payload
        state.stats = computeStats(action.payload)
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.error = action.payload
      })
      .addCase(fetchAnalytics.pending, (state) => {
        state.analyticsStatus = 'loading'
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analyticsStatus = 'succeeded'
        state.analytics = action.payload
      })
      .addCase(fetchAnalytics.rejected, (state) => {
        state.analyticsStatus = 'failed'
      })

      /* ---- Create: show the goal instantly, reconcile with the server ---- */
      .addCase(createGoal.pending, (state, action) => {
        state.createStatus = 'loading'
        state.error = null
        const draft = action.meta.arg
        state.items.unshift({
          _id: `temp-${action.meta.requestId}`,
          title: draft.title,
          description: draft.description || '',
          category: draft.category || 'General',
          priority: draft.priority || 'medium',
          status: 'active',
          dueDate: draft.dueDate || null,
          completedAt: null,
          subtasks: [],
          notes: '',
          createdAt: new Date().toISOString(),
          pending: true,
        })
        state.stats = computeStats(state.items)
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        const tempId = `temp-${action.meta.requestId}`
        const idx = state.items.findIndex((g) => g._id === tempId)
        if (idx === -1) state.items.unshift(action.payload)
        else state.items[idx] = action.payload
        state.stats = computeStats(state.items)
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.items = state.items.filter((g) => g._id !== `temp-${action.meta.requestId}`)
        state.stats = computeStats(state.items)
        state.error = action.payload
        state.actionError = action.payload
      })

      /* ---- Update: apply now, roll back if the server refuses ---- */
      .addCase(updateGoal.pending, (state, action) => {
        const { id, updates } = action.meta.arg
        const idx = state.items.findIndex((g) => g._id === id)
        if (idx === -1) return
        state.rollback[action.meta.requestId] = state.items[idx]
        const next = { ...state.items[idx], ...updates, pending: true }
        if (updates.status === 'completed' && !state.items[idx].completedAt) {
          next.completedAt = new Date().toISOString()
        } else if (updates.status === 'active') {
          next.completedAt = null
        }
        state.items[idx] = next
        state.stats = computeStats(state.items)
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        delete state.rollback[action.meta.requestId]
        state.items = state.items.map((g) => (g._id === action.payload._id ? action.payload : g))
        state.stats = computeStats(state.items)
      })
      .addCase(updateGoal.rejected, (state, action) => {
        const prev = state.rollback[action.meta.requestId]
        if (prev) {
          state.items = state.items.map((g) => (g._id === prev._id ? prev : g))
          delete state.rollback[action.meta.requestId]
        }
        state.stats = computeStats(state.items)
        state.actionError = action.payload
      })

      /* ---- Delete: remove now, restore in place if it fails ---- */
      .addCase(deleteGoal.pending, (state, action) => {
        const id = action.meta.arg
        const idx = state.items.findIndex((g) => g._id === id)
        if (idx === -1) return
        state.rollback[action.meta.requestId] = { goal: state.items[idx], idx }
        state.items.splice(idx, 1)
        state.stats = computeStats(state.items)
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        delete state.rollback[action.meta.requestId]
        state.items = state.items.filter((g) => g._id !== action.payload)
        state.stats = computeStats(state.items)
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        const snap = state.rollback[action.meta.requestId]
        if (snap) {
          state.items.splice(snap.idx, 0, snap.goal)
          delete state.rollback[action.meta.requestId]
        }
        state.stats = computeStats(state.items)
        state.actionError = action.payload
      })
  },
})

export const { setFilter, clearActionError } = goalsSlice.actions
export default goalsSlice.reducer
