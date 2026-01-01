# Bug Fixes - Production Deployment Issues

## Summary

Fixed four critical bugs that would cause the application to fail in production EC2 deployments or result in poor error handling.

---

## Bug 1: Duplicate BASE_URL Definitions ✅ FIXED

### Issue
The `api.js` module defined its own `BASE_URL` constant instead of importing from `config.js`, creating two independent definitions that could become out of sync.

### Impact
- In production, if `REACT_APP_API_URL` wasn't properly set during build, `api.js` would hardcode `http://localhost:3000`
- Other components using `config.js` would use the correct value
- This caused API calls from `api.js` to fail in production

### Fix
**File**: `inventory-frontend/src/api/api.js`

**Before**:
```javascript
// Use environment variable or fallback to localhost
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
```

**After**:
```javascript
import { BASE_URL } from '../config.js';
```

**Result**: All components now use the single source of truth from `config.js`.

---

## Bug 2: Missing Environment Variable in Build Process ✅ FIXED

### Issue
Both GitHub Actions workflow and `deploy.sh` script ran `npm run build` without setting the `REACT_APP_API_URL` environment variable.

### Impact
- React's build process requires environment variables at **build time** to be embedded in compiled JavaScript
- Without it, the frontend falls back to `http://localhost:3000`
- API calls fail on EC2 with wrong hostname
- Application appears to work locally but fails in production

### Fix

#### GitHub Actions (`.github/workflows/deploy.yml`)

**Before**:
```yaml
# Update frontend
cd inventory-frontend
npm install
npm run build
```

**After**:
```yaml
# Update frontend
cd inventory-frontend
npm install

# Get EC2 public IP for frontend build
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Build with environment variable
REACT_APP_API_URL=http://$EC2_IP npm run build
```

#### Deploy Script (`deploy.sh`)

**Before**:
```bash
# Build frontend
echo -e "${BLUE}🏗️  Building React app...${NC}"
npm run build
```

**After**:
```bash
# Get EC2 public IP for frontend build
echo -e "${BLUE}🌐 Detecting EC2 public IP...${NC}"
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "localhost")
echo -e "${BLUE}   Using API URL: http://$EC2_IP${NC}"

# Build frontend with environment variable
echo -e "${BLUE}🏗️  Building React app...${NC}"
REACT_APP_API_URL=http://$EC2_IP npm run build
```

**Result**: Frontend builds with correct API URL embedded in JavaScript.

---

## Bug 3: Unreliable Relative Path Navigation ⚠️ PARTIALLY FIXED

### Issue
The secondary "home" button used `navigate('../')` which is unreliable in React Router v7+.

### Impact
- Relative path behavior depends on exact URL path and route matching
- From `/customer/:customerId/job/:jobId/materials`, `navigate('../')` may not reach intended destination
- Inconsistent navigation behavior across different routes

### Fix

**Files**: 
- `inventory-frontend/src/components/CustomerJobs.js`
- `inventory-frontend/src/components/JobDetails.js`
- `inventory-frontend/src/components/JobMaterials.js`

**Before**:
```javascript
<button
    onClick={() => navigate(`../`)}
    style={styles.backButton}
>
    <svg>...</svg>
</button>
```

**After**:
```javascript
<button
    onClick={() => navigate('/')}
    style={styles.backButton}
    title="Go to Dashboard"
>
    <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="currentColor"
    >
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
</button>
```

**Changes**:
- Changed `navigate('../')` to `navigate('/')` for absolute path to dashboard
- Added `title` attribute for accessibility
- Updated SVG path to better represent "home" icon
- Consistent behavior across all routes

**Result**: Reliable navigation to dashboard from any page.

**Note**: `CustomerJobs.js` was reverted to use `navigate('../')` - this may cause navigation issues depending on your URL structure.

---

## Bug 4: Missing HTTP Error Checks Before JSON Parsing ✅ FIXED

### Issue
The `fetchCustomers` and `fetchAllJobs` functions in Dashboard.js, and all functions in `api.js`, called `res.json()` without checking `res.ok` first.

### Impact
- If API returns error status (401, 404, 500, etc.), code attempts to parse error response as JSON
- Error responses may not be valid JSON, causing parsing exceptions
- Users receive no feedback about HTTP failures vs. data parsing errors
- Difficult to debug authentication failures, server errors, or network issues
- Silent failures make troubleshooting production issues harder

### Fix

#### Dashboard.js

**Before**:
```javascript
const fetchCustomers = async () => {
    try {
        const res = await fetch(`${BASE_URL}/customers/${user.id}`);
        const data = await res.json();
        // ...
    } catch (err) {
        console.error("Error fetching customers:", err);
    }
};
```

**After**:
```javascript
const fetchCustomers = async () => {
    try {
        const res = await fetch(`${BASE_URL}/customers/${user.id}`);
        
        if (!res.ok) {
            console.error(`Error fetching customers: HTTP ${res.status} ${res.statusText}`);
            setCustomers([]);
            return;
        }
        
        const data = await res.json();
        // ...
    } catch (err) {
        console.error("Error fetching customers:", err);
    }
};
```

**fetchAllJobs** - Same pattern:
- Check `res.ok` before parsing
- Use `continue` instead of breaking for individual customer failures
- Provides clear HTTP status in error messages

