const state = {
  count: 0,
  resetDate: new Date().setHours(24, 0, 0, 0) // midnight tonight
};

export function checkLimit() {
  // Reset if past midnight
  if (Date.now() >= state.resetDate) {
    state.count = 0;
    state.resetDate = new Date().setHours(24, 0, 0, 0);
  }
  
  return {
    allowed: state.count < 3,
    remaining: Math.max(0, 3 - state.count),
    resetTime: new Date(state.resetDate)
  };
}

export function increment() {
  state.count++;
}
