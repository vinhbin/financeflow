// src/utils/nameUtils.js
export const getFirstName = (fullName) => {
    if (typeof fullName !== 'string') return '';
  
    // Trim leading/trailing whitespace
    fullName = fullName.trim();
  
    if (fullName.length === 0) return '';
  
    // Split the name by spaces
    const nameParts = fullName.split(' ');
  
    // Extract the first part as the first name
    let firstName = nameParts[0] || '';
  
    // Find the index of the first letter in the firstName
    const firstLetterMatch = firstName.match(/[a-zA-Z]/);
    if (firstLetterMatch) {
      const firstLetterIndex = firstLetterMatch.index;
      firstName = firstName.slice(firstLetterIndex);
    } else {
      // No letters found, return as is
      return firstName;
    }
  
    // Capitalize the first letter if it's lowercase
    if (firstName.length > 0) {
      firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }
  
    return firstName;
  };
  