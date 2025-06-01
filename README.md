# M7 Health take-home exercise

## Introduction

This exercise evaluates your skills in full-stack TypeScript development, using a backend in NestJS and a frontend in Vite with React. You will build a mini-scheduling system for nurses based on shift requirements and preferences.

You may complete this exercise in any language, but we only provide this starter project in TypeScript. We've done this to keep the exercise as efficient as possible and to mirror the language and frameworks you'll encounter at M7. If you choose to use another language, start from scratch with the code here as a reference.

This exercise should take approximately 4 hours to complete. It does _not_ need to be completed in one contiguous block of time. If you spend more than the recommended time, you may stop and submit what you have. Be sure to let us know how long you spent, as we use this metric to assess submissions fairly.

## The exercise

Your mini-scheduling system will generate a simple weekly schedule based on shift requirements and nurse preferences.

There are seven days on a schedule, with two shifts per day: day and night. Shift requirements specify the required nurses for each shift each day (see `backend/src/shift/shiftRequirements.json`).

We don't care about actual dates or scheduling for multiple weeks. We are only concerned with a single week.

You will implement two main things: **nurse preference collection** and **schedule creation**.

#### Nurse preferences

You will need to allow entry of nurse preferences. Currently, preferences are stored as JSON on the `nurses` table. Decide on an appropriate schema for this data and create an interface for user entry, as well as an API endpoint to save the preferences.

#### Schedule creation

You'll need to implement a scheduling algorithm in the `ScheduleService` that generates a weekly schedule for nurses (in `backend/src/schedule/schedule.service.ts`) based on their entered preferences and the shift requirements.

Develop a user interface that displays the weekly schedule for all nurses. You can choose the design and layout. Get creative if you like! It can be as beautiful or brutal as time allows, but it must be usable.

- The header should display the day of the week and indicate whether each shift type meets the requirements for that day.
- Each row of the schedule should display the nurse's name and their assigned shift type for a given day.

### Considerations

While going through the exercise, note any improvements you would make or issues you run into. We will discuss these during the subsequent interview. If time allows, you may include these improvements in your submission. Some examples to spark your imagination:

- Unit tests for the backend or frontend.
- Updated Docker Compose file to run the backend and frontend in tandem, in addition to the database, handling all prerequisites.
- Outputting the schedule in a different format (CSV, PDF, etc.).
- Whatever else you can think of!

## Up and running

1. Run `pnpm install` for both projects to install dependencies.
1. For the backend project, additionally:
   1. Run `docker compose up` to start the MySQL database
   1. Run migrations to create and seed the database: `pnpm run migrations:run`
1. Run the backend server: `pnpm start:dev`
1. Run the frontend server: `pnpm dev`

The backend and frontend should now be running. Upon visiting http://localhost:5174 you should see a page showing nurses and shift requirements.
Note: The UI is optimized and meant to be used with a light-mode browser / OS setting for the best experience.
Dark mode will not be optimal.

## Submission

Once you've completed the exercise, please zip your code and email it to recruiting@m7health.com. **Let us know how long you spent on the assignment.** As mentioned, we use this metric to assess submissions fairly, as everyone has varying amounts of time they can spend. We'll review your submission and get back to you as soon as we can.

## Evaluation

We will evaluate your work based on the following criteria, in order of importance:

1. **Functionality**: Does the system work as expected?
2. **Code quality**: Is the code clean and organized, and does it follow best practices?
3. **Design**: Is the frontend intuitive and user-friendly? It doesn't need to be pretty, but it must be usable.
4. **Efficiency**: Is the scheduling algorithm efficient? Why or why not? Does it assign shifts fairly and maximize nurse availability? What tradeoffs did you make that you would think about if you had had more time?

## Notes

Feel free to be creative in how you choose to represent the schedule on the frontend. Comment your code where necessary so we can understand your thought process.

We look forward to seeing what you create!
