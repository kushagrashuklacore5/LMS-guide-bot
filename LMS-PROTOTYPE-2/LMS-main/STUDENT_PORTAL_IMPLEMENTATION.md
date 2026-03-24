# Student Portal - Features to Implement

## Overview
This document outlines the features needed for the student portal to complete the LMS functionality.

---

## 1. **Student Course Materials Display** (Critical)

### Location
`client/src/pages/student/CourseViewer.jsx` - Extend existing file

### Features to Add:

#### A. Materials by Week
```jsx
// Display materials grouped by week
- Week 1: Introduction
  ├── 📹 Lecture Video (YouTube link)
  ├── 📄 Handout.pdf (Download)
  └── ✅ Mark as Complete Button

- Week 2: Advanced Topics
  ├── 📹 Tutorial Video
  ├── 📄 Notes.pdf
  └── ✅ Mark as Complete Button
```

#### B. Material Viewing Options
- **Video Links**: Open in new tab or embed iframe
- **PDFs**: Download button or inline viewer
- **Local Videos**: Play with HTML5 video player
- **Local PDFs**: Download button

#### C. Mark as Complete Functionality
```javascript
// When student clicks "Mark as Complete" for a material/week
POST /api/progress/mark-completed
{
  studentId: xxx,
  courseId: xxx,
  weekId: xxx,  // optional
  materialId: xxx  // optional
}

// Response updates:
- Progress percentage
- Dashboard progress bar
- Completed materials count
```

#### D. Progress Reflection
```javascript
// After marking complete:
GET /api/progress/:courseId
// Returns:
{
  completionPercentage: 45,
  completedChapters: 5,
  totalChapters: 12,
  progress: [
    { materialId, completed: true, completedAt }
  ]
}
```

### Implementation Steps:
1. Create `MaterialsList` component
2. Add week-based filtering
3. Implement material type handlers
4. Add mark complete API call
5. Update progress state after marking

---

## 2. **Student Assessment Taking** (Critical)

### Location
Create: `client/src/pages/student/TakeAssessment.jsx`

### Features:

#### A. Assessment Display
```jsx
Assessment: Mid-term Quiz
Duration: 60 minutes
Questions: 15
Total Marks: 50
Status: Available (Unlocked)

Start Assessment Button
```

#### B. Assessment Locking Logic
```javascript
// Assessment is locked if:
1. Current time < startTime ❌ LOCKED
2. Current time > endTime ❌ LOCKED
3. Student already attempted ❌ LOCKED (can view marks)
4. startTime < Current time < endTime ✅ UNLOCKED

// Display accordingly:
"Assessment not started yet" / "Assessment closed" / "You already took this assessment"
```

#### C. Question Display
```jsx
Question 1 of 15

Q: What is the capital of France?
A) London
B) Paris ✅ (selected)
C) Berlin
D) Madrid

Navigation:
[Previous] Q1/15 [Next]
[Submit Assessment] (at the end)
```

#### D. Timer Implementation
```javascript
// Timer in top-right of screen
Duration: 60 minutes
Countdown: 59:45

// Color change when:
- < 5 minutes left: RED
- < 10 minutes left: ORANGE
- Normal: GREEN

// On time expired:
- Auto-submit assessment
- Lock all inputs
- Show "Time Expired"
```

#### E. Assessment Submission
```javascript
// Student clicks "Submit Assessment"
// Show confirmation: "Are you sure? You can't change answers after submitting"

// POST /api/assessments/:assessmentId/submit
{
  studentId: xxx,
  answers: [
    { questionId: 1, selectedOption: 'B' },
    { questionId: 2, selectedOption: 'A' },
    // ...
  ],
  timeTaken: 3455  // seconds
}

// Response:
{
  totalMarks: 50,
  obtainedMarks: 40,
  percentage: 80,
  passing: true,
  result: "PASS"
}
```

#### F. Assessment Lock After Submission
```javascript
// After submission:
- Assessment marked as "Completed"
- Show results immediately:
  "Your Score: 40/50 (80%)"
  "Status: PASS"
- Disable answer changes
- Show "Retake not allowed"

// Mark in database:
AssessmentAttempt {
  studentId, assessmentId,
  answers[], totalMarks, obtainedMarks,
  status: 'completed',
  submittedAt: datetime
}
```

