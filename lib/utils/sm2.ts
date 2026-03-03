export type SM2Input = {
  easeFactor: number;
  interval: number;
  repetitions: number;
  quality: number; // 0-5
};

export type SM2Result = {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
};

export function applyReview(input: SM2Input): SM2Result {
  const { easeFactor, interval, repetitions, quality } = input;

  // Update ease factor (always, even on failure)
  const newEF = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    // Failed: reset repetitions, review again tomorrow
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEF);
    }
  }

  const nextReviewAt = new Date(
    Date.now() + newInterval * 24 * 60 * 60 * 1000
  );

  return {
    easeFactor: newEF,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewAt,
  };
}
