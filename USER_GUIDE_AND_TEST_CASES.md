# SeismoScan — User Guide and Sample Test Cases

**System:** SeismoScan – Web-Based Rapid Visual Screening (RVS) Database System  
**Standard:** FEMA P-154 (Rapid Visual Screening of Buildings for Potential Seismic Hazards)  
**Course:** CENG 116B

---


## 1. Starting the System

Open **two separate Command Prompt windows** before using the system.

**Window 1 — Start Backend (API Server):**
```
cd C:\Users\raile\OneDrive\Documents\BSCS 1-1\4th Year - AY 2025-2026\CENG 116B\seismoscan\backend
npm start
```
Expected output:
```
MySQL database connected successfully
SeismoScan API server running on http://localhost:5000
```

**Window 2 — Start Frontend (Web App):**
```
cd C:\Users\raile\OneDrive\Documents\BSCS 1-1\4th Year - AY 2025-2026\CENG 116B\seismoscan\frontend
npm start
```

Then open your browser and go to: **http://localhost:3000**

> Keep both Command Prompt windows open while using the system.

---

## 2. User Roles

| Role | Permissions |
|---|---|
| **Inspector** | Create buildings, perform assessments, upload photos, view own records, generate reports |
| **Admin** | All inspector permissions + manage all users, view all records system-wide |

**Default Admin Account:**
- Email: `admin@seismoscan.com`
- Password: `Admin@123`

---

## 3. How to Use the System

### 3.1 Login and Registration

1. Open **http://localhost:3000** in your browser
2. Enter your email and password
3. Click **Sign In**

To create a new inspector account:
1. Click **Register here** on the login page
2. Fill in your Full Name, Email, and Password
3. Click **Create Account**
4. You will be redirected to the login page — sign in with your new credentials

---

### 3.2 Adding a Building

Before creating an assessment, you must first register the building.

1. Click **Buildings** in the left sidebar
2. Click **+ Add Building** (top right)
3. Fill in the building information:
   - **Building Name** *(required)*
   - **Full Address** *(required)*
   - Use Type, GPS Coordinates, Stories, Year Built, Floor Area
4. Click **Save Building**

> You will be redirected to the building's detail page after saving.

---

### 3.3 Creating an RVS Assessment

1. Go to **Buildings** → click **View** on a building → click **+ New Assessment**  
   OR click **Assessments → + New Assessment** and select a building from the dropdown
2. Fill in the FEMA P-154 form fields:
   - Building Type, Soil Type, Occupancy
   - Geologic Hazards (Liquefaction, Landslide, Surface Rupture)
   - Adjacency conditions
   - Structural Irregularities (Vertical and/or Plan)
   - Exterior Falling Hazards
   - Extent of Review
3. Watch the **Live Score Preview** on the right panel update in real time
4. Click **Save Assessment**

> The system automatically computes the Base Score, Modifiers, and Final SL1 Score.

---

### 3.4 Uploading a Building Photo

1. Go to **Buildings** → click **View** on a building
2. On the right panel, find the **Upload Photo** section
3. Click **Choose File** and select an image from your computer
4. Click **Upload Photo**

The photo will appear on the building page and will be included in the RVS report.

---

### 3.5 Viewing Assessment Results

1. Go to **Assessments** in the sidebar
2. Click **View** on any assessment
3. The page shows:
   - Score banner (Base Score + Modifiers = SL1)
   - PASS or FAIL result
   - Full breakdown of all structural conditions
   - All form data entered during assessment

---

### 3.6 Generating a Report

1. Open any assessment → click **View Full Report**  
   OR from the Assessments list → click **Report**
2. The report displays:
   - **Table 1:** Building information and SL1 score
   - **Table 2:** Building photo
   - **Table 3:** Extent of review and other hazards
   - **Table 4:** Action required and recommendation
   - FEMA P-154 scoring table with your building type highlighted
3. To print: click **Print (Ctrl+P)** or press `Ctrl+P`
4. To export PDF: click **Export PDF**

