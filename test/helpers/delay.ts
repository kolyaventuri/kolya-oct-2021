export const delay = async (time = 100): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });
