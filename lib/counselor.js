// Counselor logic lives on the server so the AI key (later) never reaches the browser.
// TODO (next step): replace this rule-based reply with a Gemini API call using
// GEMINI_API_KEY from a server-only environment variable.
export function counselorReply(text, profile) {
  const lower = text.toLowerCase()
  if (lower.includes('skill')) return 'Based on your profile, start with Python, data structures, SQL, and machine learning fundamentals. Build one small project after each skill so your learning becomes visible.'
  if (lower.includes('data')) return 'AI/ML Engineering and Data Science overlap, but they solve different problems. If you enjoy building systems and experimenting with models, AI/ML may fit. If you enjoy patterns, questions, and decisions, Data Science could be a strong path.'
  if (lower.includes('plan') || lower.includes('6')) return 'For the next six months: strengthen Python, practise data structures, learn SQL, study core ML concepts, and ship two portfolio projects. Reserve one week each month for reflection and feedback.'
  const interests = profile?.interests?.slice(0, 2).join(' and ') || 'technology'
  const goal = profile?.goals?.[0]?.toLowerCase() || 'grow with confidence'
  return `Based on your interests in ${interests} and your goal to ${goal}, AI/ML Engineering could be a strong direction. Start with Python, data structures, mathematics for ML, and one small project.`
}
