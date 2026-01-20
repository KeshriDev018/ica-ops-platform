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
import { UserCircle, X } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import studentService from "../../services/studentService";
import coachService from "../../services/coachService";
import FormSelect from "../../components/forms/FormSelect";

const columnHelper = createColumnHelper();

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allStudents, allCoaches] = await Promise.all([
          studentService.getAll(),
          coachService.getAll(),
        ]);
        setStudents(allStudents);
        setCoaches(allCoaches);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAssignCoach = (student) => {
    setSelectedStudent(student);
    setSelectedCoachId(
      student.assignedCoachId?._id || student.assignedCoachId || "",
    );
    setIsAssignModalOpen(true);
  };

  const handleSubmitAssignment = async () => {
    if (!selectedStudent || !selectedCoachId) {
      alert("Please select a coach");
      return;
    }

    setProcessing(true);
    try {
      await studentService.reassign(selectedStudent._id, selectedCoachId, null);

      // Reload students
      const updatedStudents = await studentService.getAll();
      setStudents(updatedStudents);

      alert(`✅ Coach assigned successfully to ${selectedStudent.studentName}`);
      setIsAssignModalOpen(false);
      setSelectedStudent(null);
      setSelectedCoachId("");
    } catch (error) {
      console.error("Error assigning coach:", error);
      alert(
        "Failed to assign coach: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setProcessing(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("studentName", {
        header: "Name",
        cell: (info) => (
          <span className="font-medium text-navy">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("studentAge", {
        header: "Age",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("parentName", {
        header: "Parent",
        cell: (info) => (
          <span className="text-gray-600">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("studentType", {
        header: "Type",
        cell: (info) => (
          <span className="capitalize">
            {info.getValue() === "1-1" ? "1-on-1" : info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("level", {
        header: "Level",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("assignedCoachId", {
        header: "Assigned Coach",
        cell: (info) => {
          const coach = info.getValue();
          return (
            <span className="text-gray-600">
              {coach?.name || coach?.email || "Not Assigned"}
            </span>
          );
        },
      }),
      columnHelper.accessor("rating", {
        header: "Rating",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : status === "PAUSED"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {status}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAssignCoach(info.row.original)}
          >
            <UserCircle size={14} className="mr-1" />
            Assign Coach
          </Button>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: students,
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
      {isAssignModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-navy">Assign Coach</h2>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-navy mb-2">Student Details</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Name:</span>{" "}
                  <span className="font-medium">
                    {selectedStudent.studentName}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Age:</span>{" "}
                  <span className="font-medium">
                    {selectedStudent.studentAge} years
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Level:</span>{" "}
                  <span className="font-medium">{selectedStudent.level}</span>
                </p>
                <p>
                  <span className="text-gray-600">Type:</span>{" "}
                  <span className="font-medium">
                    {selectedStudent.studentType === "1-1"
                      ? "One-on-One"
                      : "Batch"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Current Coach:</span>{" "}
                  <span className="font-medium">
                    {selectedStudent.assignedCoachId?.name ||
                      selectedStudent.assignedCoachId?.email ||
                      "Not Assigned"}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Coach
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={selectedCoachId}
                  onChange={(e) => setSelectedCoachId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent bg-white"
                  required
                >
                  <option value="">-- Select a Coach --</option>
                  {coaches.map((coach) => (
                    <option key={coach._id} value={coach._id}>
                      {coach.name || coach.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSubmitAssignment}
                  disabled={processing || !selectedCoachId}
                  className="flex-1"
                >
                  {processing ? "Assigning..." : "Assign Coach"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            Students
          </h1>
          <p className="text-gray-600">Manage all academy students</p>
        </div>
        <Button variant="primary" size="md">
          Add Student
        </Button>
      </div>

      <Card>
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search students by name, parent, level..."
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
            of {table.getFilteredRowModel().rows.length} students
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

export default AdminStudents;
