import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthRoleEnum, useAuth } from './components/AuthContext';
import { LoginPage } from './pages/Login.page';
import { StudentHomePage } from './pages/student/StudentProfile.page';
import { RecruiterHomePage } from './pages/recruiter/RecruiterHome.page';
import { ViewStudentProfile } from './pages/recruiter/ViewStudentProfile.page';

const unauthenticatedRouter = createBrowserRouter([
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
]);

const recruiterRouter = createBrowserRouter([
  {
    path: '/',
    element: <RecruiterHomePage />,
  },
  {
    path: '/login',
    element: <Navigate to="/" replace />,
  },
  {
    path: '/studentprofile/:username',
    element: <ViewStudentProfile />,
  },
]);

const studentRouter = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/profile" replace />,
  },
  {
    path: '/login',
    element: <Navigate to="/" replace />,
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
