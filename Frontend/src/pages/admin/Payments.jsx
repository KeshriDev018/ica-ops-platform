import { useEffect, useState } from "react";
import {
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import demoService from "../../services/demoService";
import paymentService from "../../services/paymentService";
import subscriptionService from "../../services/subscriptionService";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import { format } from "date-fns";

const AdminPayments = () => {
  const [interestedDemos, setInterestedDemos] = useState([]);
  const [pendingPaymentDemos, setPendingPaymentDemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("interested");
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    billingCycle: "monthly",
    studentType: "1-1",
  });
  const [verificationData, setVerificationData] = useState({
    razorpay_order_id: "",
    razorpay_payment_id: "",
    razorpay_signature: "",
  });
  const [paymentErrors, setPaymentErrors] = useState({});
  const [verifyErrors, setVerifyErrors] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const allDemos = await demoService.getAll();

      const interested = allDemos.filter(
        (demo) => demo.status === "INTERESTED",
      );
      const pending = allDemos.filter(
        (demo) => demo.status === "PAYMENT_PENDING",
      );

      setInterestedDemos(interested);
      setPendingPaymentDemos(pending);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePaymentOrder = (demo) => {
    setSelectedDemo(demo);
    setPaymentData({
      amount: demo.recommendedStudentType === "1-1" ? "2999" : "1499",
      billingCycle: "monthly",
      studentType: demo.recommendedStudentType || "1-1",
    });
    setIsPaymentModalOpen(true);
  };

  const handleGenerateOrder = async () => {
    if (!selectedDemo) return;

    setPaymentErrors({});
    const errors = {};

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      errors.amount = "Please enter a valid amount";
    }

    if (Object.keys(errors).length > 0) {
      setPaymentErrors(errors);
      return;
    }

    setProcessing(true);
    try {
      // Only create order - student will pay from their demo account
      const orderData = await paymentService.createOrder(
        parseFloat(paymentData.amount) * 100,
        selectedDemo._id,
      );

      alert(
        `✅ Payment order generated successfully!\n\n` +
          `Order ID: ${orderData.orderId}\n` +
          `Amount: ₹${paymentData.amount}\n\n` +
          `✓ Demo status updated to PAYMENT_PENDING\n` +
          `✓ Student can now pay from their demo account\n` +
          `✓ Email notification sent to ${selectedDemo.parentEmail}`,
      );

      loadData();
      setIsPaymentModalOpen(false);
      setSelectedDemo(null);
      setPaymentData({
        amount: "",
        billingCycle: "monthly",
        studentType: "1-1",
      });
    } catch (error) {
      console.error("Order generation error:", error);
      setPaymentErrors({
        submit: error.response?.data?.message || error.message,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenVerifyModal = (demo) => {
    setSelectedDemo(demo);
    setVerificationData({
      razorpay_order_id: demo.paymentOrderId || "",
      razorpay_payment_id: "",
      razorpay_signature: "",
    });
    setIsVerifyModalOpen(true);
  };

  const handleVerifyPayment = async () => {
    if (!selectedDemo) return;

    setVerifyErrors({});
    const errors = {};

    if (!verificationData.razorpay_order_id) {
      errors.razorpay_order_id = "Order ID is required";
    }
    if (!verificationData.razorpay_payment_id) {
      errors.razorpay_payment_id = "Payment ID is required";
    }
    if (!verificationData.razorpay_signature) {
      errors.razorpay_signature = "Signature is required";
    }

    if (Object.keys(errors).length > 0) {
      setVerifyErrors(errors);
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        razorpay_order_id: verificationData.razorpay_order_id,
        razorpay_payment_id: verificationData.razorpay_payment_id,
        razorpay_signature: verificationData.razorpay_signature,
        demoId: selectedDemo._id,
        amount: selectedDemo.paymentAmount / 100,
        billingCycle: (paymentData.billingCycle || "monthly").toUpperCase(),
      };

      await paymentService.verifyPayment(payload);

      alert(
        `✅ Payment verified successfully!\n\n` +
          `✓ Student account created\n` +
          `✓ Subscription activated\n` +
          `✓ Onboarding email sent to ${selectedDemo.parentEmail}`,
      );

      loadData();
      setIsVerifyModalOpen(false);
      setSelectedDemo(null);
      setVerificationData({
        razorpay_order_id: "",
        razorpay_payment_id: "",
        razorpay_signature: "",
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      setVerifyErrors({
        submit: error.response?.data?.message || error.message,
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isPaymentModalOpen && selectedDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-navy">
                Generate Payment Order
              </h2>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-navy mb-2">Student Details</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Student:</span>{" "}
                  <span className="font-medium">
                    {selectedDemo.studentName}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Parent:</span>{" "}
                  <span className="font-medium">{selectedDemo.parentName}</span>
                </p>
                <p>
                  <span className="text-gray-600">Email:</span>{" "}
                  <span className="font-medium">
                    {selectedDemo.parentEmail}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Phone:</span>{" "}
                  <span className="font-medium">
                    {selectedDemo.parentPhone}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Recommended:</span>{" "}
                  <span className="font-medium">
                    {selectedDemo.recommendedStudentType === "1-1"
                      ? "1-on-1 Coaching"
                      : "Group Coaching"}
                  </span>
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerateOrder();
              }}
              className="space-y-4"
            >
              {paymentErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {paymentErrors.submit}
                </div>
              )}

              <FormInput
                label="Payment Amount (₹)"
                name="amount"
                type="number"
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, amount: e.target.value })
                }
                placeholder="2999"
                error={paymentErrors.amount}
                required
              />

              <FormSelect
                label="Billing Cycle"
                name="billingCycle"
                value={paymentData.billingCycle}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    billingCycle: e.target.value,
                  })
                }
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "quarterly", label: "Quarterly" },
                  { value: "yearly", label: "Yearly" },
                ]}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="text-blue-800 font-medium mb-1">
                  📋 Payment Order Flow:
                </p>
                <ol className="text-blue-700 space-y-1 ml-4 list-decimal">
                  <li>Payment order will be created with Razorpay</li>
                  <li>Demo status will be set to PAYMENT_PENDING</li>
                  <li>Student will receive email with payment link</li>
                  <li>Student pays from their demo account page</li>
                  <li>
                    After verification, account will be created automatically
                  </li>
                </ol>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPaymentModalOpen(false)}
                  disabled={processing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? "Generating..." : "Generate Order"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {isVerifyModalOpen && selectedDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-navy">Verify Payment</h2>
              <button
                onClick={() => setIsVerifyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-navy mb-2">Student Details</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-600">Student:</span>{" "}
                  <span className="font-medium">
                    {selectedDemo.studentName}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Parent:</span>{" "}
                  <span className="font-medium">{selectedDemo.parentName}</span>
                </p>
                <p>
                  <span className="text-gray-600">Email:</span>{" "}
                  <span className="font-medium">
                    {selectedDemo.parentEmail}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Order ID:</span>{" "}
                  <span className="font-medium font-mono text-xs">
                    {selectedDemo.paymentOrderId}
                  </span>
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyPayment();
              }}
              className="space-y-4"
            >
              {verifyErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {verifyErrors.submit}
                </div>
              )}

              <FormInput
                label="Razorpay Order ID"
                name="razorpay_order_id"
                type="text"
                value={verificationData.razorpay_order_id}
                onChange={(e) =>
                  setVerificationData({
                    ...verificationData,
                    razorpay_order_id: e.target.value,
                  })
                }
                placeholder="order_xxxxxxxxxxxxx"
                error={verifyErrors.razorpay_order_id}
                required
              />

              <FormInput
                label="Razorpay Payment ID"
                name="razorpay_payment_id"
                type="text"
                value={verificationData.razorpay_payment_id}
                onChange={(e) =>
                  setVerificationData({
                    ...verificationData,
                    razorpay_payment_id: e.target.value,
                  })
                }
                placeholder="pay_xxxxxxxxxxxxx"
                error={verifyErrors.razorpay_payment_id}
                required
              />

              <FormInput
                label="Razorpay Signature"
                name="razorpay_signature"
                type="text"
                value={verificationData.razorpay_signature}
                onChange={(e) =>
                  setVerificationData({
                    ...verificationData,
                    razorpay_signature: e.target.value,
                  })
                }
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxx"
                error={verifyErrors.razorpay_signature}
                required
              />

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <p className="text-yellow-800 font-medium mb-1">
                  ⚠️ Important:
                </p>
                <p className="text-yellow-700">
                  These 3 values are provided by Razorpay after successful
                  payment. Student should provide these details to you after
                  completing the payment.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVerifyModalOpen(false)}
                  disabled={processing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? "Verifying..." : "Verify & Activate"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          Payment Management
        </h1>
        <p className="text-gray-600">
          Generate orders for interested students and verify payments
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("interested")}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "interested"
              ? "border-navy text-navy"
              : "border-transparent text-gray-600 hover:text-navy"
          }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign size={18} />
            Interested Students ({interestedDemos.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "pending"
              ? "border-navy text-navy"
              : "border-transparent text-gray-600 hover:text-navy"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock size={18} />
            Pending Payments ({pendingPaymentDemos.length})
          </div>
        </button>
      </div>

      {activeTab === "interested" && (
        <Card>
          {interestedDemos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-navy mb-2">
                No Interested Students
              </h3>
              <p className="text-gray-600">
                All interested demos have payment orders generated
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Parent
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Contact
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Recommended
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Level
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {interestedDemos.map((demo) => (
                    <tr
                      key={demo._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-navy">
                            {demo.studentName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {demo.studentAge} years
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {demo.parentName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="text-gray-600">{demo.parentEmail}</p>
                          <p className="text-gray-500 text-xs">
                            {demo.parentPhone}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            demo.recommendedStudentType === "1-1"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {demo.recommendedStudentType === "1-1"
                            ? "1-on-1"
                            : "Group"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {demo.recommendedLevel}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCreatePaymentOrder(demo)}
                        >
                          <CreditCard size={14} className="mr-1" />
                          Generate Order
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === "pending" && (
        <Card>
          {pendingPaymentDemos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold text-navy mb-2">
                No Pending Payments
              </h3>
              <p className="text-gray-600">
                No students are waiting for payment verification
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Student
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Parent
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Contact
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPaymentDemos.map((demo) => (
                    <tr
                      key={demo._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-navy">
                            {demo.studentName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {demo.studentAge} years
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {demo.parentName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="text-gray-600">{demo.parentEmail}</p>
                          <p className="text-gray-500 text-xs">
                            {demo.parentPhone}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {demo.paymentOrderId || "N/A"}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-navy">
                        ₹
                        {demo.paymentAmount
                          ? (demo.paymentAmount / 100).toLocaleString("en-IN")
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenVerifyModal(demo)}
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Verify Payment
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminPayments;
