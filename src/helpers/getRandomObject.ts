const getRandomObject = (data: any) => {
  data[Math.floor(Math.random() * data.length)];
};

export { getRandomObject };
