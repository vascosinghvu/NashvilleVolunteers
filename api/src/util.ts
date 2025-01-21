// write a method to scramble a string

export const scramble = (str: string): string => {
  const arr = str.split("")
  let scrambled = arr.sort(() => 0.5 - Math.random()).join("")

  // Check if the scrambled word is the same as the original word
  // If they are the same, scramble it again (optional)
  while (scrambled === str) {
    scrambled = arr.sort(() => 0.5 - Math.random()).join("")
  }

  return scrambled
}
