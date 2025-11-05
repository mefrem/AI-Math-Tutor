# Test Execution Guide for Story 5.1

## Overview

This guide provides step-by-step instructions for executing the comprehensive problem type testing suite (Story 5.1).

## Prerequisites

1. **Application Running:**
   ```bash
   npm run dev
   ```
   - Application should be accessible at `http://localhost:3000`
   - Verify all features from Epics 1-4 are functional

2. **Environment Setup:**
   - OpenAI API key configured and working
   - Browser permissions for microphone (if testing voice)
   - Screen recording software (optional, for documentation)

3. **Test Materials:**
   - Test suite document open (`docs/testing/test-suite-5.1.md`)
   - Problem images ready (for image upload tests)
   - Note-taking tool ready

## Test Execution Procedure

### For Each Problem:

1. **Prepare the Problem:**
   - Select the problem from the test suite
   - Choose the input method (text/image/practice)
   - Prepare any images if needed

2. **Start Session:**
   - Navigate to the application
   - Use the appropriate input method
   - Submit the problem

3. **Execute Tutoring Session:**
   - Interact with the tutor naturally
   - Use drawing tools when appropriate (at least 3 sessions)
   - Observe tutor annotations (should appear in at least 5 sessions)
   - Use voice interaction when appropriate (at least 3 sessions)
   - Continue until problem is solved or reasonable stopping point

4. **Document Results:**
   - Record conversation turns
   - Note any direct answers (should be zero)
   - Document which features were used
   - Take screenshots or save conversation logs
   - Mark pass/fail for Socratic compliance

5. **Update Test Suite:**
   - Fill in conversation log
   - Mark Socratic compliance (✅ or ❌)
   - Record number of turns
   - Note features used

## Test Session Template

For each problem, document:

```
Problem: [Problem text]
Input Method: [Text/Image/Practice]
Status: [Pending/In Progress/Complete]

Conversation:
Student: [First message]
Tutor: [Response]
Student: [Next message]
Tutor: [Response]
...

Conversation Turns: [Count]
Socratic Compliance: ✅ / ❌
Direct Answers: [Count] (should be 0)
Features Used:
- Student Drawing: Yes/No
- Tutor Annotations: Yes/No
- Voice: Yes/No

Notes:
[Any observations, issues, or quality notes]
```

## Validation Checklist

After completing all 10 problems:

1. **Socratic Compliance:**
   - Review all conversations
   - Count direct answers (must be 0)
   - Verify guiding questions throughout

2. **Feature Utilization:**
   - Count student drawing sessions (must be ≥3)
   - Count tutor annotation sessions (must be ≥5)
   - Count voice interaction sessions (must be ≥3)
   - Verify all input methods tested

3. **Success Metrics:**
   - Calculate average conversation turns
   - Calculate session completion rate
   - Verify all metrics meet targets

4. **Documentation:**
   - Complete test suite document
   - Create summary report
   - Include screenshots/conversation logs

## Troubleshooting

- **If tutor gives direct answer:** Document the instance and note prompt may need adjustment
- **If features don't work:** Note the issue and continue with other features
- **If session crashes:** Restart and document the error
- **If API errors occur:** Note the error and retry if possible

## Completion Criteria

Story 5.1 is complete when:
- ✅ All 10 problems tested
- ✅ All features used as required
- ✅ 100% Socratic compliance (0 direct answers)
- ✅ Average 6+ conversation turns
- ✅ Session completion rate 80%+
- ✅ Test results fully documented

