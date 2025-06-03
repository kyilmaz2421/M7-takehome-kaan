# M7 TAKE HOME SUBMISSION KAAN YILMAZ

## IMPLEMENTATION SUMMARY


## Backend Documentation (NestJS)

### Architecture Overview
The backend is built using NestJS, a progressive Node.js framework, with TypeScript. It follows a modular architecture with clear separation of concerns:

```
backend/
├── src/
│   ├── schedule/        # Schedule generation logic
│   ├── shift/          # Shift requirements and preferences
│   ├── nurse/          # Nurse management
│   └── shiftPreference/# Shift preference handling
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
- **ShiftRequirement**: Defines required nurses per shift

#### 3. API Endpoints
- `POST /schedule/generate`: Generates new schedules
- `GET /schedule/recent`: Retrieves most recent schedules
- `GET /nurses`: Lists all nurses
- `PUT /nurses/:id/preferences`: Updates nurse preferences

### Database Schema
MySQL database with the following key tables:
- `nurses`: Stores nurse information
- `shifts`: Contains shift assignments
- `shift_requirements`: Defines staffing requirements
- `schedules`: Stores generated schedules

## Frontend Documentation (React + Vite)

### Architecture Overview
The frontend is built using React with TypeScript and Vite as the build tool. It follows a component-based architecture with modular styling:

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

#### 2. Visual Indicators
- Green: Preferred shifts
- Red: Non-preferred shifts
- White: No preferences specified
- Requirements met/unmet indicators
- Nurse IDs in parentheses

#### 3. User Interface Features
- Interactive schedule generation
- Clear loading states
- Error handling and display
- Responsive design
- Intuitive preference visualization

### State Management
- Uses React's built-in state management
- Centralized API service for data fetching
- Type-safe interfaces for data handling

### Styling
- Consistent color scheme
- Clear visual hierarchy
- Responsive layout
- Accessibility considerations
- Light mode optimization

## Technical Decisions and Trade-offs

### Algorithm Selection
- ILP provides optimal solutions but may be slower
- Heuristic algorithm offers faster results but may not be optimal
- Both algorithms implemented for comparison

### User Experience
- Focus on clear visual feedback
- Intuitive preference indication
- Statistical insights for schedule quality
- Efficient error handling

### Performance Considerations
- Optimized API calls
- Efficient state updates
- Minimal re-renders
- Type-safe implementation

### Future Improvements
1. Add ShiftRequirements write functionality we only added READ
2. Unit test coverage + integration tests
3. Scheduler stress test
4. Show schedule versioning
5. Performance optimizations for larger datasets
