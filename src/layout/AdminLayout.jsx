import { Outlet } from "react-router";
import AdminHeader from "../components/AdminHeader";

export default function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <Outlet />
    </>
  );
}
