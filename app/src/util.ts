// Calculates the score boost the user got from guessing correctly

export const calcScore = (
  prevScore: number,
  time: number,
  hint: boolean
): number => {
  let score = 0

  // Calculate the base score based on time
  if (time < 10) {
    score = 10
  } else if (time >= 10 && time <= 20) {
    score = 8
  } else {
    score = 6
  }

  // If a hint was used, divide the score by 2
  if (hint) {
    score /= 2
  }

  return score + prevScore
}
