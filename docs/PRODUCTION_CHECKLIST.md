# Production Checklist

## Security

- [ ] All secrets in environment variables, never in code
- [ ] JWT secret is strong and unique per environment
- [ ] CORS origins restricted to production domains
- [ ] Rate limiting on auth endpoints
- [ ] HTTPS enforced in production
- [ ] SQL injection prevented (SQLAlchemy parameterized queries)
- [ XSS protection via React's default escaping]
- [ ] File upload size limits enforced
- [ ] File type validation on uploads
- [ ] Row Level Security enabled on all tables
- [ ] Google OAuth tokens verified server-side
- [ ] No sensitive data in logs

## Performance

- [ ] Database indexes on frequently queried columns
- [ ] Connection pooling configured (asyncpg pool)
- [ ] Frontend: Next.js static generation where possible
- [ ] Frontend: Image optimization enabled
- [ ] Backend: Async I/O throughout
- [ ] Streaming responses for LLM output
- [ ] ChromaDB: HNSW index for vector search
- [ ] Lazy loading on frontend routes

## Reliability

- [ ] Health check endpoint (`/health`)
- [ ] Graceful error handling with proper HTTP codes
- [ ] Database migration strategy (Alembic)
- [ ] Docker health checks configured
- [ ] Auto-restart on failure (Railway/Render)
- [ ] No hardcoded values

## Code Quality

- [ ] No placeholder implementations
- [ ] Type safety throughout (TypeScript + Pydantic)
- [ ] Consistent code style
- [ ] No duplicate code
- [ ] Comments where helpful only
- [ ] Tests for critical paths

## Accessibility

- [ ] Semantic HTML elements
- [ ] Keyboard navigation support
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Alt text for images
- [ ] Form labels associated with inputs

## Developer Experience

- [ ] Clear README with setup instructions
- [ ] .env.example files provided
- [ ] API documentation (Swagger/ReDoc)
- [ ] CI/CD pipeline running tests
- [ ] Docker setup for local development
