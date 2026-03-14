import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTeacherQuizzes } from '../../api/api';

// Async thunks (to be populated when wiring up API calls)
export const fetchQuizzes = createAsyncThunk(
  'quiz/fetchQuizzes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTeacherQuizzes();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch quizzes');
    }
  }
);

const initialState = {
  // Raw data as received from the backend — never mutated by UI actions
  originalFromBackend: [],

  // UI-only state: loading flags, errors, selected item, filter state
  uiState: {
    loading: false,
    error: null,
    selectedQuizId: null,
    searchQuery: '',
    activeFilter: 'all',
  },

  // Working copy the user is editing before saving back to the backend
  modifiedState: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    // UI state actions
    setSelectedQuiz(state, action) {
      state.uiState.selectedQuizId = action.payload;
    },
    setSearchQuery(state, action) {
      state.uiState.searchQuery = action.payload;
    },
    setActiveFilter(state, action) {
      state.uiState.activeFilter = action.payload;
    },
    clearError(state) {
      state.uiState.error = null;
    },

    // Modified state actions
    startEditingQuiz(state, action) {
      const quiz = state.originalFromBackend.find((q) => q.id === action.payload);
      state.modifiedState = quiz ? { ...quiz } : null;
    },
    updateModifiedQuiz(state, action) {
      if (state.modifiedState) {
        state.modifiedState = { ...state.modifiedState, ...action.payload };
      }
    },
    cancelEditingQuiz(state) {
      state.modifiedState = null;
    },

    // Direct backend update (optimistic or after confirmation)
    updateQuizInStore(state, action) {
      const index = state.originalFromBackend.findIndex((q) => q.id === action.payload.id);
      if (index !== -1) {
        state.originalFromBackend[index] = action.payload;
      }
      state.modifiedState = null;
    },
    removeQuizFromStore(state, action) {
      state.originalFromBackend = state.originalFromBackend.filter(
        (q) => q.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.uiState.loading = true;
        state.uiState.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.uiState.loading = false;
        state.originalFromBackend = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.uiState.loading = false;
        state.uiState.error = action.payload;
      });
  },
});

export const {
  setSelectedQuiz,
  setSearchQuery,
  setActiveFilter,
  clearError,
  startEditingQuiz,
  updateModifiedQuiz,
  cancelEditingQuiz,
  updateQuizInStore,
  removeQuizFromStore,
} = quizSlice.actions;

// Selectors
export const selectQuizzes = (state) => state.quiz.originalFromBackend;
export const selectQuizUiState = (state) => state.quiz.uiState;
export const selectModifiedQuiz = (state) => state.quiz.modifiedState;

export default quizSlice.reducer;