---

### 3.7 Searching and Filtering

**Search Buildings:**
- Go to **Buildings** → type in the search box → click **Search**

**Filter Assessments:**
- Go to **Assessments**
- Filter by **Result** (PASS / FAIL)
- Filter by **Date From** and **Date To**
- Click **Clear** to reset filters

---

### 3.8 User Management (Admin)

1. Click **Users** in the sidebar *(Admin only)*
2. To add a user: click **+ Add User**, fill in name, email, password, and role
3. To edit: click **Edit** next to a user
4. To delete: click **Delete** next to a user

---

## 4. Sample Test Case 1 — PASS Result

> Based on FEMA P-154 Figure 7-14 Example

### Building Information

| Field | Value |
|---|---|
| Building Name | Addison Commercial Building |
| Address | 1450 Addison Avenue, Anyplace, CA 91230 |
| Use Type | Commercial |
| Latitude | 34.1478 |
| Longitude | -118.1445 |
| Stories Above Grade | 1 |
| Stories Below Grade | 0 |
| Year Built | 1990 |
| Floor Area | 10,200 |

### Assessment Input

| Field | Value |
|---|---|
| FEMA Building Type | W2 — Commercial Wood |
| Soil Type | C — Dense Soil |
| Occupancy | Commercial |
| Contact Person | D. Taylor |
| Exterior Review | All Sides |
| Interior Review | None |
| Drawings Reviewed | No |
| Soil Type Source | State Geologist |
| Geologic Hazards Source | State Geologist |
| Liquefaction | No |
| Landslide | No |
| Surface Rupture | No |
| Adjacency Pounding | No |
| Falling Hazards (Adjacency) | No |
| Vertical Irregularity | No |
| Plan Irregularity | **Yes** |
| Plan Irregularity Type | Reentrant corner (L-shaped) |
| All Exterior Falling Hazards | No |

### Expected Score Computation

| Component | Value |
|---|---|
| Base Score (W2) | 2.9 |
| Plan Irregularity Modifier | -0.8 |
| Soil Type C Modifier | 0.0 |
| **Final Score (SL1)** | **2.1** |
| Minimum Score | 0.5 |
| **Result** | ✅ **PASS** |

> SL1 = 2.1 ≥ 2.0 → **PASS** — No Level 2 evaluation required.

---

## 5. Sample Test Case 2 — FAIL Result

> A deteriorated pre-code concrete frame building

### Building Information

| Field | Value |
|---|---|
| Building Name | Old City Hall Annex |
| Address | 25 Municipal Drive, Cebu City |
| Use Type | Government |
| Stories Above Grade | 4 |
| Stories Below Grade | 0 |
| Year Built | 1935 |
| Floor Area | 8,500 |

### Assessment Input

| Field | Value |
|---|---|
| FEMA Building Type | C1 — Concrete Moment Frame |
| Soil Type | D — Stiff Soil |
| Occupancy | Government |
| Exterior Review | All Sides |
| Interior Review | Visible |
| Drawings Reviewed | No |
| Liquefaction | DNK |
| Landslide | No |
| Surface Rupture | No |
| Adjacency Pounding | **Yes** |
| Vertical Irregularity | **Yes** |
| Vertical Irregularity Type | Soft story (ground floor open) |
| Irregularity Severity | Severe |
| Plan Irregularity | No |
| Unbraced Chimneys | **Yes** |
| Parapets | **Yes** |
| Other Hazard — Damage | **Yes** |

### Expected Score Computation

| Component | Value |
|---|---|
| Base Score (C1) | 1.5 |
| Severe Vertical Irregularity | -0.9 |
| Pre-Code Modifier (built 1935) | -0.4 |
| **Final Score (SL1)** | **0.2** |
| Minimum Score | 0.3 |
| **Adjusted Final Score** | **0.3** |
| **Result** | ❌ **FAIL** |

