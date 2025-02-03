import React from 'react';
import styled from 'styled-components';
import { FaComments, FaUsers, FaRocket } from 'react-icons/fa'; // Importing icons from react-icons

// Styled container for the quote
const QuoteContainer = styled.div`
  background: linear-gradient(135deg, #f0f4f8, #e1e8ed);
  border-radius: 15px;
  padding: 30px;
  margin: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }
`;

// Styled text for the quote
const QuoteText = styled.p`
  font-size: 1.6em;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
`;

// Styled author text
const AuthorText = styled.p`
  font-size: 1.1em;
  color: #555;
  margin-top: 15px;
`;

// Decorative element
const DecorativeLine = styled.hr`
  border: none;
  height: 2px;
  background-color: #007bff; // Change to your preferred accent color
  width: 50%;
  margin: 20px auto;
`;

// Styled icon container
const IconContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
`;

// Styled icon element
const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  & > svg {
    font-size: 2em; // Adjust icon size
    color: #007bff; // Change to your preferred accent color
    margin-bottom: 10px; // Space between icon and text
    transition: transform .3s ease;

    &:hover {
      transform: scale(1.1); // Scale effect on hover
    }
  }
`;

const QuoteComponent = () => {
    return (
        <QuoteContainer>
            <QuoteText>
                True power lies in the connections we build—every conversation sparks opportunity, every relationship fuels growth, and together, we create limitless possibilities.
            </QuoteText>
            <DecorativeLine />
            <AuthorText>- Unknown</AuthorText>

            <IconContainer>
                <IconWrapper>
                    <FaComments />
                    <p>Conversations</p>
                </IconWrapper>
                <IconWrapper>
                    <FaUsers />
                    <p>Relationships</p>
                </IconWrapper>
                <IconWrapper>
                    <FaRocket />
                    <p>Growth</p>
                </IconWrapper>
            </IconContainer>
        </QuoteContainer>
    );
};

export default QuoteComponent;