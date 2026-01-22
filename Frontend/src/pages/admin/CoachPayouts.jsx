import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  Calendar,
  Eye,
  Edit2,
  Save,
  X,
  Wallet,
} from "lucide-react";
import coachService from "../../services/coachService";
import coachPayoutService from "../../services/coachPayoutService";

export default function CoachPayouts() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Edit rates state
  const [editingRates, setEditingRates] = useState(false);
  const [ratesForm, setRatesForm] = useState({
    payoutPerClass: 0,
    payoutPerBatch: 0,
  });

  // Pay coach form
  const [payForm, setPayForm] = useState({
    payoutPeriod: "",
    periodStart: "",
    periodEnd: "",
    classesCount: 0,
    batchesCount: 0,
  });

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    try {
      setLoading(true);
      const data = await coachService.getAll();
      console.log("Loaded coaches:", data); // Debug log
      setCoaches(data);
      setError(null);
    } catch (err) {
      console.error("Error loading coaches:", err);
      setError("Failed to load coaches");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (coach) => {
    console.log("Selected coach:", coach); // Debug log
    setSelectedCoach(coach);
    setRatesForm({
      payoutPerClass: coach.payoutPerClass || 0,
      payoutPerBatch: coach.payoutPerBatch || 0,
    });
    setShowModal(true);
    setEditingRates(false);

    // Load payout history
    try {
      setLoadingHistory(true);
      const history = await coachPayoutService.getCoachPayoutHistory(
        coach.accountId || coach._id,
      );
      setPayoutHistory(history);
    } catch (err) {
      console.error("Error loading payout history:", err);
      setPayoutHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleVerifyPayout = async (coach) => {
    const coachId = coach.accountId || coach._id;
    console.log("Verifying payout for coach ID:", coachId); // Debug log

    if (
      !confirm(
        `Verify payout for ${coach.fullName}? This will create a Razorpay contact and fund account.`,
      )
    ) {
      return;
    }

    try {
      await coachPayoutService.verifyCoachPayout(coachId);
      alert("Payout verified successfully!");
      loadCoaches();
      if (
        selectedCoach?.accountId === coach.accountId ||
        selectedCoach?._id === coach._id
      ) {
        const updatedCoaches = await coachService.getAll();
        const updated = updatedCoaches.find(
          (c) => (c.accountId || c._id) === coachId,
        );
        setSelectedCoach(updated);
      }
    } catch (err) {
      console.error("Error verifying payout:", err);
      alert(
        "Failed to verify payout: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleSaveRates = async () => {
    const coachId = selectedCoach.accountId || selectedCoach._id;
    console.log("Updating rates for coach ID:", coachId); // Debug log

    try {
      await coachService.updatePayoutRates(coachId, ratesForm);
      alert("Payout rates updated successfully!");
      setEditingRates(false);

      // Update local coach data
      const updatedCoaches = coaches.map((c) => {
        const cId = c.accountId || c._id;
        return cId === coachId ? { ...c, ...ratesForm } : c;
      });
      setCoaches(updatedCoaches);
      setSelectedCoach({ ...selectedCoach, ...ratesForm });
    } catch (err) {
      console.error("Error updating rates:", err);
      alert(
        "Failed to update rates: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleOpenPayModal = (coach) => {
    setSelectedCoach(coach);
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setPayForm({
      payoutPeriod: format(now, "MMMM yyyy"),
      periodStart: format(firstDay, "yyyy-MM-dd"),
      periodEnd: format(lastDay, "yyyy-MM-dd"),
      classesCount: 0,
      batchesCount: 0,
    });
    setShowPayModal(true);
  };

  const calculatePayoutAmount = () => {
    const classAmount =
      (payForm.classesCount || 0) * (selectedCoach?.payoutPerClass || 0);
    const batchAmount =
      (payForm.batchesCount || 0) * (selectedCoach?.payoutPerBatch || 0);
    return classAmount + batchAmount;
  };

  const handlePayCoach = async () => {
    const coachId = selectedCoach.accountId || selectedCoach._id;
    const amount = calculatePayoutAmount();

    if (amount <= 0) {
      alert("Please enter at least one class or batch count");
      return;
    }

    if (!confirm(`Pay ${selectedCoach.fullName} ₹${amount}?`)) {
      return;
    }

    try {
      const payoutData = {
        coachAccountId: coachId,
        payoutPeriod: payForm.payoutPeriod,
        periodStart: payForm.periodStart,
        periodEnd: payForm.periodEnd,
        amount,
        breakdown: {
          classesCount: payForm.classesCount,
          batchesCount: payForm.batchesCount,
          payoutPerClass: selectedCoach.payoutPerClass,
          payoutPerBatch: selectedCoach.payoutPerBatch,
        },
      };

      await coachPayoutService.payCoach(payoutData);
      alert("Payment processed successfully!");
      setShowPayModal(false);

      // Reload payout history if modal is open
      if (showModal) {
        const history = await coachPayoutService.getCoachPayoutHistory(coachId);
        setPayoutHistory(history);
      }
    } catch (err) {
      console.error("Error paying coach:", err);
      alert(
        "Failed to process payment: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const calculateNextDue = (history) => {
    if (history.length === 0) return "No payments yet";

    const lastPayout = history[0];
    const lastDate = new Date(lastPayout.periodEnd);
    const nextDate = new Date(lastDate);
    nextDate.setMonth(nextDate.getMonth() + 1);

    return format(nextDate, "MMM dd, yyyy");
  };

  const getTotalEarnings = (history) => {
    return history.reduce((sum, payout) => sum + (payout.amount || 0), 0);
  };

  const getStatusBadge = (status) => {
    const styles = {
      PROCESSED: "bg-green-100 text-green-800",
      INITIATED: "bg-yellow-100 text-yellow-800",
      FAILED: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl">Loading coaches...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Coach Payouts Management</h1>
        <p className="text-gray-600">
          Verify coaches, set payout rates, and manage payments
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coaches.map((coach) => {
          const coachId = coach.accountId || coach._id;
          return (
            <div
              key={coachId}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {coach.fullName || "Pending"}
                    </h3>
                    <p className="text-sm text-gray-500">{coach.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-24">Country:</span>
                  <span className="font-medium">{coach.country || "N/A"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-24">Timezone:</span>
                  <span className="font-medium">{coach.timezone || "N/A"}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-24">Method:</span>
                  <span className="font-medium">
                    {coach.payout?.method || coach.payoutMethod || "Not Set"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Payout Verified:</span>
                {coach.payout?.isVerified || coach.payoutVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Per Class</div>
                  <div className="font-semibold text-blue-600">
                    ₹{coach.payoutPerClass || 0}
                  </div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-xs text-gray-500">Per Batch</div>
                  <div className="font-semibold text-green-600">
                    ₹{coach.payoutPerBatch || 0}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {!(coach.payout?.isVerified || coach.payoutVerified) ? (
                  <button
                    onClick={() => handleVerifyPayout(coach)}
                    className="col-span-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Verify Payout
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenPayModal(coach)}
                    className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <Wallet className="w-4 h-4 mr-1" />
                    Pay
                  </button>
                )}
                <button
                  onClick={() => handleViewDetails(coach)}
                  className={`bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center ${
                    !(coach.payout?.isVerified || coach.payoutVerified)
                      ? "col-span-2"
                      : ""
                  }`}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay Coach Modal */}
      {showPayModal && selectedCoach && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="bg-purple-600 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-2xl font-bold">
                Pay Coach - {selectedCoach.fullName}
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payout Period
                  </label>
                  <input
                    type="text"
                    value={payForm.payoutPeriod}
                    onChange={(e) =>
                      setPayForm({ ...payForm, payoutPeriod: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="e.g., January 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={selectedCoach.currency || "INR"}
                    disabled
                    className="w-full px-3 py-2 border rounded bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period Start
                  </label>
                  <input
                    type="date"
                    value={payForm.periodStart}
                    onChange={(e) =>
                      setPayForm({ ...payForm, periodStart: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period End
                  </label>
                  <input
                    type="date"
                    value={payForm.periodEnd}
                    onChange={(e) =>
                      setPayForm({ ...payForm, periodEnd: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="font-semibold mb-4">Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Classes
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={payForm.classesCount}
                      onChange={(e) =>
                        setPayForm({
                          ...payForm,
                          classesCount: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Rate: ₹{selectedCoach.payoutPerClass} per class
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      Subtotal: ₹
                      {(payForm.classesCount || 0) *
                        (selectedCoach.payoutPerClass || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Batches
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={payForm.batchesCount}
                      onChange={(e) =>
                        setPayForm({
                          ...payForm,
                          batchesCount: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Rate: ₹{selectedCoach.payoutPerBatch} per batch
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      Subtotal: ₹
                      {(payForm.batchesCount || 0) *
                        (selectedCoach.payoutPerBatch || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{calculatePayoutAmount()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePayCoach}
                  className="flex-1 bg-purple-600 text-white py-3 px-6 rounded hover:bg-purple-700 transition-colors font-medium"
                >
                  Process Payment
                </button>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coach Details Modal */}
      {showModal && selectedCoach && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
            {/* Modal Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-2xl font-bold">
                {selectedCoach.fullName} - Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Coach Info Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Coach Information
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{selectedCoach.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phone:</span>
                    <p className="font-medium">
                      {selectedCoach.phoneNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Country:</span>
                    <p className="font-medium">
                      {selectedCoach.country || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Timezone:</span>
                    <p className="font-medium">
                      {selectedCoach.timezone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Experience:</span>
                    <p className="font-medium">
                      {selectedCoach.experienceYears || 0} years
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status:</span>
                    <p className="font-medium">
                      {selectedCoach.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payout Rates Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Payout Rates
                  </h3>
                  {!editingRates ? (
                    <button
                      onClick={() => setEditingRates(true)}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit Rates
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveRates}
                        className="flex items-center text-green-600 hover:text-green-700"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingRates(false);
                          setRatesForm({
                            payoutPerClass: selectedCoach.payoutPerClass || 0,
                            payoutPerBatch: selectedCoach.payoutPerBatch || 0,
                          });
                        }}
                        className="flex items-center text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <label className="text-sm text-gray-600 block mb-2">
                      Payout Per Class (₹)
                    </label>
                    {editingRates ? (
                      <input
                        type="number"
                        value={ratesForm.payoutPerClass}
                        onChange={(e) =>
                          setRatesForm({
                            ...ratesForm,
                            payoutPerClass: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border rounded"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{selectedCoach.payoutPerClass || 0}
                      </p>
                    )}
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <label className="text-sm text-gray-600 block mb-2">
                      Payout Per Batch (₹)
                    </label>
                    {editingRates ? (
                      <input
                        type="number"
                        value={ratesForm.payoutPerBatch}
                        onChange={(e) =>
                          setRatesForm({
                            ...ratesForm,
                            payoutPerBatch: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border rounded"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-green-600">
                        ₹{selectedCoach.payoutPerBatch || 0}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payout Method Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Payout Method Details
                </h3>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-lg">
                      Method: {selectedCoach.payout?.method || "Not Set"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        selectedCoach.payout?.isVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedCoach.payout?.isVerified
                        ? "✓ Verified"
                        : "⚠ Not Verified"}
                    </span>
                  </div>

                  {selectedCoach.payout?.method === "UPI" && (
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">UPI ID:</span>
                        <span className="font-semibold">
                          {selectedCoach.payout?.upiId || "N/A"}
                        </span>
                      </div>
                      {selectedCoach.payout?.razorpayContactId && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">
                            Razorpay Contact ID:
                          </span>
                          <span className="font-mono text-sm">
                            {selectedCoach.payout.razorpayContactId}
                          </span>
                        </div>
                      )}
                      {selectedCoach.payout?.razorpayFundAccountId && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">
                            Razorpay Fund Account ID:
                          </span>
                          <span className="font-mono text-sm">
                            {selectedCoach.payout.razorpayFundAccountId}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedCoach.payout?.method === "BANK" && (
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Account Holder:</span>
                        <span className="font-semibold">
                          {selectedCoach.payout?.bankDetails
                            ?.accountHolderName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-semibold">
                          {selectedCoach.payout?.bankDetails?.accountNumber ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">IFSC Code:</span>
                        <span className="font-semibold">
                          {selectedCoach.payout?.bankDetails?.ifscCode || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Bank Name:</span>
                        <span className="font-semibold">
                          {selectedCoach.payout?.bankDetails?.bankName || "N/A"}
                        </span>
                      </div>
                      {selectedCoach.payout?.razorpayContactId && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">
                            Razorpay Contact ID:
                          </span>
                          <span className="font-mono text-sm">
                            {selectedCoach.payout.razorpayContactId}
                          </span>
                        </div>
                      )}
                      {selectedCoach.payout?.razorpayFundAccountId && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">
                            Razorpay Fund Account ID:
                          </span>
                          <span className="font-mono text-sm">
                            {selectedCoach.payout.razorpayFundAccountId}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {!selectedCoach.payout?.method && (
                    <p className="text-gray-500 text-center py-4">
                      Coach has not set up payout method yet
                    </p>
                  )}
                </div>
              </div>

              {/* Payout History Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Payout History
                </h3>

                {loadingHistory ? (
                  <p className="text-center py-4 text-gray-500">
                    Loading history...
                  </p>
                ) : payoutHistory.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded">
                    <p className="text-gray-500">No payout history yet</p>
                  </div>
                ) : (
                  <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-xs text-gray-500">
                          Total Earned
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          ₹{getTotalEarnings(payoutHistory)}
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-xs text-gray-500">
                          Total Payouts
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          {payoutHistory.length}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="text-xs text-gray-500">Next Due</div>
                        <div className="text-sm font-bold text-purple-600">
                          {calculateNextDue(payoutHistory)}
                        </div>
                      </div>
                    </div>

                    {/* History Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Period
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Amount
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Breakdown
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payoutHistory.map((payout) => (
                            <tr key={payout._id}>
                              <td className="px-4 py-3 text-sm">
                                {payout.payoutPeriod}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium">
                                ₹{payout.amount}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {payout.breakdown?.classesCount || 0} classes ×
                                ₹{payout.breakdown?.payoutPerClass || 0}
                                <br />
                                {payout.breakdown?.batchesCount || 0} batches ×
                                ₹{payout.breakdown?.payoutPerBatch || 0}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                                    payout.status,
                                  )}`}
                                >
                                  {payout.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {payout.processedAt
                                  ? format(
                                      new Date(payout.processedAt),
                                      "MMM dd, yyyy",
                                    )
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t rounded-b-lg">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
