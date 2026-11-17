import AdminStatusTable from "@/components/AdminStatusTable";
export default function Page() { return <AdminStatusTable title="Integration configuration" endpoint="/api/admin/integrations" field="integrations" />; }
