import React, { useState } from "react";
import styled from "styled-components";
import LogoImage from "../utils/Images/Logo.png";
import AuthImage from "../utils/Images/AuthImage.jpg";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";



/*styled.div is a function provided by the styled-components library in React. It allows you to create a styled HTML div element with custom CSS. The main purpose of styled.div is to write CSS directly within your JavaScript code to style React components, promoting a more component-centric approach to styling.

Purpose and Usage
Component-Based Styling: styled.div helps you create self-contained, reusable components with their own styles.
Scoped CSS: Styles defined using styled-components are scoped to the component, preventing style clashes and making maintenance easier.
Dynamic Styling: You can use JavaScript to dynamically change styles based on props or state. */

const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  background: ${({ theme }) => theme.bg};
  @media (max-width: 700px) {
    flex-direction: column;
  }
`;
/*flex-1 : This style makes the Left component take up one part of the available space in a flex container. In other words, it will grow to fill the available space relative to other flex items. */
const Left = styled.div`
  flex: 1;
  
  position: relative;
  @media (max-width: 700px) {
    display: none;
  }
`;
/*position:relative means position relative to its normal position so you can do left,right,top,buttom shift relative to its position. */
const Logo = styled.img`
  position: absolute;
  width: 70px;
  top: 40px;
  left: 60px;
  z-index: 10;
`;
const Image = styled.img`
  position: relative;
  height: 100%;
  width: 100%;
  object-fit: cover;
`;

const Right = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 40px;
  gap: 16px;
  align-items: center;
  justify-content: center;
`;

const Text = styled.div`
  font-size: 16px;
  text-align: center;
  color: ${({ theme }) => theme.text_secondary};
  margin-top: 16px;
  @media (max-width: 400px) {
    font-size: 14px;
  }
`;
const TextButton = styled.span`
  color: ${({ theme }) => theme.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
`;



/*Here In Authentication we have a login useState which basically stored as false by default.
so if we open it will by default show the the login page .After that if we need to register a new account we will click sign up buttom and it will set the login as false and now it will show the Register Page. Then in Register Page if we click signIn buttom it will make the login useState again false which show login Page.  */

const Authentication = () => {
  const [login, setLogin] = useState(false);
  return (
    <Container>
      {/*Image part */}
      <Left>
        <Logo src={LogoImage} />
        <Image src={AuthImage} />
      </Left>

      {/* */}
      <Right>
        {!login ? (
          <>
            <SignIn /> {/*sign in component */}
            <Text>
              Don't have an account?{" "}
              <TextButton onClick={() => setLogin(true)}>SignUp</TextButton>
            </Text>
          </>
        ) : (
          <>
            <SignUp />
            <Text>
              Already have an account?{" "}
              <TextButton onClick={() => setLogin(false)}>SignIn</TextButton>
            </Text>
          </>
        )}
      </Right>
    </Container>
  );
};

export default Authentication;