#### api.js

**Before**:
```javascript
export const getUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
};
```

**After**:
```javascript
export const getUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
};
```

Applied to all 4 functions in `api.js`:
- `getUsers()`
- `addUser()`
- `getInventory()`
- `addInventory()`

**Result**: 
- Proper HTTP error detection before JSON parsing
- Clear error messages with status codes
- Better debugging in production
- Prevents JSON parsing errors on non-JSON responses

---

## Impact Summary

| Bug | Severity | Impact | Status |
|-----|----------|--------|--------|
| Duplicate BASE_URL | High | API calls fail in production | ✅ Fixed |
| Missing env var in build | Critical | All API calls fail in production | ✅ Fixed |
| Unreliable navigation | Medium | Inconsistent UX, wrong navigation | ⚠️ Partial (CustomerJobs reverted) |
| Missing HTTP error checks | High | Silent failures, poor error handling | ✅ Fixed |

---

## Files Modified

1. `inventory-frontend/src/api/api.js` - Import BASE_URL from config + HTTP error checks
2. `.github/workflows/deploy.yml` - Set REACT_APP_API_URL during build
3. `deploy.sh` - Set REACT_APP_API_URL during build
4. `inventory-frontend/src/components/CustomerJobs.js` - Absolute navigation path (REVERTED by user)
5. `inventory-frontend/src/components/JobDetails.js` - Absolute navigation path
6. `inventory-frontend/src/components/JobMaterials.js` - Absolute navigation path
7. `inventory-frontend/src/components/Dashboard.js` - HTTP error checks added

---

## Why These Bugs Were Critical

1. **Bug 1 & 2**: Would cause complete application failure in production
   - Frontend would attempt to call `http://localhost:3000` from browser
   - Browser can't reach EC2's localhost
   - All API calls fail
   - Application unusable

2. **Bug 3**: Would cause user confusion and poor UX
   - Users might end up on wrong pages
   - Inconsistent navigation behavior
   - Difficult to debug

3. **Bug 4**: Would hide production errors and make debugging difficult
   - Authentication failures silent
   - Server errors not properly reported
   - JSON parsing errors on error responses
   - No visibility into API failures

---

## Testing Recommendations

### Local Testing
1. Build frontend locally:
   ```bash
   cd inventory-frontend
   REACT_APP_API_URL=http://localhost:3000 npm run build
   ```

2. Verify API calls work in production build

### EC2 Testing
1. Deploy to EC2 using updated scripts
2. Verify all API calls resolve to correct EC2 IP
3. Test navigation from all pages
4. Check browser console for any localhost references

### Verification
```bash
# After deployment, check compiled JavaScript
grep -r "localhost:3000" inventory-frontend/build/static/js/
# Should return NO results

# Check what URL is compiled in
grep -r "http://" inventory-frontend/build/static/js/ | grep -v "//fonts" | grep -v "//maps"
# Should show your EC2 IP, not localhost
```

---

## Impact Summary

| Bug | Severity | Impact | Status |
|-----|----------|--------|--------|
| Duplicate BASE_URL | High | API calls fail in production | ✅ Fixed |
| Missing env var in build | Critical | All API calls fail in production | ✅ Fixed |
| Unreliable navigation | Medium | Inconsistent UX, wrong navigation | ✅ Fixed |

---

## Files Modified

1. `inventory-frontend/src/api/api.js` - Import BASE_URL from config
2. `.github/workflows/deploy.yml` - Set REACT_APP_API_URL during build
3. `deploy.sh` - Set REACT_APP_API_URL during build
4. `inventory-frontend/src/components/CustomerJobs.js` - Absolute navigation path
5. `inventory-frontend/src/components/JobDetails.js` - Absolute navigation path
6. `inventory-frontend/src/components/JobMaterials.js` - Absolute navigation path

---

## Why These Bugs Were Critical

1. **Bug 1 & 2**: Would cause complete application failure in production
   - Frontend would attempt to call `http://localhost:3000` from browser
   - Browser can't reach EC2's localhost
   - All API calls fail
   - Application unusable

2. **Bug 3**: Would cause user confusion and poor UX
   - Users might end up on wrong pages
   - Inconsistent navigation behavior
   - Difficult to debug

---

## Prevention

To prevent similar issues in the future:

1. **Single Source of Truth**: Always import shared constants, never duplicate
2. **Build-Time Variables**: Remember React env vars must be set at build time
3. **Absolute Paths**: Use absolute paths (`/`) or explicit routes, avoid relative paths
4. **HTTP Error Checking**: Always check `res.ok` before parsing response
5. **Error Handling**: Provide clear error messages with status codes
6. **Testing**: Always test production builds, not just dev mode
7. **Documentation**: Document environment variable requirements clearly

---

## Related Documentation

- See `deploy-to-ec2.md` for complete deployment guide
- See `TROUBLESHOOTING.md` for debugging API connection issues
- See `EC2-QUICKSTART.md` for environment variable setup

---

**Status**: All bugs fixed except Bug 3 (partially - CustomerJobs.js reverted) ✅  
**Date**: January 2026  
**Verified**: Linter checks passed

