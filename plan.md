# Academic & Entrance Calculators Implementation Plan

A comprehensive, phased roadmap to build, test, and launch high-performance academic and percentile tools on **All Cut Off** (`allcutoff.com`), fully optimized for search rankings, responsive UX, and mathematical accuracy.

---

## 🎯 Targeted Keyword & Tool Mapping

| Tool | Dedicated URL Route | Target SEO Keywords |
| :--- | :--- | :--- |
| **CGPA Calculator** | `/calculator/cgpa-calculator`<br>`/calculator/vit-cgpa-calculator`<br>`/calculator/ktu-cgpa-calculator`<br>`/calculator/vtu-cgpa-calculator`<br>`/calculator/anna-university-cgpa-calculator` | `cgpa calculator`, `vit cgpa calculator`, `cgpa calculator vit`, `cgpa calculator ktu`, `vtu cgpa calculator`, `cgpa calculator anna university`, `cgpa calculator vtu` |
| **SGPA Calculator** | `/calculator/sgpa-calculator`<br>`/calculator/ktu-sgpa-calculator`<br>`/calculator/vtu-sgpa-calculator`<br>`/calculator/aktu-sgpa-calculator` | `sgpa calculator`, `sgpa calculator ktu`, `vtu sgpa calculator`, `ktu sgpa calculator`, `aktu sgpa calculator` |
| **SGPA to CGPA Calculator** | `/calculator/sgpa-to-cgpa-calculator` | `sgpa to cgpa calculator`, `convert sgpa to cgpa`, `semester sgpa to cgpa` |
| **CGPA to Percentage** | `/calculator/cgpa-to-percentage-calculator` | `cgpa to percentage calculator`, `vtu cgpa to percentage`, `ktu cgpa to percentage`, `anna university cgpa to percentage`, `cbse cgpa to percentage` |
| **Marks Percentage** | `/calculator/marks-percentage-calculator` | `marks percentage calculator`, `12th marks percentage calculator`, `percentage calculator for marks` |
| **Attendance Calculator** | `/calculator/attendance-percentage-calculator` | `attendance percentage calculator`, `attendance calculator`, `bunk calculator`, `75 attendance calculator` |
| **Percentile Calculator** | `/calculator/percentile-calculator`<br>`/calculator/jee-main-percentile-calculator`<br>`/calculator/cat-percentile-calculator`<br>`/calculator/mht-cet-percentile-calculator` | `percentile calculator`, `cat percentile calculator`, `jee percentile calculator`, `jee main percentile calculator`, `mht cet percentile calculator`, `cet percentile calculator` |

---

## 📐 Formulas & Specifications

1. **CGPA & SGPA**:
   - Universal Formula: $\text{CGPA} = \frac{\sum (\text{SGPA}_i \times \text{Credit}_i)}{\sum \text{Credit}_i}$ or $\frac{\sum (GP_i \times C_i)}{\sum C_i}$
   - **VIT**: 10-point scale (`S:10, A:9, B:8, C:7, D:6, E:4, F:0`). $\% = \text{CGPA} \times 10$.
   - **KTU**: 10-point scale (`O:10, A+:9, A:8.5, B+:8, B:7, C:6, P:5, F:0`). $\% = 10 \times \text{CGPA} - 3.75$.
   - **VTU**: 10-point CBCS (`O:10, A+:9, A:8, B+:7, B:6, C:5, P:4, F:0`). $\% = (\text{CGPA} - 0.75) \times 10$.
   - **Anna University**: 10-point Regulation 2021 (`O:10, A+:9, A:8, B+:7, B:6, C:5, RA:0`). $\% = \text{CGPA} \times 10$.
   - **AKTU**: 10-point scale (`A+:10, A:9, B+:8, B:7, C+:6, C:5, D:4, F:0`). $\% = (\text{SGPA} - 0.75) \times 10$.

2. **SGPA to CGPA**:
   - Weighted credit sum: $\text{CGPA} = \frac{\sum (\text{SGPA}_k \times C_k)}{\sum C_k}$ (supports equal credit or custom credit per semester).

3. **CGPA to Percentage**:
   - CBSE / AICTE: $\text{Percentage} = \text{CGPA} \times 9.5$
   - VTU: $\text{Percentage} = (\text{CGPA} - 0.75) \times 10$
   - KTU: $\text{Percentage} = (10 \times \text{CGPA}) - 3.75$
   - Anna University: $\text{Percentage} = \text{CGPA} \times 10$
   - Reverse: Percentage $\rightarrow$ CGPA converter with official formulas.

4. **Marks Percentage**:
   - Total Marks: $\text{Percentage} = \left(\frac{\text{Obtained}}{\text{Total}}\right) \times 100$
   - Subject-wise breakdown, Division classification (Distinction $\ge 75\%$, 1st $\ge 60\%$, 2nd $\ge 50\%$, 3rd $\ge 35\%$, Fail $< 35\%$).
   - Target Score Planner (find marks needed on remaining tests).

