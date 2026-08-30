# GradeWise Insights

You are an expert frontend developer. Build a complete, polished, dynamic React + Tailwind CSS frontend for a “School Result Processing & GPA Engine” hackathon project.

The Node.js/Express backend and deterministic grading engine are already implemented. Do not implement or re-calculate GPA rules in the frontend. The frontend must render API-provided structured result and trace data as the single source of truth.

Use:

- React + Vite

- React Router DOM

- TanStack React Query

- Tailwind CSS

- Functional components and hooks

- JavaScript or TypeScript (prefer TypeScript if practical)

Create a runnable codebase with a clean structure:

src/

  api/

  components/

  pages/

  hooks/

  utils/

  App.jsx / App.tsx

  main.jsx / main.tsx

  index.css

Design direction:

Create a restrained, professional school-office administration panel—not a flashy consumer dashboard. Use dense but readable tables, neutral surfaces, subtle borders, clear labels, and accessible contrast.

Status colors:

- Pass: bg-green-100 text-green-800

- Fail: bg-red-100 text-red-800

- Absent / AB: bg-yellow-100 text-yellow-800

Use a persistent sidebar or top navigation with:

- Dashboard

- Students

- Checking Lists

- Upload Marks

- Class Analytics

Support tablets and desktop widths cleanly, especially 1280px and above.

Important domain rules to preserve visually:

- “AB” is distinct from numeric zero everywhere.

- Final GPA and uncancelled GPA are separate API values.

- If a compulsory subject fails or is AB, the official result is overridden to Final GPA 0.00 and grade F, but uncancelled GPA remains visible.

- The frontend must never recompute grading logic or infer official grades.

- Trace rows and checking lists must be rendered from backend trace/checking-list records only.

API client:

Create `src/api/api.js` or `api.ts`, with a configurable base URL through `VITE_API_BASE_URL`.

Assume these endpoints exist; isolate any response-shape adaptation in the API client so components remain clean:

- GET `/api/dashboard`

  Returns:

  {

    totalStudents: number,

    overallPassRate: number,

    classCounts?: { className: string, studentCount: number }[]

  }

- GET `/api/students?classId=&search=`

  Returns:

  {

    students: [

      {

        id: string,

        name: string,

        className: string,

        finalGpa: number,

        letterGrade: string,

        status: "PASS" | "FAIL" | "AB",

        hasAbsent?: boolean,

        optionalSubjectCode?: string

      }

    ]

  }

- GET `/api/classes`

  Returns:

  {

    classes: [{ id: string, name: string }]

  }

- GET `/api/students/:id/trace`

  Returns a structured student trace such as:

  {

    student: {

      id: string,

      name: string,

      className: string,

      optionalSubject: { code: string, name: string } | null

    },

    result: {

      finalGpa: number,

      uncancelledGpa: number,

      letterGrade: string,

      compulsoryFailed: boolean,

      compulsoryFailureSubjects: [{ code: string, name: string }] | string[],

      optionalContribution: number,

      optionalGradePoint?: number,

      optionalExplanation?: string

    },

    subjects: [

      {

        code: string,

        name: string,

        isOptional: boolean,

        isPractical: boolean,

        rawMark?: number | "AB",

        theoryMark?: number | "AB",

        practicalMark?: number | "AB",

        totalMark?: number | "AB",

        gradePoint: number,

        status: "PASS" | "FAIL" | "AB",

        failReason?: string,

        ruleApplied?: string,

        gradeBand?: {

          min?: number,

          max?: number,

          label?: string

        }

      }

    ]

  }

- GET `/api/checking-lists/:type`

  where `:type` is `optional`, `practical-fail`, or `absent`.

  Returns:

  {

    entries: [

      {

        studentId: string,

        studentName: string,

        subjectCode?: string,

        subjectName?: string,

        reason: string

      }

    ]

  }

- POST `/api/upload`

  Accept multipart/form-data with field name `file`.

  Returns:

  {

    acceptedRows: number,

    rejectedRows: number,

    rejected: [

      {

        rowNumber: number,

        reason: string,

        rawData?: Record<string, string>

      }

    ]

  }

- GET `/api/class-summary?classId=`

  Returns:

  {

    className: string,

    totalStudents: number,

    passRate: number,

    gradeDistribution: Record<string, number>,

    mostFailedSubject: {

      code?: string,

      name: string,

      failureCount: number

    } | null

  }

Pages and requirements:

1. Dashboard (`/`)

- Metric cards:

  - Total students

  - Overall pass rate

- Quick links:

  - Class 9 and Class 10 student lists

  - Optional checking list

  - Practical Fail checking list

  - Absent checking list

  - Upload marks sheet

- Include a concise information panel explaining:

  “Official grades are calculated by the backend rules engine. Trace records provide the audit trail.”

2. Students (`/students`)

- Class dropdown filter, populated from `/api/classes`

- Search by student name or ID

