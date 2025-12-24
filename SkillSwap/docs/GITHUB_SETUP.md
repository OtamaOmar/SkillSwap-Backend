# GitHub Scrum Board Setup 

## 1) Create a GitHub Project (Scrum Board)
- In GitHub: **Projects → New project → Board**
- Columns (recommended):
  - Backlog
  - Ready
  - In Progress
  - In Review
  - Testing
  - Done
- Add automation rules:
  - When issue is opened → Backlog
  - When PR is opened → In Review
  - When PR merged → Done

## 2) Turn Backlog items into Issues
- Create issues for each story (US-1, US-2, ...)
- Add labels:
  - `type:feature`, `type:bug`, `type:chore`
  - `priority:P0/P1/P2`
  - `area:frontend`, `area:backend`, `area:docs`
- Add story points (`SP:1`, `SP:2`, `SP:3`, `SP:5`)

## 3) Scrum Meeting Summaries
- Use the template in `docs/scrum/MEETING_TEMPLATE.md`
- Save notes as `docs/scrum/2025-12-XX-standup.md`
- Link relevant issues and PRs inside the summary.

## 4) Pull Requests
- Add `.github/pull_request_template.md`
- Require:
  - linked issue
  - checklist completed
  - CI passing

## 5) Pipelines (CI/CD)
- Keep/enable GitHub Actions:
  - Frontend: install → lint → build → tests (when added)
  - Backend: install → lint → tests → (optional) docker build/push
