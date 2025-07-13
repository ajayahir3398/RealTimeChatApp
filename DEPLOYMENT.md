# Deployment Guide for Render

## Prerequisites
1. GitHub repository with your code
2. Render account (free tier available)
3. MongoDB Atlas database (already configured)

## Deployment Steps

### 1. Prepare Your Repository
- Ensure all files are committed to GitHub
- Make sure `config.env` is in `.gitignore` (sensitive data)
- Verify `package.json` has correct scripts

### 2. Deploy on Render

#### Option A: Using Render Dashboard
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `chat-app-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### Option B: Using render.yaml (Blueprints)
1. Push your code with `render.yaml` to GitHub
2. Go to Render Dashboard
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will automatically detect and deploy using `render.yaml`

### 3. Environment Variables
Set these in Render Dashboard → Environment:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://superAdminUser:SuperAdmin@cluster0.9ohff.mongodb.net/chatApp?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ALLOWED_ORIGINS=https://your-frontend-domain.onrender.com,http://localhost:4200
```

### 4. Update Frontend
Update your Angular app's Socket.IO connection:

```typescript
// socket.service.ts
this.socket = io('https://your-backend-app.onrender.com', {
  transports: ['websocket', 'polling'],
  autoConnect: true
});
```

### 5. Test Deployment
- Visit your Render URL: `https://your-app-name.onrender.com`
- Test health endpoint: `https://your-app-name.onrender.com/health`
- Test Socket.IO: `https://your-app-name.onrender.com/socket-test`

## Important Notes

1. **Free Tier Limitations**: 
   - Services sleep after 15 minutes of inactivity
   - Cold start takes 30-60 seconds
   - Consider upgrading for production

2. **Environment Variables**:
   - Never commit sensitive data to Git
   - Use Render's environment variable system
   - Update CORS origins for your frontend domain

3. **Socket.IO on Render**:
   - WebSocket connections work on Render
   - Polling fallback is available
   - Consider using sticky sessions for better performance

4. **Database**:
   - MongoDB Atlas is already configured
   - Ensure network access allows Render's IPs

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check `package.json` scripts
2. **Environment Variables**: Verify all required vars are set
3. **CORS Errors**: Update `ALLOWED_ORIGINS` with your frontend domain
4. **Socket.IO Issues**: Check transport configuration

### Logs:
- View logs in Render Dashboard → Logs
- Monitor for connection errors
- Check for environment variable issues

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MONGODB_URI is secure
- [ ] CORS origins are properly configured
- [ ] No sensitive data in code
- [ ] Environment variables are set in Render 