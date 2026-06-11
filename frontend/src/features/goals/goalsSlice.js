import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import client from '../../api/client'
import { dayKey, todayKey } from '../../lib/dates'

export const fetchGoals = createAsyncThunk('goals/list', async (params, thunkAPI) => {
  try {
    const { data } = await client.get('/goals', { params: params || {} })
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const fetchAnalytics = createAsyncThunk('goals/analytics', async (days = 90, thunkAPI) => {
  try {
    const { data } = await client.get('/goals/analytics', { params: { days } })
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const createGoal = createAsyncThunk('goals/create', async (payload, thunkAPI) => {
  try {
    const { data } = await client.post('/goals', payload)
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const updateGoal = createAsyncThunk('goals/update', async ({ id, updates }, thunkAPI) => {
  try {
    const { data } = await client.put(`/goals/${id}`, updates)
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const deleteGoal = createAsyncThunk('goals/delete', async (id, thunkAPI) => {
  try {
    await client.delete(`/goals/${id}`)
    return id
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
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
    filter: 'all',
    stats: { total: 0, active: 0, completed: 0, overdue: 0 },
    analytics: { completionsByDay: [], byCategory: [] },
    analyticsStatus: 'idle',
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload
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
      .addCase(createGoal.pending, (state) => {
        state.createStatus = 'loading'
        state.error = null
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        state.items = [action.payload, ...state.items]
        state.stats = computeStats(state.items)
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.error = action.payload
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.items = state.items.map((g) => (g._id === action.payload._id ? action.payload : g))
        state.stats = computeStats(state.items)
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g._id !== action.payload)
        state.stats = computeStats(state.items)
      })
  },
})

export const { setFilter } = goalsSlice.actions
export default goalsSlice.reducer
