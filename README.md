## Seller Approval System

The application includes a seller approval system that restricts access to seller features. Users with approved email addresses or admin privileges can access the seller dashboard and create listings.

### How to configure approved sellers:

1. In your `.env.local` file, add approved seller email addresses:

```
NEXT_PUBLIC_APPROVED_SELLER_EMAILS=seller@riftbattle.com,user@example.com
```

2. Multiple email addresses should be comma-separated.

3. When a user signs in with an approved email address, they will automatically see the seller dashboard buttons in the navigation menu.

### How to configure admin users:

1. In your `.env.local` file, add admin email addresses:

```
NEXT_PUBLIC_ADMIN_EMAILS=admin@riftbattle.com,superadmin@riftbattle.com
```

2. Multiple email addresses should be comma-separated.

3. Admin users automatically have access to all seller features in addition to administrative capabilities.

4. For production, we recommend using a database-driven approach for seller and admin approval rather than environment variables.

## Running in Production Mode

To run the application in production mode:

1. First, build the application:
```
npm run build
```

2. Then start the production server:
```
NODE_ENV=production npm run start
```

Or use the combined command:
```
NODE_ENV=production npm run prod
```

For Windows users:
```
set NODE_ENV=production && npm run prod
```

In production mode:
- Development features are disabled
- Error details are hidden
- Performance is optimized
- Development banner is removed

## Deployment Recommendations

For production deployment, we recommend:
1. Using environment variables stored securely in your hosting platform
2. Implementing database storage for approved seller emails rather than environment variables
3. Setting up proper SSL certificates for secure connections
4. Configuring proper caching headers for static assets 