> SL1 = 0.3 < 2.0 → **FAIL** — Level 2 structural evaluation is required.

---

## 6. Sample Test Case 3 — Unreinforced Masonry

> A historic URM building in a high-seismicity zone

### Building Information

| Field | Value |
|---|---|
| Building Name | Heritage Market Building |
| Address | 78 Colon Street, Cebu City |
| Use Type | Commercial |
| Stories Above Grade | 2 |
| Stories Below Grade | 0 |
| Year Built | 1960 |
| Floor Area | 3,200 |

### Assessment Input

| Field | Value |
|---|---|
| FEMA Building Type | URM — Unreinforced Masonry |
| Soil Type | E — Soft Soil |
| Occupancy | Commercial |
| Exterior Review | All Sides |
| Interior Review | None |
| Drawings Reviewed | No |
| Liquefaction | Yes |
| Landslide | No |
| Surface Rupture | DNK |
| Adjacency Pounding | **Yes** |
| Vertical Irregularity | No |
| Plan Irregularity | **Yes** |
| Plan Irregularity Type | L-shaped plan |
| Parapets | **Yes** |
| Heavy Cladding | **Yes** |
| Other Hazard — Geologic | **Yes** |

### Expected Score Computation

| Component | Value |
|---|---|
| Base Score (URM) | 1.0 |
| Plan Irregularity Modifier | -0.7 |
| Soil Type E (1–3 stories) | -0.2 |
| **Final Score (SL1)** | **0.1** |
| Minimum Score | 1.0 |
| **Adjusted Final Score** | **1.0** |
| **Result** | ❌ **FAIL** |

> SL1 = 1.0 < 2.0 → **FAIL** — Level 2 evaluation required. Geologic hazards also trigger detailed structural evaluation.

---

## 7. FEMA P-154 Scoring Reference

### Base Scores (HIGH Seismicity)

| Building Type | Description | Base Score |
|---|---|---|
| DNK | Do Not Know | 3.6 |
| W1 | Wood Light Frame | 3.2 |
| W2 | Commercial Wood | 2.9 |
| S1 | Steel Moment Frame | 2.1 |
| S2 | Steel Braced Frame | 2.0 |
| S3 | Steel Light Frame | 2.6 |
| C1 | Concrete Moment Frame | 1.5 |
| C2 | Concrete Shear Wall | 2.0 |
| C3 | Concrete Frame w/ Infill | 1.2 |
| PC1 | Precast Tilt-Up | 1.6 |
| URM | Unreinforced Masonry | 1.0 |
| MH | Manufactured Housing | 1.5 |

### Score Modifiers

| Modifier | Effect |
|---|---|
| Severe Vertical Irregularity | Negative (−0.7 to −1.2) |
| Moderate Vertical Irregularity | Negative (−0.4 to −0.8) |
| Plan Irregularity | Negative (−0.4 to −1.1) |
| Pre-Code Building | Negative (−0.1 to −1.1) |
| Post-Benchmark Building | Positive (+1.1 to +2.4) |
| Soil Type A or B | Positive (+0.2 to +0.6) |
| Soil Type E (1–3 stories) | Slightly negative or neutral |
| Soil Type E (>3 stories) | Negative (−0.3 to −0.9) |

### Decision Rule

```
SL1 ≥ 2.0  →  PASS  (No further action required)
SL1 < 2.0  →  FAIL  (Level 2 Evaluation Required)
```

---

## 8. Troubleshooting

| Problem | Solution |
|---|---|
| Cannot log in | Update password directly in phpMyAdmin → users table |
| Backend not starting | Make sure XAMPP MySQL is running; check `.env` file |
| Frontend not opening | Go to http://localhost:3000 manually |
| Score not computing | Make sure a building is selected and a building type is chosen |
| Photo not uploading | Check that the `backend/uploads/` folder exists |
| Report PDF blank | Allow pop-ups in your browser; try Print (Ctrl+P) instead |
| Port already in use | Close other apps using port 3000 or 5000 and restart |
