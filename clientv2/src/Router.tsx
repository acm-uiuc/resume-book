import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthRoleEnum, useAuth } from './components/AuthContext';
import { LoginPage } from './pages/Login.page';
import { StudentHomePage } from './pages/student/StudentProfile.page';
import { RecruiterHomePage } from './pages/recruiter/RecruiterHome.page';
import { LogoutPage } from './pages/Logout.page';

const commonRoutes = [
  {
    path: '/force_login',
    element: <LoginPage />,
  },
  {
    path: '/logout',
    element: <LogoutPage />,
  },
];

const authRedirect = [
  {
    path: '/login',
    element: <Navigate to="/" />,
  },
];

const unauthenticatedRouter = createBrowserRouter([
  ...commonRoutes,
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/profile',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/search',
    element: <Navigate to="/login" replace />,
  },
]);

const recruiterRouter = createBrowserRouter([
  ...commonRoutes,
  ...authRedirect,
  {
    path: '/',
    element: <Navigate to="/search" replace />,
  },
  {
    path: '/search',
    element: <RecruiterHomePage />,
  },
]);

const studentRouter = createBrowserRouter([
  ...commonRoutes,
  ...authRedirect,
  {
    path: '/',
    element: <Navigate to="/profile" replace />,
  },
  {
    path: '/profile',
    element: <StudentHomePage />,
  },
]);

export function Router() {
  const { isLoggedIn, userData } = useAuth();
  if (!isLoggedIn || !userData) {
    return <RouterProvider router={unauthenticatedRouter} />;
  }
  if (isLoggedIn && userData.role === AuthRoleEnum.RECRUITER) {
    return <RouterProvider router={recruiterRouter} />;
  }
  if (isLoggedIn && userData.role === AuthRoleEnum.STUDENT) {
    return <RouterProvider router={studentRouter} />;
  }
}
