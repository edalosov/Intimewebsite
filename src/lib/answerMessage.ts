export function buildAnswerMessage(params: {
  tokenId: string;
  questionText: string;
  answerText: string;
  timestamp: number;
}) {
  return [
    "Unfinished Past Gallery — Answer Submission",
    "",
    `Token: #${params.tokenId}`,
    `Question: "${params.questionText}"`,
    `Answer: "${params.answerText}"`,
    `Timestamp: ${new Date(params.timestamp).toISOString()}`,
  ].join("\n");
}
