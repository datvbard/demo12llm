# Deployment Guide

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Database Setup

1. Create PostgreSQL database
2. Run migrations:
```bash
npx prisma migrate deploy
```
3. Seed data (optional):
```bash
npx prisma db seed
```

## Build & Run

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run start
```

## Vercel Deployment

1. Push code to GitHub
2. Connect repository in Vercel
3. Add environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_URL` - Your Vercel domain
   - `NEXTAUTH_SECRET` - Generate with openssl
4. Deploy

After deployment, seed the database:
```bash
npx prisma db seed
```

## Railway Deployment

1. Create PostgreSQL service on Railway
2. Create Next.js service on Railway
3. Link services
4. Add environment variables
5. Deploy

## Security Checklist

- [ ] Passwords hashed with bcrypt
- [ ] Session tokens secure (httpOnly cookies)
- [ ] CSRF protection enabled (NextAuth default)
- [ ] All API routes verify session
- [ ] HTTPS enabled in production
- [ ] No credentials in code
- [ ] Rate limiting considered

## Performance Checklist

- [ ] Prisma queries optimized (include/select)
- [ ] Indexes on foreign keys
- [ ] Pagination for large lists
- [ ] Autosave debounced (500ms)

## Troubleshooting

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Database Connection
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure database exists

### Session Issues
- Clear cookies
- Verify NEXTAUTH_URL matches your domain
- Regenerate NEXTAUTH_SECRET
