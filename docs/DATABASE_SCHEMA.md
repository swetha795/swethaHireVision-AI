# Database Schema — MongoDB (Mongoose)

## `users`
| Field        | Type     | Notes                          |
|--------------|----------|---------------------------------|
| name         | String   | required                       |
| email        | String   | required, unique               |
| password     | String   | required, hashed with bcrypt   |
| targetRole   | String   | default: "Software Engineer"   |
| createdAt / updatedAt | Date | auto (timestamps)     |

## `resumes`
| Field             | Type     | Notes                                |
|-------------------|----------|----------------------------------------|
| user              | ObjectId | ref: User                             |
| fileName          | String   | original uploaded file name           |
| filePath          | String   | server storage path                   |
| rawText           | String   | extracted text (capped at 3000 chars) |
| skills            | [String] | detected technical skills             |
| detectedRole      | String   | target role used for analysis         |
| experienceYears   | Number   | estimated from resume text            |
| atsScore          | Number   | 0–100                                  |
| keywordMatch      | Number   | 0–100, % match vs target role         |
| strengths         | [String] | generated strengths                   |
| improvementAreas  | [String] | generated suggestions                 |

## `questions`
| Field      | Type   | Notes                                              |
|------------|--------|-----------------------------------------------------|
| text       | String | question text                                      |
| category   | String | technical / behavioral / hr / situational           |
| role       | String | e.g. "Frontend Developer", or "General"             |
| difficulty | String | easy / medium / hard                                |

## `interviews`
| Field                | Type     | Notes                                     |
|----------------------|----------|--------------------------------------------|
| user                 | ObjectId | ref: User                                 |
| role                 | String   | role interviewed for                      |
| answers              | [Answer] | embedded sub-documents (see below)        |
| overallScore         | Number   | weighted composite score                  |
| communicationScore   | Number   | average of per-answer scores              |
| confidenceScore      | Number   | derived from emotion breakdowns           |
| technicalScore       | Number   | average of technical-category answers     |
| personalizedFeedback | [String] | rule-based feedback generated on completion |
| status               | String   | in-progress / completed                   |

### Embedded `Answer` sub-document
| Field            | Type   | Notes                                       |
|------------------|--------|-----------------------------------------------|
| question         | String |                                                |
| category         | String |                                                |
| userAnswerText   | String |                                                |
| answerScore      | Number | 0–100, from NLP heuristic scorer              |
| dominantEmotion  | String | confident / neutral / nervous / happy         |
| emotionBreakdown | Object | { confident, neutral, nervous, happy } (%)    |
| feedback         | String | per-answer feedback                           |
