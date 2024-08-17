import { ThemeProvider, styled } from "styled-components";
import { lightTheme } from "./utils/Themes";
/*This is a theme object that defines the light theme of the application. */
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Authentication from "./pages/Authentication";
import { useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
/*ThemeProvider and styled from styled-components: These are used for styling the application. ThemeProvider allows the application to use theming, while styled is used to create styled components.
lightTheme from ./utils/Themes: This is a theme object that defines the light theme of the application.
BrowserRouter, Route, and Routes from react-router-dom: These are used for client-side routing. BrowserRouter is the router component, and Route and Routes define the individual routes.
Authentication from ./pages/Authentication: This component handles the authentication (login/register) pages.
useState from react: This hook is used for managing state within the components.
useSelector from react-redux: This hook allows the component to access the Redux store state. */

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  overflow-x: hidden;
  overflow-y: hidden;
  transition: all 0.2s ease;
`;

function App() {
  const { currentUser } = useSelector((state) => state.user);
  /*xtracts the currentUser from the Redux store's user state.
 */
  
  return (
    <ThemeProvider theme={lightTheme}>
      <BrowserRouter>
        {currentUser ? (
          <Container>
            <Navbar currentUser={currentUser} />
            <Routes>
              <Route path="/" exact element={<Dashboard />} />
              <Route path="/workouts" exact element={<Workouts />} />
            </Routes>
          </Container>
        ) : (
          <Container>
            <Authentication />
          </Container>
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

/*BrowserRouter, Route, and Routes from react-router-dom: These are used for client-side routing. BrowserRouter is the router component, and Route and Routes define the individual routes. */
