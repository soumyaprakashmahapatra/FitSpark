//This code is for managing user authentication state in a React application using Redux Toolkit. Here’s a simple breakdown:
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
};
//Sets up the initial state for the user. At first, there is no user logged in (currentUser is null).


export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.currentUser = action.payload.user;
      localStorage.setItem("fittrack-app-token", action.payload.token);
    },
    logout: (state) => {
      state.currentUser = null;
      localStorage.removeItem("fitttrack-app-token");
    },
  },
});

/*createSlice: A function from Redux Toolkit to create a slice of the Redux state.
name: This is the name of the slice, here it’s "user".
initialState: The starting state of this slice (i.e., no user logged in initially).
reducers: Functions that handle changes to the state:
loginSuccess: When a user logs in successfully:
It sets the currentUser in the state to the user data provided (action.payload.user).
It saves a token to localStorage to remember the user across sessions.
logout: When a user logs out:
It sets currentUser to null (indicating no user is logged in).
It removes the token from localStorage. */





export const { loginSuccess, logout } = userSlice.actions;

export default userSlice.reducer;