### Implementation Steps:
1. Create assessment viewer component
2. Implement lock/unlock logic based on time
3. Create question display with MCQ options
4. Add timer with countdown
5. Implement answer selection state management
6. Create submission handler
7. Display results on completion
8. Prevent retakes

---

## 3. **Student Results Portal** (High Priority)

### Location
Extend: `client/src/pages/student/Student-Dashboard.jsx`
Or Create: `client/src/pages/student/Results.jsx`

### Features:

#### A. Results Display
```jsx
Your Results

Classroom: Grade 10 - Section A

Results:
┌─────────────────────────────────┐
│ Course      │ Marks │ Status   │
├─────────────────────────────────┤
│ Math 101    │ 85/100│ ✅ PASS  │
│ Science 101 │ 72/100│ ✅ PASS  │
│ English     │ 65/100│ ⚠️ FAIL  │
└─────────────────────────────────┘
```

#### B. Results Reflection API
```javascript
GET /api/results/student
// Or: GET /api/results/student?classroomId=xxx

Response:
[
  {
    _id: xxx,
    courseId: xxx,
    course: { title: "Mathematics" },
    marks: 85,
    status: "pass",
    createdAt: "2025-01-26"
  },
  // ...
]
```

#### C. Individual Result Details
```jsx
Click on result row to view details:

Mathematics
Course Code: MATH-101
Teacher: Mr. John Smith
Marks Obtained: 85
Total Marks: 100
Percentage: 85%
Status: ✅ PASS
Date: January 26, 2025

Overall Performance: Good
```

#### D. Results Summary Card
```jsx
// In dashboard:
Results Summary
┌──────────────────┐
│ Courses Passed: 2│
│ Courses Failed: 1│
│ Overall: 73.3%   │
└──────────────────┘
```

### Implementation Steps:
1. Create results list component
2. Fetch results from API
3. Create results detail modal
4. Add to student dashboard
5. Show summary statistics

---

## 4. **Course Completion & Certificate** (Medium Priority)

### Features:

#### A. 100% Course Completion Check
```javascript
// When student marks all materials complete:
GET /api/progress/:courseId
// If completionPercentage === 100

// Generate certificate
POST /api/certificates/generate
{
  studentId: xxx,
  courseId: xxx
}

// Save Certificate record
Certificate {
  studentId,
  courseId,
  course: { title },
  certificateUrl,
  issuedAt,
  completionDate
}
```

#### B. Certificate Display
```jsx
Student Dashboard → Certificates tab

Certificates Earned:
┌─────────────────────────────────┐
│ Mathematics 101                  │
│ Completed: January 26, 2025     │
│ [View Certificate] [Download]   │
└─────────────────────────────────┘
```

### Implementation Steps:
1. Track 100% completion in progress
2. Trigger certificate generation
3. Display certificate in dashboard
4. Add download functionality

---

## 5. **Real-time Notifications** (Optional Enhancement)

### Features Using Socket.io:

```javascript
// When course teacher adds material:
socket.on('material:created', (data) => {
  toast.info(`New material added: ${data.title}`);
  refreshMaterials();
});

// When assessment is published:
socket.on('assessment:published', (data) => {
  toast.info(`New assessment: ${data.title}`);
  refreshAssessments();
});

// When results are added:
socket.on('result:added', (data) => {
  toast.info(`New result added for ${data.course}`);
  refreshResults();
});
```

---

## 6. **Progress Dashboard Integration** (High Priority)

### Updates to Student Dashboard:

```jsx
Current State:
┌──────────────────────────────┐
│ Progress Summary             │
│ Avg Progress: 45%            │
│ Completed Courses: 2/5       │
│ Pending Assessments: 3       │
└──────────────────────────────┘

New Sections:
1. Courses with Progress Bars
2. Materials to Complete (this week)
3. Pending Assessments (locked/unlocked)
4. Recent Results
5. Certificates Earned
```

---

## 7. **API Endpoints Required**

### New Endpoints Needed:

```javascript
// Progress
POST /api/progress/mark-completed
GET /api/progress/:courseId
GET /api/progress/student

// Assessments
GET /api/assessments/course/:courseId (student view - filtered by time)
POST /api/assessments/:assessmentId/questions (get questions only when unlocked)
POST /api/assessments/:assessmentId/submit
GET /api/assessments/:assessmentId/attempt (get previous attempt if exists)

// Results
GET /api/results/student
GET /api/results/student/:classroomId

// Materials
GET /api/materials/course/:courseId (student view)
POST /api/materials/:materialId/mark-viewed

// Certificates
GET /api/certificates/student
POST /api/certificates/generate
```

