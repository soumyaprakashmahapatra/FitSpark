import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
/*configureStore: Sets up the Redux store with the persistedReducer.
middleware: Configures the store's middleware. The serializableCheck option is adjusted to ignore actions related to redux-persist, which can handle non-serializable data like localStorage. */


import userReducer from "./reducers/userSlice";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

/*Setup: The code sets up a Redux store with persistence using redux-persist.
Persist Config: Defines how and where to store the Redux state.
Reducers: Combines reducers and enhances them for persistence.
Store: Configures the store with middleware and the persisted reducer.
Persistor: Manages state rehydration and persistence.
This setup ensures that the Redux state (e.g., user authentication data) is saved to localStorage and restored when the application is reloaded.
 */

/*The <PersistGate> component is part of the redux-persist library and is used to handle the rehydration of the Redux store's state. Here's a detailed explanation of its purpose */
// Rehydration in the context of Redux and redux-persist refers to the process of restoring the previously saved state of the application from storage (e.g., localStorage, sessionStorage, or another storage engine) back into the Redux store when the application is restarted.

export const persistor = persistStore(store);
