# Google OIDC Authentication Implementation Plan for WOD-GPT

## Overview
This plan outlines implementing basic user login using Azure Static Web Apps with Google as the OIDC identity provider. The implementation will be minimal and non-intrusive to the existing workout generation functionality.

## Prerequisites & External Setup Required

### 1. Azure Static Web Apps Plan Verification
- **Action Required**: Verify your Azure Static Web Apps is on the **Standard plan**
- **Why**: Custom authentication is only available on Standard plan, not the free tier
- **How to Check**: In Azure Portal → Your Static Web App → Overview → Plan should show "Standard"
- **Cost**: Standard plan has usage-based pricing

### 2. Google Cloud Console Setup
- **Action Required**: Set up OAuth 2.0 credentials in Google Cloud Console
- **Steps**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create a new project or select existing one
  3. Enable Google+ API or Google OAuth2 API
  4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
  5. Set Application type to "Web application"
  6. Configure Authorized redirect URIs:
     - For local development: `http://localhost:4280/.auth/login/google/callback`
     - For production: `https://your-app-name.azurestaticapps.net/.auth/login/google/callback`
  7. Save and note down the **Client ID** and **Client Secret**

### 3. Azure Application Settings Configuration
- **Action Required**: Add secrets to Azure Static Web Apps
- **Steps**:
  1. In Azure Portal → Your Static Web App → Configuration
  2. Add Application Settings:
     - `GOOGLE_CLIENT_ID`: [Your Google Client ID]
     - `GOOGLE_CLIENT_SECRET`: [Your Google Client Secret]

## Implementation Plan

### Phase 1: Configuration Setup
1. **Create/Update staticwebapp.config.json**
   - Add auth section with Google OIDC provider configuration
   - Configure authentication routes and policies
   - Set up proper redirects

### Phase 2: TypeScript Types & Interfaces
2. **Create Authentication Types**
   - Define user interface for client principal data
   - Create authentication state types
   - Add claim and role type definitions

### Phase 3: Authentication Context & Hooks
3. **Authentication Context Provider**
   - Create React context for authentication state
   - Implement user data fetching from `/.auth/me` endpoint
   - Handle authentication status management

4. **Custom Authentication Hooks**
   - `useAuth` hook for accessing authentication context
   - `useUser` hook for user data access
   - Login/logout utility functions

### Phase 4: UI Components
5. **Authentication Components**
   - Login button component
   - Logout button component  
   - User profile display component
   - Conditional rendering wrapper components

6. **UI Integration**
   - Add authentication controls to header/navigation area
   - Position near existing dark mode toggle
   - Ensure responsive design for mobile

### Phase 5: App Integration
7. **App.tsx Updates**
   - Wrap app with authentication provider
   - Integrate authentication components into layout
   - Handle authentication state in main app component

8. **Optional Route Protection**
   - Implement protected component wrapper (for future features)
   - Add authentication guards if needed

### Phase 6: Testing & Validation
9. **Local Development Testing**
   - Test authentication flow using SWA CLI emulator
   - Verify Google login/logout functionality
   - Test user data retrieval

10. **Production Deployment Testing**
    - Deploy to Azure Static Web Apps
    - Verify Google OIDC integration works in production
    - Test redirect flows and user experience

## Technical Implementation Details

### Authentication Flow
1. User clicks "Login with Google" button
2. Redirected to `/.auth/login/google`
3. Google handles OAuth2 authentication
4. User redirected back to app with authentication cookie
5. App fetches user info from `/.auth/me` endpoint
6. Authentication state updated throughout app

### Key Files to Create/Modify
- `staticwebapp.config.json` - Authentication configuration
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/hooks/useAuth.ts` - Authentication hooks
- `src/components/auth/` - Authentication UI components
- `src/types/auth.ts` - Authentication TypeScript types
- `src/App.tsx` - Integration of authentication provider

### Security Considerations
- Client secrets stored securely in Azure app settings
- No sensitive data in source code
- Proper HTTPS redirect URIs
- User data handled according to privacy best practices

## Development Workflow
1. Set up external prerequisites (Google Console, Azure settings)
2. Implement configuration files
3. Build authentication infrastructure (context, hooks)
4. Create UI components
5. Integrate into main application
6. Test locally with SWA CLI
7. Deploy and test in production

## Potential Future Enhancements
- Save user workout preferences
- Workout history tracking
- Personal workout favorites
- Social sharing features
- User-specific movement preferences

## Notes
- Authentication will be completely optional - app works fully without login
- No existing functionality will be affected
- Clean, minimal UI integration
- TypeScript-first implementation following project conventions
- Mobile-responsive design matching existing UI patterns