- A dense, clean table with:

  - Student ID

  - Name

  - Class

  - Final GPA

  - Letter Grade

  - Status

- Status badge behavior:

  - AB amber if `status === "AB"` or `hasAbsent === true`

  - FAIL red if failed

  - PASS green otherwise

- Each row is clickable and routes to `/student/:id`

- Include loading, empty, and API error states.

3. Student Result & Detailed Trace (`/student/:id`)

This is the most important page.

Top summary:

- Breadcrumb back to Students

- Student name, ID, class, optional subject

- Large Final GPA card and large Letter Grade badge

- Clearly visible Uncancelled GPA card

- If `compulsoryFailed` is true, show a prominent red alert:

  “Compulsory failure in: [subjects] → official result overridden to F. Uncancelled GPA is shown below for audit reference.”

- Include a short explanation that final GPA is the official result while uncancelled GPA reflects the calculation before the compulsory-failure override.

Subject trace table:

- Columns:

  - Subject

  - Marks used

  - Grade Point

  - Status

  - Decision / Rule

- For non-practical numeric marks:

  Display `{mark}` and a sentence like:

  `75 → GP 4.0 (rule: 70–79 → GP 4.0)`

- For practical subjects:

  Display:

  `Theory: 52/75, Practical: 19/25, Total: 71/100`

  For a practical failure:

  `Theory 52/75 (pass ≥25), Practical 7/25 (pass ≥8) → fail because Practical 7/25 < required 8`

- For AB:

  Display `AB` and:

  `Absent (AB) → GP 0`

- Prefer backend `ruleApplied` and `failReason` when available.

- Do not invent official logic. Use graceful fallback formatting only when an optional explanation field is missing.

- Highlight a subject row when the URL contains `?subject=CODE`.

Optional contribution panel:

Show:

`Optional subject {name} GP = {gp}; contribution = max(0, {gp} - 2.0) = {contribution}`

Also explain:

“The optional contribution is added to the GPA total; the divisor remains 6.”

Add a “Printable Marksheet” button:

- Route to `/student/:id/print`

- Print view should be simplified, white, clean, and print-friendly.

- Use print CSS to hide application navigation and buttons.

- Include student summary, final/uncancelled GPA, override banner where relevant, and subject result table.

- Include a “Print” button that calls `window.print()`.

4. Checking Lists (`/checking-lists`)

- Use tabs:

  - Optional

  - Practical Fail

  - Absent

- Keep active tab in the URL query parameter when possible, e.g. `/checking-lists?tab=absent`

- Each tab fetches the appropriate endpoint.

- Table columns:

  - Student Name

  - Student ID

  - Subject

  - Reason

- Every row links to:

  `/student/:studentId?subject=:subjectCode`

- Do not deduplicate entries between lists.

- Use appropriate amber/red warning accents based on tab type.

5. Upload Marks (`/upload`)

- CSV-only file input

- Submit to `POST /api/upload` as multipart form data

- During upload, disable controls and show progress/loading feedback

- After success, display:

  - Accepted rows count

  - Rejected rows count

- If rejected rows exist, show:

  - Row number

  - Specific reason

  - Optional raw data preview

- Provide clear “Upload corrected file” / “Choose another file” action

- On successful upload, invalidate/refetch React Query caches for:

  - dashboard

  - students

  - classes

  - class summary

  - checking lists

- Do not proceed if no file is selected.

6. Class Analytics (`/analytics`)

- Class selector

- Fetch `/api/class-summary?classId=...`

- Show:

  - Total students

  - Pass rate as percentage

  - Progress bar with restrained green/red visual treatment

  - Grade distribution as simple CSS horizontal bars—no external chart library needed

  - Subject with most failures: subject name/code and failure count

- Include loading, empty, and error states.

Reusable components:

- `AppShell`

- `Sidebar` or `TopNav`

- `PageHeader`

- `MetricCard`

- `StatusBadge`

- `GradeBadge`

- `LoadingSpinner`

- `ErrorState`

- `EmptyState`

- `DataTable` where useful

- `Tabs`

- `ProgressBar`

- `SubjectTraceTable`

- `PrintableMarksheet`

Implementation quality:

- Use semantic HTML.

- Add keyboard-accessible interactive rows/links.

- Use `Intl.NumberFormat` or helper utilities for GPA formatting to exactly two decimals.

- Avoid duplicated request logic.

- Use meaningful query keys, e.g. `["students", filters]`, `["studentTrace", id]`.

- Keep loading/error states polished and concise.

- Use simple icons only if already available; do not add unnecessary dependencies.

- No mock data in final components; use real API calls. If an API response is unavailable, show a clear empty/error UI.

- Include a concise README with setup commands, environment variable instructions, and expected endpoint contracts.

Deliver the complete source code for every required file, organized by directory, with no omitted placeholder sections.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b52eae24-5413-4e24-a38c-cd3aba7bcb50).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
