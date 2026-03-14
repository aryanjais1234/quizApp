import { configureStore } from '@reduxjs/toolkit';
import quizReducer from './slices/quizSlice';
import questionReducer from './slices/questionSlice';
import materialReducer from './slices/materialSlice';

const store = configureStore({
  reducer: {
    quiz: quizReducer,
    question: questionReducer,
    material: materialReducer,
  },
});

export default store;
