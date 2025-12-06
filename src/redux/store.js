import { configureStore } from "@reduxjs/toolkit";
import doctorReducer from "./doctor";

export const store = configureStore({
  reducer: {
    doctor: doctorReducer,
  },
});
