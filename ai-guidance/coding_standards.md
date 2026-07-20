# AI Coding Standards

The following constraints were enforced on all AI-generated code to maintain production-grade quality:

## Backend Standards (Python/Flask)
- All functions must utilize Python Type Hints for clarity.
- Database operations must be wrapped in try/except blocks with session rollbacks on failure.
- API responses must follow a consistent JSON structure for the frontend to consume.

## Frontend Standards (React)
- Only use functional components and React Hooks (useState, useEffect).
- All styling must be handled via Tailwind CSS utility classes; no custom CSS files allowed.
- Component modularity is required: separate the Dashboard logic from UI components like Modals or Cards.