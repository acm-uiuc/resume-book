import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import { AuthRoleEnum, useAuth } from './components/AuthContext';
import { LoginPage } from './pages/Login.page';
import { StudentHomePage } from './pages/student/StudentHome.page';
import { RecruiterHomePage } from './pages/recruiter/RecruiterHome.page';

const unauthenticatedRouter = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
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
]);

const studentRouter = createBrowserRouter([
  {
    path: '/',
    element: <StudentHomePage />,
  },
  {
    path: '/login',
    element: <Navigate to="/" replace />,
  },
]);

export function Router() {
  const { isLoggedIn, userData } = useAuth();
  if (!isLoggedIn || !userData) {
    return <RouterProvider router={unauthenticatedRouter} />;
  } if (isLoggedIn && userData.role === AuthRoleEnum.RECRUITER) {
    return <RouterProvider router={recruiterRouter} />;
  } if (isLoggedIn && userData.role === AuthRoleEnum.STUDENT) {
    return <RouterProvider router={studentRouter} />;
  }
}