5. **Attendance Percentage & Bunk Calculator**:
   - Current $\% = \left(\frac{\text{Attended Classes}}{\text{Total Classes Conducted}}\right) \times 100$
   - Target Requirement (e.g. 75% or 85%):
     - If Current $\% < \text{Target}$: Classes to attend consecutively $= \lceil \frac{\text{Target} \times \text{Total} - 100 \times \text{Attended}}{100 - \text{Target}} \rceil$
     - If Current $\% \ge \text{Target}$: Safe bunks available $= \lfloor \frac{100 \times \text{Attended} - \text{Target} \times \text{Total}}{\text{Target}} \rfloor$

6. **Percentile Calculator**:
   - Rank-to-Percentile: $\text{Percentile} = \left(1 - \frac{\text{Rank} - 1}{N}\right) \times 100$
   - Percentile-to-Rank: $\text{Rank} = \left(1 - \frac{\text{Percentile}}{100}\right) \times N + 1$
   - Score-to-Percentile Predictors:
     - JEE Main 2026/2025: $N \approx 14,50,000$ candidates, benchmark marks vs percentile tables.
     - CAT 2025/2026: $N \approx 3,30,000$ candidates, score out of 198 $\rightarrow$ percentile.
     - MHT CET 2026: $N \approx 4,10,000$ (PCM) / $3,30,000$ (PCB), score out of 200 $\rightarrow$ percentile.

---

## 📋 Execution Phases & Progress Tracking

### Phase 1: Foundation, Data Architecture & Testing
- [x] Create `src/data/academicCalculators.ts` with metadata, university configs, grading tables, conversion rules, candidate statistics, and FAQ data.
- [x] Create unit tests `src/data/academicCalculators.test.ts` verifying all formulas (CGPA, SGPA, SGPA to CGPA, Attendance, CGPA to %, Marks %, Percentile).
- [x] Run test suite with Vitest and ensure 100% test pass rate.

### Phase 2: CGPA, SGPA, SGPA to CGPA & Attendance Widgets
- [x] Build `src/components/academic/CgpaCalculatorWidget.astro` (Semester-wise and Subject-wise modes, VIT, KTU, VTU, Anna University presets, live gauge, division badge).
- [x] Build `src/components/academic/SgpaCalculatorWidget.astro` (Dynamic subject rows, grade dropdowns, credit weights, KTU, VTU, AKTU presets).
- [x] Build `src/components/academic/SgpaToCgpaWidget.astro` (Semester-wise SGPA input, default or custom credits, cumulative CGPA progression).
- [x] Build `src/components/academic/AttendanceWidget.astro` (Current attendance %, safe bunk calculator, consecutive classes needed for 75%/80%/85% goal).

### Phase 3: CGPA to %, Marks % & Percentile Widgets
- [x] Build `src/components/academic/CgpaToPercentageWidget.astro` (Two-way CGPA $\leftrightarrow$ % conversion, university formula selector, full comparison table).
- [x] Build `src/components/academic/MarksPercentageWidget.astro` (Single total, multi-subject table, target marks planner, division breakdown).
- [x] Build `src/components/academic/PercentileWidget.astro` (Rank-to-percentile, percentile-to-rank, JEE Main/CAT/MHT CET score predictors).

### Phase 4: Dedicated SEO Pages & Static Routing
- [x] Implement master and university-specific CGPA pages:
  - [x] `/calculator/cgpa-calculator`
  - [x] `/calculator/vit-cgpa-calculator`
  - [x] `/calculator/ktu-cgpa-calculator`
  - [x] `/calculator/vtu-cgpa-calculator`
  - [x] `/calculator/anna-university-cgpa-calculator`
- [x] Implement master and university-specific SGPA pages:
  - [x] `/calculator/sgpa-calculator`
  - [x] `/calculator/ktu-sgpa-calculator`
  - [x] `/calculator/vtu-sgpa-calculator`
  - [x] `/calculator/aktu-sgpa-calculator`
- [x] Implement SGPA to CGPA page:
  - [x] `/calculator/sgpa-to-cgpa-calculator`
- [x] Implement Conversion and Grade utility pages:
  - [x] `/calculator/cgpa-to-percentage-calculator`
  - [x] `/calculator/marks-percentage-calculator`
  - [x] `/calculator/attendance-percentage-calculator`
- [x] Implement Percentile and Exam pages:
  - [x] `/calculator/percentile-calculator`
  - [x] `/calculator/jee-main-percentile-calculator`
  - [x] `/calculator/cat-percentile-calculator`
  - [x] `/calculator/mht-cet-percentile-calculator`
- [x] Add JSON-LD Structured Data (`WebApplication`, `FAQPage`, `BreadcrumbList`) and meta tags for every page.

### Phase 5: Global Navigation, Homepage & Search Integration
- [x] Update `src/components/Header.astro` with an "Academic Tools" navigation link / category.
- [x] Add a dedicated "Academic & Grade Calculators" section on the homepage `src/pages/index.astro`.
- [x] Update `src/components/SearchModal.astro` with search aliases, keywords, and instant jump links for all new tools.
- [x] Update `src/components/Footer.astro` with categorized links to new calculators.

### Phase 6: Quality Assurance, Responsive Polish & Build Audit
- [x] Validate mobile, tablet, and desktop responsiveness across all 7 tools.
- [x] Run complete Vitest suite to ensure zero regressions (89/89 tests passing).
- [x] Run `pnpm build` to ensure static page generation succeeds with 0 errors (51 pages generated).
