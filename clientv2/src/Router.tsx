import React, { useState, useEffect, ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthRoleEnum, useAuth } from './components/AuthContext';
import { LoginPage } from './pages/Login.page';
import { StudentHomePage } from './pages/student/StudentProfile.page';
import { RecruiterHomePage } from './pages/recruiter/RecruiterHome.page';
import { LogoutPage } from './pages/Logout.page';
import { Error404Page } from './pages/Error404.page';
import { Error500Page } from './pages/Error500.page';

const commonRoutes = [
  {
    path: '/force_login',
    element: <LoginPage />,
  },
  {
    path: '/logout',
    element: <LogoutPage />,
  },
  {
    path: '*',
    element: <Error404Page />,
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

interface ErrorBoundaryProps {
  children: ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const onError = (errorObj: Error) => {
    setHasError(true);
    setError(errorObj);
  };

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      onError(event.error);
    };
    window.addEventListener('error', errorHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  if (hasError && error) {
    if (error.message === '404') {
      return <Error404Page />;
    }
    return <Error500Page />;
  }

  return <>{children}</>;
};

export const Router: React.FC = () => {
  const { isLoggedIn, userData } = useAuth();

  const router =
    !isLoggedIn || !userData
      ? unauthenticatedRouter
      : userData.role === AuthRoleEnum.RECRUITER
        ? recruiterRouter
        : studentRouter;

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};
