function getOrderAvailablePaths(categories: string[]) {
  const combinations: string[][] = [[]];

  for (const category of categories) {
    const newCombinations: string[][] = [];

    for (const combination of combinations) {
      const combinationWithCategory: string[] = [...combination, category];

      newCombinations.push(combinationWithCategory);
      newCombinations.push([...combinationWithCategory, "barter=true"]);
      newCombinations.push([...combinationWithCategory, "barter=false"]);
    }

    combinations.push(...newCombinations);
  }

  return combinations
    .filter((combination) => combination.length > 0)
    .map(
      (combination) =>
        `?${combination
          .map(
            (param) =>
              `${
                param.startsWith("whereCategories") ? param : `barter=${param}`
              }`
          )
          .join("&")}`
    );
}
