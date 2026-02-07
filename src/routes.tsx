// src/routes.tsx
import { createBrowserRouter } from 'react-router-dom';

// Pages
import LoginPage from '@/pages/LoginPage';
// import DashboardPage from '@/pages/DashboardPage'; // ← create this later
// import UsersPage from '@/pages/UsersPage';        // your users page
import NotFoundPage from '@/pages/NotFoundPage';

// Layouts (optional)
// import RootLayout from '@/layouts/RootLayout';
// import AuthLayout from '@/layouts/AuthLayout';

export const router = createBrowserRouter([
    {
        path: '/',
        // element: <RootLayout />,           // ← main layout with navbar/sidebar
        // errorElement: <NotFoundPage />,
        children: [
            // Public routes (no auth required)
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                path: 'signup',
                element: <div>Sign up page (create later)</div>,
            },

            // Protected routes (require login)
            //   {
            //     element: <AuthLayout />,        // ← layout that checks auth & redirects
            //     children: [
            //       {
            //         path: 'dashboard',
            //         element: <DashboardPage />,
            //       },
            //       {
            //         path: 'users',
            //         element: <UsersPage />,
            //       },
            //     ],
            //   },

            // Catch-all
            {
                path: '*',
                element: <NotFoundPage />,
            },
        ],
    },
]);