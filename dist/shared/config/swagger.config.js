import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
const pathParameter = (name) => ({
    in: 'path',
    name,
    required: true,
    schema: { type: 'string' },
});
const operation = (tag, summary, options = {}) => ({
    tags: [tag],
    summary,
    ...(options.publicRoute ? {} : { security: [{ bearerAuth: [] }] }),
    parameters: (options.pathParams || []).map(pathParameter),
    ...(options.requestBody
        ? {
            requestBody: {
                required: true,
                content: {
                    'application/json': { schema: options.requestBody },
                },
            },
        }
        : {}),
    responses: {
        200: { description: 'Request completed successfully.' },
        201: { description: 'Resource created successfully.' },
        400: { description: 'Invalid request or validation failure.' },
        401: { description: 'Authentication required or token invalid.' },
        403: { description: 'Insufficient permissions.' },
        404: { description: 'Resource not found.' },
    },
});
const objectBody = (properties) => ({
    type: 'object',
    required: Object.keys(properties),
    properties,
});
const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Natours API',
            version: '1.0.0',
            description: 'API documentation for tour discovery, authentication, reviews, bookings, and Stripe checkout.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        paths: {
            '/api/v1/users/signup': {
                post: operation('Users', 'Register an account', {
                    publicRoute: true,
                    requestBody: objectBody({
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', format: 'password' },
                        passwordConfirm: { type: 'string', format: 'password' },
                    }),
                }),
            },
            '/api/v1/users/login': {
                post: operation('Users', 'Log in and receive authentication tokens', {
                    publicRoute: true,
                    requestBody: objectBody({
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', format: 'password' },
                    }),
                }),
            },
            '/api/v1/users/login/mfa': {
                post: operation('Users', 'Complete TOTP multi-factor login', {
                    publicRoute: true,
                }),
            },
            '/api/v1/users/refresh-token': {
                post: operation('Users', 'Refresh access and refresh tokens', {
                    publicRoute: true,
                }),
            },
            '/api/v1/users/logout': {
                get: operation('Users', 'Log out and revoke the current session', {
                    publicRoute: true,
                }),
            },
            '/api/v1/users/forgotPassword': {
                post: operation('Users', 'Send a password reset email', {
                    publicRoute: true,
                }),
            },
            '/api/v1/users/resetPassword/{token}': {
                patch: operation('Users', 'Reset a password using an email token', {
                    publicRoute: true,
                    pathParams: ['token'],
                }),
            },
            '/api/v1/users/updatePassword': {
                patch: operation('Users', 'Change the authenticated user password'),
            },
            '/api/v1/users/me': {
                get: operation('Users', 'Get the authenticated user profile'),
            },
            '/api/v1/users/updateMe': {
                patch: operation('Users', 'Update the authenticated user profile'),
            },
            '/api/v1/users/deleteMe': {
                delete: operation('Users', 'Soft-delete the authenticated user account'),
            },
            '/api/v1/users/logout-all': {
                get: operation('Users', 'Revoke all active sessions'),
            },
            '/api/v1/users/sessions': {
                get: operation('Users', 'List active sessions'),
            },
            '/api/v1/users/sessions/{id}': {
                delete: operation('Users', 'Revoke a session', {
                    pathParams: ['id'],
                }),
            },
            '/api/v1/users/mfa/setup': {
                post: operation('Users', 'Generate a TOTP setup secret and QR code'),
            },
            '/api/v1/users/mfa/enable': {
                post: operation('Users', 'Verify a TOTP code and enable MFA'),
            },
            '/api/v1/users/mfa/disable': {
                post: operation('Users', 'Disable MFA after identity verification'),
            },
            '/api/v1/users': {
                get: operation('Users', 'List users (admin or lead guide)'),
                post: operation('Users', 'Create a user (admin or lead guide)'),
            },
            '/api/v1/users/{id}': {
                get: operation('Users', 'Get a user by ID (admin or lead guide)', {
                    pathParams: ['id'],
                }),
                patch: operation('Users', 'Update a user (admin or lead guide)', {
                    pathParams: ['id'],
                }),
                delete: operation('Users', 'Delete a user (admin or lead guide)', {
                    pathParams: ['id'],
                }),
            },
            '/api/v1/tours': {
                get: operation('Tours', 'List tours with filtering and pagination'),
                post: operation('Tours', 'Create a tour (admin or lead guide)'),
            },
            '/api/v1/tours/tour-within/{distance}/center/{latlng}/unit/{unit}': {
                get: operation('Tours', 'Find tours within a geographic radius', {
                    pathParams: ['distance', 'latlng', 'unit'],
                }),
            },
            '/api/v1/tours/distances/{latlng}/unit/{unit}': {
                get: operation('Tours', 'Calculate distances to tour start locations', {
                    pathParams: ['latlng', 'unit'],
                }),
            },
            '/api/v1/tours/{id}': {
                get: operation('Tours', 'Get a tour by ID', {
                    pathParams: ['id'],
                }),
                patch: operation('Tours', 'Update a tour (admin or lead guide)', {
                    pathParams: ['id'],
                }),
                delete: operation('Tours', 'Delete a tour (admin or lead guide)', {
                    pathParams: ['id'],
                }),
            },
            '/api/v1/tours/{tourId}/reviews': {
                get: operation('Reviews', 'List reviews for a tour', {
                    pathParams: ['tourId'],
                }),
                post: operation('Reviews', 'Create a review for a tour', {
                    pathParams: ['tourId'],
                }),
            },
            '/api/v1/tours/{tourId}/reviews/{id}': {
                get: operation('Reviews', 'Get a tour review by ID', {
                    pathParams: ['tourId', 'id'],
                }),
                patch: operation('Reviews', 'Update an owned review or an admin review', {
                    pathParams: ['tourId', 'id'],
                }),
                delete: operation('Reviews', 'Delete an owned review or an admin review', {
                    pathParams: ['tourId', 'id'],
                }),
            },
            '/api/v1/reviews': {
                get: operation('Reviews', 'List reviews'),
                post: operation('Reviews', 'Create a review for a tour'),
            },
            '/api/v1/reviews/{id}': {
                get: operation('Reviews', 'Get a review by ID', {
                    pathParams: ['id'],
                }),
                patch: operation('Reviews', 'Update an owned review or an admin review', {
                    pathParams: ['id'],
                }),
                delete: operation('Reviews', 'Delete an owned review or an admin review', {
                    pathParams: ['id'],
                }),
            },
            '/api/v1/bookings/checkout-session/{tourID}': {
                get: operation('Bookings', 'Create a Stripe checkout session', {
                    pathParams: ['tourID'],
                }),
            },
            '/api/v1/bookings': {
                get: operation('Bookings', 'List bookings (admin or lead guide)'),
                post: operation('Bookings', 'Create a booking (admin or lead guide)'),
            },
            '/api/v1/bookings/{id}': {
                get: operation('Bookings', 'Get a booking by ID (admin or lead guide)', {
                    pathParams: ['id'],
                }),
                patch: operation('Bookings', 'Update a booking (admin or lead guide)', {
                    pathParams: ['id'],
                }),
                delete: operation('Bookings', 'Delete a booking (admin or lead guide)', {
                    pathParams: ['id'],
                }),
            },
            '/webhook-checkout': {
                post: operation('Payments', 'Receive and verify Stripe checkout events', {
                    publicRoute: true,
                }),
            },
        },
    },
    apis: [],
};
export const swaggerSpec = swaggerJsdoc(options);
export const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
