import { createStyledBreakpointsTheme } from 'styled-breakpoints';

const breakpoints = {
  sm: '428px',
  md: '962px',
  lg: '1440px',
};

const theme = createStyledBreakpointsTheme({ breakpoints });

export { theme, breakpoints }