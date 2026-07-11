"""
Answer scoring - lightweight NLP heuristic scoring for interview answers.
Evaluates answer length, relevance (keyword overlap with the question),
and structure/clarity signals to produce a 0-100 score with feedback.

This avoids depending on paid LLM APIs and runs fully offline, which
keeps the project self-contained and free to run for submission/demo.
"""
import re

FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "actually", "sort of"]
STRUCTURE_SIGNALS = ["first", "second", "for example", "because", "therefore", "situation", "task", "action", "result"]


def score_answer(question, answer_text):
    if not answer_text or not answer_text.strip():
        return {"score": 0, "feedback": "No answer was provided."}

    text = answer_text.strip()
    words = re.findall(r"\w+", text.lower())
    word_count = len(words)

    score = 30  # baseline for attempting the question

    # Length signal - very short or extremely long answers score lower
    if 40 <= word_count <= 200:
        score += 25
    elif 20 <= word_count < 40 or 200 < word_count <= 300:
        score += 15
    else:
        score += 5

    # Relevance signal - overlap between question keywords and answer
    question_words = set(re.findall(r"\w+", question.lower())) - {"the", "a", "an", "is", "of", "to", "you", "your"}
    overlap = len(question_words.intersection(words))
    score += min(20, overlap * 4)

    # Structure signal - use of examples/reasoning connectors
    structure_hits = sum(1 for signal in STRUCTURE_SIGNALS if signal in text.lower())
    score += min(15, structure_hits * 5)

    # Filler word penalty
    filler_hits = sum(text.lower().count(f) for f in FILLER_WORDS)
    score -= min(15, filler_hits * 3)

    score = max(0, min(100, round(score)))

    # Feedback generation
    feedback_parts = []
    if word_count < 20:
        feedback_parts.append("Your answer was quite brief — try to elaborate with more detail and examples.")
    if structure_hits == 0:
        feedback_parts.append("Consider structuring your answer with a clear example or reasoning (e.g. STAR method).")
    if filler_hits > 2:
        feedback_parts.append("Watch out for filler words — they can make you sound less confident.")
    if overlap < 2:
        feedback_parts.append("Try to directly address the key terms in the question.")
    if not feedback_parts:
        feedback_parts.append("Clear, well-structured, and relevant answer. Good job.")

    return {"score": score, "feedback": " ".join(feedback_parts)}
