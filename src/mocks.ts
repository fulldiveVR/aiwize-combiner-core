

export const MOCK_CONTEXT = [
  {
    id: '1',
    name: 'Getting Started with React',
    content: `# Getting Started with React

React is a JavaScript library for building user interfaces. It allows developers to create reusable UI components and manage application state efficiently.

## Key Concepts

• **Components**: Building blocks of React applications
• **JSX**: JavaScript syntax extension for writing HTML-like code
• **State**: Data that changes over time in your component
• **Props**: Data passed from parent to child components

## Basic Example

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

function App() {
  return <Welcome name="World" />;
}
\`\`\`

## Getting Started

1. Create a new React app: \`npx create-react-app my-app\`
2. Navigate to directory: \`cd my-app\`
3. Start development server: \`npm start\``,
    category: 'tutorial',
    tags: ['react', 'javascript', 'frontend', 'ui'],
    updatedAt: '2024-01-15T10:30:00.000Z'
  },
  {
    id: '2',
    name: 'Node.js Best Practices',
    content: `# Node.js Best Practices

Node.js is a runtime environment that allows you to run JavaScript on the server side. Here are some best practices for building scalable Node.js applications.

## Performance Best Practices

### 1. Use Asynchronous Programming
- Prefer \`async/await\` over callbacks
- Use Promises for better error handling
- Avoid blocking the event loop

### 2. Error Handling
\`\`\`javascript
// Good: Proper error handling
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  logger.error('Operation failed:', error);
  throw error;
}
\`\`\`

### 3. Environment Configuration
- Use environment variables for configuration
- Never commit sensitive data to version control
- Use \`.env\` files for local development

### 4. Security
- Keep dependencies updated
- Use helmet.js for basic security headers
- Implement rate limiting
- Validate and sanitize user input

### 5. Monitoring and Logging
- Implement structured logging
- Monitor application performance
- Set up health check endpoints`,
    category: 'guide',
    tags: ['nodejs', 'javascript', 'backend', 'server'],
    updatedAt: '2024-01-20T14:15:00.000Z'
  },
  {
    id: '3',
    name: 'Database Design Principles',
    content: `# Database Design Principles

Good database design is crucial for application performance. This document covers normalization, indexing, and query optimization techniques.

## Core Principles

### 1. Normalization
- **1NF**: Eliminate repeating groups
- **2NF**: Eliminate redundant data
- **3NF**: Eliminate columns not dependent on primary key

### 2. Indexing Strategy
\`\`\`sql
-- Create indexes on frequently queried columns
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_order_date ON orders(created_at);

-- Composite indexes for multi-column queries
CREATE INDEX idx_user_status_date ON users(status, created_at);
\`\`\`

### 3. Query Optimization
- Use EXPLAIN to analyze query execution plans
- Avoid SELECT * in production queries
- Use appropriate JOIN types
- Consider query caching strategies

### 4. Data Types
- Choose appropriate data types for storage efficiency
- Use fixed-length types when possible
- Consider timezone handling for datetime fields

### 5. Constraints and Relationships
- Define foreign key constraints
- Use check constraints for data validation
- Implement proper cascade rules`,
    category: 'reference',
    tags: ['database', 'sql', 'design', 'performance'],
    updatedAt: '2024-01-18T09:45:00.000Z'
  },
  {
    id: '4',
    name: 'TypeScript Migration Guide',
    content: `# TypeScript Migration Guide

Migrating from JavaScript to TypeScript can improve code quality and developer experience. This guide covers the step-by-step process.

## Migration Strategy

### Phase 1: Setup
1. Install TypeScript and types
\`\`\`bash
npm install -D typescript @types/node
npx tsc --init
\`\`\`

2. Configure \`tsconfig.json\`
\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true
  }
}
\`\`\`

### Phase 2: Gradual Migration
- Rename \`.js\` files to \`.ts\` incrementally
- Start with utility functions and models
- Add type annotations gradually

### Phase 3: Type Definitions
\`\`\`typescript
// Define interfaces for data structures
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Use generic types for reusability
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
\`\`\`

### Best Practices
- Enable strict mode from the beginning
- Use union types instead of \`any\`
- Leverage type guards for runtime checks
- Document complex types with comments`,
    category: 'tutorial',
    tags: ['typescript', 'javascript', 'migration', 'types'],
    updatedAt: '2024-01-22T16:20:00.000Z'
  },
  {
    id: '5',
    name: 'API Documentation Standards',
    content: `# API Documentation Standards

Well-documented APIs are essential for team collaboration. This document outlines standards for REST API documentation using OpenAPI specifications.

## OpenAPI Structure

### Basic Information
\`\`\`yaml
openapi: 3.0.0
info:
  title: User Management API
  version: 1.0.0
  description: API for managing user accounts and profiles
servers:
  - url: https://api.example.com/v1
\`\`\`

### Path Documentation
\`\`\`yaml
paths:
  /users:
    get:
      summary: List all users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
\`\`\`

## Documentation Standards

### 1. Consistent Naming
- Use kebab-case for endpoints
- Use camelCase for JSON properties
- Be descriptive but concise

### 2. Error Responses
- Document all possible error codes
- Provide example error responses
- Include error message formats

### 3. Examples
- Provide request/response examples
- Include edge cases
- Show authentication examples`,
    category: 'standard',
    tags: ['api', 'documentation', 'rest', 'openapi'],
    updatedAt: '2024-01-17T11:00:00.000Z'
  },
  {
    id: '6',
    name: 'Docker Container Best Practices',
    content: `# Docker Container Best Practices

Docker containers provide consistent deployment environments. Learn how to optimize Docker images and manage container lifecycles effectively.

## Dockerfile Optimization

### Multi-stage Builds
\`\`\`dockerfile
# Build stage
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:16-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

### Image Size Optimization
- Use Alpine Linux base images
- Remove unnecessary packages after installation
- Use .dockerignore to exclude files
- Combine RUN commands to reduce layers

### Security Best Practices
- Don't run containers as root
- Use specific version tags, avoid 'latest'
- Scan images for vulnerabilities
- Keep base images updated

## Container Management

### Health Checks
\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1
\`\`\`

### Resource Limits
\`\`\`yaml
# docker-compose.yml
services:
  app:
    image: myapp:latest
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
\`\`\``,
    category: 'guide',
    tags: ['docker', 'containers', 'deployment', 'devops'],
    updatedAt: '2024-01-25T13:30:00.000Z'
  },
  {
    id: '7',
    name: 'CSS Grid Layout Fundamentals',
    content: `# CSS Grid Layout Fundamentals

CSS Grid is a powerful layout system for web pages. This document explains the fundamentals of grid containers, grid items, and responsive design.

## Grid Container Setup

### Basic Grid
\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  height: 100vh;
}
\`\`\`

### Named Grid Lines
\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: [sidebar-start] 250px [sidebar-end main-start] 1fr [main-end];
  grid-template-rows: [header-start] 60px [header-end content-start] 1fr [content-end];
}
\`\`\`

## Grid Areas

### Template Areas
\`\`\`css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 150px;
  grid-template-rows: 60px 1fr 40px;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
\`\`\`

## Responsive Design

### Auto-fit and Auto-fill
\`\`\`css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
\`\`\`

### Media Queries
\`\`\`css
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
  }
}
\`\`\``,
    category: 'tutorial',
    tags: ['css', 'grid', 'layout', 'frontend', 'responsive'],
    updatedAt: '2024-01-12T08:15:00.000Z'
  },
  {
    id: '8',
    name: 'Security Checklist for Web Applications',
    content: `# Security Checklist for Web Applications

Security should be a top priority in web development. This checklist covers common vulnerabilities and mitigation strategies.

## OWASP Top 10 Vulnerabilities

### 1. Injection Attacks
**Prevention:**
- Use parameterized queries/prepared statements
- Validate and sanitize all user input
- Use ORM/ODM frameworks with built-in protection

\`\`\`javascript
// ❌ Vulnerable to SQL injection
const query = \`SELECT * FROM users WHERE id = \${userId}\`;

// ✅ Safe parameterized query
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
\`\`\`

### 2. Cross-Site Scripting (XSS)
**Prevention:**
- Escape output data
- Use Content Security Policy (CSP)
- Validate input on both client and server

### 3. Cross-Site Request Forgery (CSRF)
**Prevention:**
- Use CSRF tokens
- Implement SameSite cookie attributes
- Verify referrer headers

## Authentication & Authorization

### Password Security
- Enforce strong password policies
- Use bcrypt or similar for hashing
- Implement account lockout mechanisms
- Enable two-factor authentication

### Session Management
\`\`\`javascript
// Secure session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  secure: true, // HTTPS only
  httpOnly: true, // Prevent XSS
  sameSite: 'strict' // CSRF protection
}));
\`\`\`

## Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement proper access controls
- Regular security audits and penetration testing`,
    category: 'reference',
    tags: ['security', 'web', 'vulnerabilities', 'checklist'],
    updatedAt: '2024-01-21T12:45:00.000Z'
  },
  {
    id: '9',
    name: 'Git Workflow Guidelines',
    content: `# Git Workflow Guidelines

Effective Git workflows improve team collaboration and code quality. This document covers branching strategies, commit conventions, and merge practices.

## Branching Strategy

### GitFlow Model
\`\`\`
main (production)
├── develop (integration)
    ├── feature/user-authentication
    ├── feature/payment-integration
    └── hotfix/critical-bug-fix
\`\`\`

### Branch Naming Conventions
- **feature/**: New features (\`feature/user-profile\`)
- **bugfix/**: Bug fixes (\`bugfix/login-error\`)
- **hotfix/**: Critical production fixes (\`hotfix/security-patch\`)
- **release/**: Release preparation (\`release/v1.2.0\`)

## Commit Conventions

### Conventional Commits
\`\`\`
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
\`\`\`

### Commit Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
\`\`\`
feat(auth): add password reset functionality

fix(api): resolve user data validation error

docs(readme): update installation instructions

refactor(utils): simplify date formatting functions
\`\`\`

## Merge Practices

### Pull Request Guidelines
1. Create descriptive PR titles and descriptions
2. Link related issues
3. Request appropriate reviewers
4. Ensure CI/CD passes
5. Squash commits before merging

### Code Review Checklist
- Code follows project standards
- Tests are included and passing
- Documentation is updated
- No security vulnerabilities
- Performance considerations addressed`,
    category: 'standard',
    tags: ['git', 'workflow', 'collaboration', 'version-control'],
    updatedAt: '2024-01-19T15:10:00.000Z'
  },
  {
    id: '10',
    name: 'Performance Optimization Techniques',
    content: `# Performance Optimization Techniques

Application performance directly impacts user experience. This comprehensive guide covers frontend and backend optimization strategies.

## Frontend Optimization

### 1. Code Splitting
\`\`\`javascript
// Dynamic imports for code splitting
const LazyComponent = lazy(() => import('./LazyComponent'));

// Route-based code splitting
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
\`\`\`

### 2. Image Optimization
- Use modern formats (WebP, AVIF)
- Implement responsive images
- Add lazy loading
- Optimize image sizes

\`\`\`html
<img
  src="image.webp"
  alt="Description"
  loading="lazy"
  srcset="image-320w.webp 320w, image-640w.webp 640w"
  sizes="(max-width: 320px) 280px, 640px"
>
\`\`\`

### 3. Caching Strategies
- Browser caching with proper headers
- Service workers for offline functionality
- CDN for static assets
- Application-level caching

## Backend Optimization

### 1. Database Performance
\`\`\`sql
-- Use indexes for frequently queried columns
CREATE INDEX idx_user_email ON users(email);

-- Optimize queries with EXPLAIN
EXPLAIN SELECT * FROM orders
WHERE user_id = 123 AND status = 'active';
\`\`\`

### 2. API Optimization
- Implement response caching
- Use database connection pooling
- Optimize N+1 query problems
- Implement pagination for large datasets

### 3. Server-Side Caching
\`\`\`javascript
// Redis caching example
const cached = await redis.get(\`user:\${userId}\`);
if (cached) {
  return JSON.parse(cached);
}

const user = await database.getUser(userId);
await redis.setex(\`user:\${userId}\`, 3600, JSON.stringify(user));
return user;
\`\`\`

## Monitoring and Metrics

### Key Performance Indicators
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Performance Monitoring Tools
- Google PageSpeed Insights
- Lighthouse
- WebPageTest
- Application Performance Monitoring (APM) tools`,
    category: 'guide',
    tags: ['performance', 'optimization', 'frontend', 'backend'],
    updatedAt: '2024-01-23T10:25:00.000Z'
  }
];