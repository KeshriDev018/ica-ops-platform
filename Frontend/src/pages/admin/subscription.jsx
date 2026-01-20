import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import subscriptionService from "../../services/subscriptionService";

const AdminSubscription = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // all, ACTIVE, SUSPENDED, CANCELLED
  const [filterPlanType, setFilterPlanType] = useState("all"); // all, PERSONALIZED_1_ON_1, GROUP_COACHING
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(""); // pause, resume, cancel

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const subsData = await subscriptionService.getAll();

      console.log("Subscriptions data from backend:", subsData);

      // Backend now returns enriched data with student details
      setSubscriptions(subsData);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      alert("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedSubscription) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/subscriptions/${selectedSubscription._id}/${actionType}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) throw new Error("Action failed");

      const data = await response.json();
      alert(data.message);

      setShowModal(false);
      setSelectedSubscription(null);
      loadSubscriptions();
    } catch (error) {
      console.error("Error performing action:", error);
      alert("Failed to perform action");
    }
  };

  const openActionModal = (subscription, action) => {
    setSelectedSubscription(subscription);
    setActionType(action);
    setShowModal(true);
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (filterStatus !== "all" && sub.status !== filterStatus) return false;
    if (filterPlanType !== "all" && sub.studentType !== filterPlanType)
      return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubscriptions = filteredSubscriptions.slice(
    startIndex,
    endIndex,
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterPlanType]);

  const getDaysUntilDue = (nextDueDate) => {
    if (!nextDueDate) return null;
    const now = new Date();
    const due = new Date(nextDueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getNextDueClass = (nextDueDate) => {
    const daysUntil = getDaysUntilDue(nextDueDate);
    if (daysUntil === null) return "text-gray-700";
    if (daysUntil < 0) return "text-red-700 font-bold"; // Overdue
    if (daysUntil <= 7) return "text-red-600 font-semibold"; // Due within a week
    if (daysUntil <= 14) return "text-orange-600"; // Due within 2 weeks
    return "text-gray-700";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "SUSPENDED":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "ACTIVE").length,
    suspended: subscriptions.filter((s) => s.status === "SUSPENDED").length,
    cancelled: subscriptions.filter((s) => s.status === "CANCELLED").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          Subscriptions
        </h1>
        <p className="text-gray-600">
          Manage student subscriptions and payments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-navy text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">
            Total Subscriptions
          </div>
          <div className="text-4xl font-bold text-white">{stats.total}</div>
        </Card>
        <Card className="bg-green-600 text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">Active</div>
          <div className="text-4xl font-bold text-white">{stats.active}</div>
        </Card>
        <Card className="bg-yellow-600 text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">Suspended</div>
          <div className="text-4xl font-bold text-white">{stats.suspended}</div>
        </Card>
        <Card className="bg-red-600 text-white border-none">
          <div className="text-sm font-medium opacity-90 mb-1">Cancelled</div>
          <div className="text-4xl font-bold text-white">{stats.cancelled}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            {["all", "ACTIVE", "SUSPENDED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? "bg-navy text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "all" ? "All" : status}
              </button>
            ))}
          </div>

          {/* Plan Type Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">
              Plan Type:
            </span>
            {[
              { value: "all", label: "All Plans" },
              { value: "1-1", label: "1-on-1" },
              { value: "group", label: "Group" },
            ].map((plan) => (
              <button
                key={plan.value}
                onClick={() => setFilterPlanType(plan.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterPlanType === plan.value
                    ? "bg-orange text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {plan.label}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600 pt-2 border-t">
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredSubscriptions.length)} of{" "}
            {filteredSubscriptions.length} subscriptions
          </div>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-navy">
                  Student
                </th>
                <th className="text-left py-3 px-4 font-semibold text-navy">
                  Plan
                </th>
                <th className="text-left py-3 px-4 font-semibold text-navy">
                  Level
                </th>
                <th className="text-left py-3 px-4 font-semibold text-navy">
                  Billing
                </th>
                <th className="text-left py-3 px-4 font-semibold text-navy">
                  Amount
                </th>
                <th className="text-left py-3 px-4 font-semibold text-navy">
                  Start Date
                </th>
                <th className="text-left py-3 px-4 font-semibold text-navy">
                  Next Due
                </th>
                <th className="text-left py-3 px-4 font-semibold text-navy">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-navy">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                paginatedSubscriptions.map((sub) => {
                  const daysUntil = getDaysUntilDue(sub.nextDueAt);
                  return (
                    <tr
                      key={sub._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-navy">
                            {sub.studentName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {sub.studentEmail}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-orange/10 text-orange">
                          {sub.studentType === "1-1"
                            ? "1-on-1"
                            : sub.studentType === "group"
                              ? "Group"
                              : "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {sub.studentLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {sub.billingCycle}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-navy">
                          {formatCurrency(sub.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {sub.startedAt ? formatDate(sub.startedAt) : "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className={getNextDueClass(sub.nextDueAt)}>
                            {sub.nextDueAt ? formatDate(sub.nextDueAt) : "N/A"}
                          </div>
                          {daysUntil !== null && (
                            <div className="text-xs text-gray-500 mt-1">
                              {daysUntil < 0
                                ? `${Math.abs(daysUntil)} days overdue`
                                : daysUntil === 0
                                  ? "Due today"
                                  : `in ${daysUntil} days`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {sub.status === "ACTIVE" && (
                            <button
                              onClick={() => openActionModal(sub, "pause")}
                              className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded transition-colors"
                            >
                              Pause
                            </button>
                          )}
                          {sub.status === "SUSPENDED" && (
                            <button
                              onClick={() => openActionModal(sub, "resume")}
                              className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
                            >
                              Resume
                            </button>
                          )}
                          {sub.status !== "CANCELLED" && (
                            <button
                              onClick={() => openActionModal(sub, "cancel")}
                              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Action Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <h3 className="text-xl font-secondary font-bold text-navy mb-4">
              Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {actionType} the subscription for{" "}
              <strong>{selectedSubscription?.studentName}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setShowModal(false);
                  setSelectedSubscription(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleAction}
                className={
                  actionType === "cancel"
                    ? "!bg-red-600 hover:!bg-red-700"
                    : actionType === "pause"
                      ? "!bg-yellow-600 hover:!bg-yellow-700"
                      : ""
                }
              >
                Confirm
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminSubscription;
