# Contributing to Task Manager

Thank you for your interest in contributing! This document outlines the process and conventions for contributing to this project.

---

## Getting Started

1. **Fork** the repository and clone your fork locally.
2. Follow the [README](./README.md) setup instructions to run the project.
3. Create a new branch from `main` for your changes:
   ```bash
   git checkout -b feat/your-feature-name
   ```

---

## Branch Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<description>` | `feat/task-labels` |
| Bug fix | `fix/<description>` | `fix/token-expiry` |
| Refactor | `refactor/<description>` | `refactor/auth-service` |
| Documentation | `docs/<description>` | `docs/api-reference` |
| Chore | `chore/<description>` | `chore/upgrade-deps` |

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(scope): <short description>

[optional body]
```

**Examples:**
```
feat(tasks): add due date field to task creation
fix(auth): prevent timing attack in login endpoint
docs(readme): add Railway deployment steps
chore(deps): upgrade @nestjs/jwt to 10.2.0
```

---

## Code Standards

### Both Backend & Frontend
- All code must pass ESLint with zero errors/warnings
- All code must be formatted with Prettier before committing
- TypeScript strict mode must remain enabled — no `any` without justification

### Backend
- New endpoints must include input validation via class-validator DTOs
- Sensitive operations must be behind `JwtAuthGuard`
- No hardcoded secrets — always use `ConfigService`

### Frontend
- Components must be functional (no class components)
- Hooks must not be called conditionally
- Accessibility: interactive elements must have proper `aria-label` or visible text

---

## Pull Request Process

1. Ensure your branch is up to date with `main`
2. Run linting and tests:
   ```bash
   # Backend
   cd backend && npm run lint && npm test

   # Frontend
   cd frontend && npm run lint && npm run build
   ```
3. Open a PR with a clear title and description:
   - What problem does it solve?
   - What changes were made?
   - Screenshots for UI changes
4. A maintainer will review within a reasonable timeframe
5. Address review feedback in new commits (avoid force-pushing during review)

---

## Security Vulnerabilities

**Do not** open a public GitHub issue for security vulnerabilities. Instead, contact the maintainers directly via email or a private channel. Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact

---

## Code of Conduct

- Be respectful and constructive in all interactions
- Welcome contributors of all experience levels
- Focus feedback on code, not the author