---

## 8. **Database Updates Needed**

### New/Updated Tables:

```javascript
// AssessmentAttempt (existing, ensure schema is correct)
{
  studentId,
  assessmentId,
  answers: [{ questionId, selectedOption }],
  totalMarks,
  obtainedMarks,
  status: 'completed' | 'in_progress',
  timeTaken,
  submittedAt,
  createdAt,
  updatedAt
}

// Progress (extend existing)
{
  studentId,
  courseId,
  materialId,
  completed: boolean,
  completedAt,
  viewCount,
  timeSpent
}

// Certificate (extend existing)
{
  studentId,
  courseId,
  certificateUrl,
  issuedAt,
  completionDate
}
```

---

## 9. **Implementation Priority**

### Phase 1 (Critical - Do First):
1. ✅ Course materials display with download
2. ✅ Mark as complete button
3. ✅ Results portal (read-only table)
4. ✅ Assessment taking interface (basic)

### Phase 2 (Important - Do Second):
1. Assessment timer implementation
2. Assessment locking after submission
3. Results integration with database
4. Progress dashboard updates

### Phase 3 (Enhancement - Optional):
1. Certificate generation & display
2. Real-time socket.io notifications
3. Advanced analytics
4. Performance recommendations

---

## 10. **Testing Scenarios**

### Scenario 1: Student Completes Materials
1. Student views course
2. Sees materials grouped by week
3. Downloads PDF material
4. Clicks "Mark as Complete"
5. Progress bar updates
6. Dashboard reflects new progress

### Scenario 2: Student Takes Assessment
1. Assessment appears in course card
2. Student clicks "Start Assessment"
3. Timer starts (60 minutes)
4. Student answers 15 questions
5. Clicks "Submit"
6. Marks displayed immediately
7. Assessment locked for retake

### Scenario 3: Student Views Results
1. Student goes to Results section
2. Sees all classroom results
3. Clicks on result to view details
4. Shows marks, status, teacher name
5. Can download result (if enabled)

---

## 11. **UI/UX Considerations**

### Material Viewing:
- Clear visual distinction between file types
- Download icons for files
- Embedded viewers for videos
- "Mark as Complete" button prominent

### Assessment Taking:
- Large visible timer
- Question counter (Q 5/15)
- Clear MCQ radio buttons
- Easy navigation buttons
- Prominent "Submit" button with confirmation

### Results Display:
- Color-coded status (Green=Pass, Red=Fail)
- Percentage display
- Comparison with class average (if available)
- Date information

---

## 12. **Code Templates**

### Material List Component
```jsx
export const MaterialList = ({ courseId, materials, onMarkComplete }) => {
  return (
    <div className="space-y-4">
      {materials.map(material => (
        <div key={material._id} className="bg-white p-4 rounded-lg">
          <h4>{material.title}</h4>
          <p className="text-sm text-gray-600">{material.type}</p>
          <div className="flex gap-2 mt-2">
            {material.linkUrl && <a href={material.linkUrl} target="_blank">Open</a>}
            {material.fileUrl && <a href={material.fileUrl}>Download</a>}
            <button onClick={() => onMarkComplete(material._id)}>
              ✅ Mark Complete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### Assessment Timer Component
```jsx
export const AssessmentTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.total <= 0) {
        onTimeExpired();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className={`text-2xl font-bold ${timeLeft.minutes < 5 ? 'text-red-600' : 'text-green-600'}`}>
      {timeLeft.minutes}:{timeLeft.seconds}
    </div>
  );
};
```

---

## 13. **Success Criteria**

- [ ] Students can view course materials grouped by week
- [ ] Students can download/view all material types
- [ ] Students can mark materials complete
- [ ] Dashboard progress updates in real-time
- [ ] Students can take assessments when unlocked
- [ ] Assessment timer works correctly
- [ ] Students cannot retake completed assessments
- [ ] Assessment marks display on submission
- [ ] Students can view all classroom results
- [ ] Results show correct status (Pass/Fail)
- [ ] Certificates generate on 100% completion
- [ ] All notifications appear in real-time

---

**Status**: Ready for Implementation
**Estimated Time**: 4-6 hours for Phase 1
**Priority**: CRITICAL - Complete before deployment
