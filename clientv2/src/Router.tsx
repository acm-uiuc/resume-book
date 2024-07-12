import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { HomePage } from "./pages/Home.page";
import { AuthRoleEnum, useAuth } from "./components/AuthContext";
import { LoginPage } from "./pages/Login.page";

const unauthenticatedRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  }
]);

const recruiterRouter = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);

const studentRouter = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);

export function Router() {
  const { isLoggedIn, userData } = useAuth();
  if (!isLoggedIn || !userData) {
    console.log("Returning unauthenticated router");
    return <RouterProvider router={unauthenticatedRouter} />;
  } else if (isLoggedIn && userData.role === AuthRoleEnum.RECRUITER) {
    console.log("Returning recruiter router");
    return <RouterProvider router={recruiterRouter} />;
  } else if (isLoggedIn && userData.role === AuthRoleEnum.STUDENT) {
    console.log("Returning student router");
    return <RouterProvider router={studentRouter} />;
  }
}
