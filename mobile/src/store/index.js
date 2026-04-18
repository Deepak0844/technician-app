import { configureStore, combineReducers } from "@reduxjs/toolkit";
import api from "@services/api";
import authReducer from "@store/slices/authSlice";
import themeReducer from "@store/slices/themeSlice";

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  theme: themeReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export default store;
