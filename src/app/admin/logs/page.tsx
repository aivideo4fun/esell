import AdminStatusTable from "@/components/AdminStatusTable";
export default function Page() { return <AdminStatusTable title="Recent activity" endpoint="/api/admin/logs" field="logs" />; }
