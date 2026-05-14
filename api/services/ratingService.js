const calculateExpectedScore = (userRating, averageRating) => {
  return 1 / (1 + Math.pow(10, (averageRating - userRating) / 400));
};

exports.calculateDVWRS = (userStats, contestData) => {
  const R_old = Number(userStats.currentRating) || 0;
  const contests = Number(userStats.contestCount) || 0;
  const recentSolves = Number(userStats.recentPracticeSolves) || 0;
  
  const V_user = Math.max(1.0, Number(userStats.volatility) || 1.0); 
  const totalParticipants = Math.max(1, Number(contestData.totalParticipants) || 1);
  const avgRating = Number(contestData.averageRating) || 0;
  const rank = Math.max(1, Math.min(Number(contestData.actualRank) || 1, totalParticipants));

  const K = 40.0;
  const MAX_DROP = -30.0;
  const PRACTICE_SHIELD_THRESHOLD = 5;
  const PRACTICE_SHIELD_BONUS = 3.0;
  const ATCODER_VETERAN_THRESHOLD = 10;

  const E = calculateExpectedScore(R_old, avgRating);

  let S_actual = 1.0;
  if (totalParticipants > 1) {
    S_actual = (totalParticipants - rank) / (totalParticipants - 1);
  }

  const W_consistency = contests < ATCODER_VETERAN_THRESHOLD ? 0.5 : 1.0;

  const B = recentSolves >= PRACTICE_SHIELD_THRESHOLD ? PRACTICE_SHIELD_BONUS : 0.0;

  let ratingDelta = (K / V_user) * (S_actual - E) * W_consistency;
  
  if (ratingDelta < MAX_DROP) {
    ratingDelta = MAX_DROP;
  }

  const unroundedNewRating = R_old + ratingDelta + B;

  return Math.max(0, Math.round(unroundedNewRating));
};
