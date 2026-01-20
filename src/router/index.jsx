import { createHashRouter } from "react-router";
import AdminLayout from "../layout/AdminLayout";
import Login from "../pages/Login";
import ProductsList from "../pages/ProductsList";
import RequireAuth from "../components/RequireAuth";

const router = createHashRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: "products",
        element: <ProductsList />,
      },
    ],
  },
  { path: "*", element: <Login /> },
]);

export default router;
