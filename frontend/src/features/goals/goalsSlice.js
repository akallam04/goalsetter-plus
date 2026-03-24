import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import client from '../../api/client'

export const fetchGoals = createAsyncThunk('goals/list', async (params, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token
    const { data } = await client.get('/goals', {
      params: params || {},
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const fetchStats = createAsyncThunk('goals/stats', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token
    const { data } = await client.get('/goals/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const fetchAnalytics = createAsyncThunk('goals/analytics', async (days = 30, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token
    const { data } = await client.get('/goals/analytics', {
      params: { days },
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const createGoal = createAsyncThunk('goals/create', async (payload, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token
    const { data } = await client.post('/goals', payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const updateGoal = createAsyncThunk('goals/update', async ({ id, updates }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token
    const { data } = await client.put(`/goals/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

export const deleteGoal = createAsyncThunk('goals/delete', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token
    await client.delete(`/goals/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return id
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message)
  }
})

const MST = { timeZone: 'America/Denver' }
const todayMST = () => new Date().toLocaleDateString('en-CA', MST)

function computeStats(items) {
  const today = todayMST()
  return {
    total: items.length,
    active: items.filter((g) => g.status === 'active').length,
    completed: items.filter((g) => g.status === 'completed').length,
    overdue: items.filter((g) => {
      if (!g.dueDate || g.status !== 'active') return false
      return new Date(g.dueDate).toLocaleDateString('en-CA', MST) < today
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
    statsStatus: 'idle',
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
        state.statsStatus = 'succeeded'
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.error = action.payload
      })
      .addCase(fetchStats.pending, (state) => {
        state.statsStatus = 'loading'
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.statsStatus = 'succeeded'
        state.stats = action.payload
      })
      .addCase(fetchStats.rejected, (state) => {
        state.statsStatus = 'failed'
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
