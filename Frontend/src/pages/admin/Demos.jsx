import { useEffect, useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import demoService from "../../services/demoService";
import DemoOutcomeModal from "../../components/admin/DemoOutcomeModal";

const columnHelper = createColumnHelper();

const AdminDemos = () => {
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("BOOKED");
  const [otherStatusFilter, setOtherStatusFilter] = useState("all");
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("schedule"); // 'schedule', 'attendance', 'outcome'

  const loadDemos = async () => {
    setLoading(true);
    try {
      const allDemos = await demoService.getAll();
      setDemos(allDemos);
    } catch (error) {
      console.error("Error loading demos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemos();
  }, []);

  const handleScheduleDemo = (demo) => {
    setSelectedDemo(demo);
    setModalMode("schedule");
    setIsModalOpen(true);
  };

  const handleMarkAttendance = (demo) => {
    setSelectedDemo(demo);
    setModalMode("attendance");
    setIsModalOpen(true);
  };

  const handleSubmitOutcome = (demo) => {
    setSelectedDemo(demo);
    setModalMode("outcome");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDemo(null);
    setModalMode("schedule");
  };

  const handleUpdate = () => {
    loadDemos(); // Reload demos after update
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("studentName", {
        header: "Student",
        cell: (info) => (
          <span className="font-medium text-navy">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("parentName", {
        header: "Parent",
        cell: (info) => (
          <span className="text-gray-600">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("parentEmail", {
        header: "Email",
        cell: (info) => (
          <span className="text-gray-600">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("scheduledStart", {
        header: "Date",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                status === "BOOKED"
                  ? "bg-blue-100 text-blue-800"
                  : status === "ATTENDED"
                    ? "bg-green-100 text-green-800"
                    : status === "PAYMENT_PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : status === "CONVERTED"
                        ? "bg-green-100 text-green-800"
                        : status === "INTERESTED"
                          ? "bg-purple-100 text-purple-800"
                          : status === "NOT_INTERESTED"
                            ? "bg-red-100 text-red-800"
                            : status === "NO_SHOW"
                              ? "bg-orange-100 text-orange-800"
                              : status === "RESCHEDULED"
                                ? "bg-cyan-100 text-cyan-800"
                                : status === "CANCELLED"
                                  ? "bg-gray-100 text-gray-800"
                                  : status === "DROPPED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {status.replace("_", " ")}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const demo = row.original;
          return (
            <div className="flex gap-2 flex-wrap">
              {demo.status === "BOOKED" && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleScheduleDemo(demo)}
                  >
                    Schedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAttendance(demo)}
                  >
                    Mark Attendance
                  </Button>
                </>
              )}
              {demo.status === "ATTENDED" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSubmitOutcome(demo)}
                >
                  Submit Outcome
                </Button>
              )}
              {!["BOOKED", "ATTENDED"].includes(demo.status) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleScheduleDemo(demo)}
                >
                  View Details
                </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [],
  );

  // Filter by status
  const filteredData = useMemo(() => {
    if (statusFilter === "OTHERS") {
      const otherStatuses = [
        "NO_SHOW",
        "RESCHEDULED",
        "CANCELLED",
        "INTERESTED",
        "NOT_INTERESTED",
        "PAYMENT_PENDING",
        "CONVERTED",
        "DROPPED",
      ];
      const otherDemos = demos.filter((d) => otherStatuses.includes(d.status));

      if (otherStatusFilter === "all") return otherDemos;
      return otherDemos.filter((d) => d.status === otherStatusFilter);
    }
    return demos.filter((d) => d.status === statusFilter);
  }, [demos, statusFilter, otherStatusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Outcome Modal */}
      <DemoOutcomeModal
        demo={selectedDemo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleUpdate}
        mode={modalMode}
      />

      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          Demos
        </h1>
        <p className="text-gray-600">Manage demo requests and outcomes</p>
      </div>

      <Card>
        {/* Main Tabs */}
        <div className="mb-4">
          <div className="flex gap-2 flex-wrap border-b border-gray-200 pb-4">
            {["BOOKED", "ATTENDED", "OTHERS"].map((status) => {
              const count =
                status === "OTHERS"
                  ? demos.filter((d) =>
                      [
                        "NO_SHOW",
                        "RESCHEDULED",
                        "CANCELLED",
                        "INTERESTED",
                        "NOT_INTERESTED",
                        "PAYMENT_PENDING",
                        "CONVERTED",
                        "DROPPED",
                      ].includes(d.status),
                    ).length
                  : demos.filter((d) => d.status === status).length;

              return (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setOtherStatusFilter("all"); // Reset other filter
                  }}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    statusFilter === status
                      ? "bg-navy text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status} ({count})
                </button>
              );
            })}
          </div>

          {/* Sub-filters for Others tab */}
          {statusFilter === "OTHERS" && (
            <div className="mt-4 flex gap-2 flex-wrap">
              <button
                onClick={() => setOtherStatusFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  otherStatusFilter === "all"
                    ? "bg-orange text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {[
                "NO_SHOW",
                "RESCHEDULED",
                "CANCELLED",
                "INTERESTED",
                "NOT_INTERESTED",
                "PAYMENT_PENDING",
                "CONVERTED",
                "DROPPED",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => setOtherStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    otherStatusFilter === status
                      ? "bg-orange text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.replace("_", " ")} (
                  {demos.filter((d) => d.status === status).length})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search demos by student, parent, email..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-200">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left py-3 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {{
                              asc: " ↑",
                              desc: " ↓",
                            }[header.column.getIsSorted()] ?? " ⇅"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-4 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            of {table.getFilteredRowModel().rows.length} demos
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDemos;
