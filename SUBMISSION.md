# M7 TAKE HOME SUBMISSION KAAN YILMAZ

## IMPLEMENTATION SUMMARY

My approach focused on building a flexible infrastructure for nurse scheduling that enables end-to-end control over the scheduling process. Despite this being my first experience with NestJS (coming from a strong TypeScript and React background), I found the framework's architecture and style quite fun to work with and learn!

This project evolved into a small MVP that I could imagine as an internal tool for comparing scheduling algorithms. While obviously prototype-like in nature, I realized this approach better served as a platform for experimenting with different scheduling strategies rather than as an external nurse scheduling system. In a production environment, I could envision implementing strategy patterns where different schedulers are selected based on circumstances (e.g., using the heuristic approach when ILP times out). A tool like this could provide the building blocks for creating strong metrics and tests to evaluate how different schedulers behave.

The core idea was to create a system where:
1. Multiple scheduling algorithms can coexist and be compared
2. Users can see immediate feedback on scheduler performance
3. The system is extensible for future improvements
4. Preferences and requirements can be easily modified

I implemented two distinct schedulers:
- An Integer Linear Programming (ILP) approach using GLPK for optimal solutions -- GLPK was a tool I found online to help facilitate ILP models in TypeScript
- A heuristic-based approach using customizable scoring weights

While time constraints limited some features, the foundation is laid for:
- Modifying shift requirements and creating new ones
- Dynamic modification of scheduler parameters
- Historical tracking of schedule versions
- Performance comparisons between different algorithms
- Easy addition of new scheduling strategies


## Backend Documentation (NestJS)

### Architecture Overview

```
backend/
├── src/
│   ├── schedule/           # Schedule generation logic
│   ├── shift/             # Shift management
│   ├── shiftRequirement/  # Shift requirements handling
│   ├── nurse/             # Nurse management
│   └── shiftPreference/   # Shift preference handling
```

### Key Components

#### 1. Schedule Generation
Two distinct scheduling algorithms are implemented:

##### a) Integer Linear Programming (ILP) Algorithm
- Uses GLPK (GNU Linear Programming Kit) solver
- Guarantees optimal solutions when feasible
- Key features:
  - Exact staffing requirements matching
  - Preference-based optimization
  - Hard constraints enforcement
  - Base weight (0.1) for valid assignments
  - Preference weight (1.0) for preferred shifts

##### b) Heuristic Algorithm
- Implements a score-based approach for shift assignments
- Scoring factors:
  - Fair distribution (0-5 points)
  - Preference matching (+1 point)
  - Consecutive night shift penalties (-1 point)
  - Availability scoring (+1000 points)
  - Anti-preference penalties (-2 points)

#### 2. Data Models
- **Nurse**: Basic nurse information and ID
- **Shift**: Represents day/night shifts with nurse assignments
- **ShiftPreference**: Stores nurse preferences for specific shifts
- **ShiftRequirement**: Defines required nurses per shift/day combination

#### 3. API Endpoints

##### Shift Management
- `GET /shifts`: Lists all shifts
- `GET /shifts/schedule/:scheduleId`: Gets shifts for a specific schedule

##### Shift Requirements
- `GET /shift-requirements`: Retrieves all shift requirements
- `POST /shift-requirements`: Creates new shift requirements

##### Nurse Management
- `GET /nurses`: Lists all nurses
- `GET /nurses/:id/preferences`: Gets preferences for a nurse
- `POST /nurses/:id/preferences`: Updates nurse preferences

##### Schedule Management
- `POST /schedules/generate`: Generates new schedules
- `GET /schedules/latest`: Retrieves most recent schedules

### Database Schema
MySQL database with the following key tables:
- `nurses`: Stores nurse information
- `shifts`: Contains shift assignments
- `shift_requirements`: Defines staffing requirements per day/shift
- `schedules`: Stores generated schedules

## Frontend Documentation (React + Vite)

### Architecture Overview
The frontend uses React with TypeScript and Vite as the build tool. It follows a component-based architecture with modular styling:

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── model/         # TypeScript interfaces
│   ├── services/      # API services
│   └── styles/        # CSS styles
```

### Key Components

#### 1. Schedule Display System

- **Nurses.tsx**: Main nurse management interface
  - Lists all available nurses
  - Shows current preference settings
  - Provides preference modification interface
  - Real-time preference updates

- **NursePreferences.tsx**: Preference management
  - Interactive preference selection
  - Day/Night shift toggles per weekday
  - Visual feedback for saved preferences
  - Optimistic UI updates
  - Error handling with rollback

- **Schedule.tsx**: Main component for schedule display
  - Handles schedule generation requests
  - Displays multiple schedules with preference indicators
  - Shows scheduling algorithm used
  - Integrates preference statistics

- **ScheduledShifts.tsx**: Tabular schedule view
  - Color-coded preference matching
  - Requirements satisfaction indicators
  - Nurse assignment display with IDs

- **PreferenceStats.tsx**: Statistical analysis
  - Calculates preference matching percentages
  - Shows matches, mismatches, and neutral assignments
  - Uses consistent color coding (green/red/white)

- **ShiftRequirements.tsx**: Requirements display
  - Shows required nurses per shift/day
  - Sorted by day of week and shift type
  - Clear formatting with proper capitalization

#### 2. API Service Layer
- Centralized API service with error handling
- Type-safe request/response handling
- Consistent error messaging
- Proper data transformation for UI consumption

### State Management
- Uses React's built-in state management
- Centralized API service for data fetching
- Type-safe interfaces for data handling
- Proper error state management

### Styling
- Consistent color scheme
- Clear visual hierarchy
- Responsive layout

## Technical Decisions and Trade-offs

### Algorithm Selection
- ILP provides optimal solutions but may be slower
- Heuristic algorithm offers faster results but may not be optimal
- Both algorithms implemented for comparison

### User Experience
- Focus on clear visual feedback
- Makes it easy to iterate on scheduler by showing metrics and results
- Statistical insights for schedule quality
- Standardized error messaging

### Future Improvements
1. Add ShiftRequirements write functionality (currently read-only)
2. Add unit test coverage and integration tests
3. Implement scheduler stress testing
4. Add schedule versioning
5. Enable the weights in the schedulers to be easily modified and even dynamically set
6. changing time horizon for the schedule (weeks vs months)

