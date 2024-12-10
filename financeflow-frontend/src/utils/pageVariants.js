// src/utils/pageVariants.js
export const pageVariants = {
    initial: {
      opacity: 0,
      x: "100vw", // Start off-screen to the right
    },
    in: {
      opacity: 1,
      x: 0, // Center of the screen
    },
    out: {
      opacity: 0,
      x: "-100vw", // Exit off-screen to the left
    },
  };
  
  export const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };
  