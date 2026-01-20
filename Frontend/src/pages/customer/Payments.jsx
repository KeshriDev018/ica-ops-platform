import { useEffect, useState } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import studentService from "../../services/studentService";
import subscriptionService from "../../services/subscriptionService";
import { format } from "date-fns";

const CustomerPayments = () => {
  const [student, setStudent] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const myStudent = await studentService.getMyStudent();
        console.log("💳 Student loaded for payments:", myStudent);
        setStudent(myStudent);

        // Load payment history from backend
        const payments = await subscriptionService.getMyPaymentHistory();
        console.log("💳 Payment history loaded:", payments);
        setPaymentHistory(payments);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    if (!student) {
      alert("Student information not loaded. Please try again.");
      return;
    }

    setProcessing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      // For demo: using test amount and order
      const testOrderId = "order_" + Math.random().toString(36).substr(2, 9);
      const amount = 299900; // ₹2,999 in paise

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_dummy",
        amount: amount,
        currency: "INR",
        name: "ICA Chess Academy",
        description: `Monthly Subscription - ${student.studentType === "1-1" ? "1-on-1" : "Group"} Coaching`,
        order_id: testOrderId,
        prefill: {
          name: student.parentName,
          email: student.parentEmail,
          contact: "9999999999",
        },
        theme: {
          color: "#1e3a8a",
        },
        handler: async function (response) {
          await handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            alert("Payment cancelled. You can try again anytime.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      alert("Failed to open payment gateway: " + error.message);
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      setProcessing(true);
      console.log("Payment successful:", response);

      // In real implementation, verify payment with backend
      // await paymentService.verifyPayment(response);

      alert("Payment successful! Your subscription has been activated.");
      setProcessing(false);
    } catch (error) {
      console.error("Payment verification error:", error);
      alert(
        "Payment completed but verification failed. Please contact support.",
      );
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
            Payments
          </h1>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600">Unable to load payment information.</p>
          </div>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    const amountInRupees = Math.round(amount);
    return `₹${amountInRupees.toLocaleString("en-IN")}`;
  };
  const nextDueDate = new Date(2026, 1, 20); // Feb 20, 2026

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          Payments
        </h1>
        <p className="text-gray-600">
          Manage your subscription and payment history
        </p>
      </div>

      {/* Current Subscription Status */}
      <Card className="bg-gradient-to-r from-navy to-navy/90 text-white border-none">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-secondary font-bold mb-2">
              Current Subscription
            </h2>
            <p className="text-white/80">
              {student.studentType === "1-1"
                ? "1-on-1 Personalized Coaching"
                : "Group Coaching Program"}
            </p>
          </div>
          <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-500 text-white">
            ACTIVE
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-white/80 mb-1">Monthly Amount</p>
            <p className="text-3xl font-bold">{formatCurrency(2999)}</p>
          </div>
          <div>
            <p className="text-sm text-white/80 mb-1">Level</p>
            <p className="text-xl font-semibold">{student.level}</p>
          </div>
          <div>
            <p className="text-sm text-white/80 mb-1">Next Payment Due</p>
            <p className="text-xl font-semibold">
              {format(nextDueDate, "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={handlePayNow}
            disabled={processing}
            className="bg-orange hover:bg-orange/90 text-white"
          >
            {processing ? "Processing..." : "💳 Pay Now"}
          </Button>
        </div>
      </Card>

      {/* Payment History */}
      <Card>
        <h2 className="text-xl font-secondary font-bold text-navy mb-4">
          Payment History
        </h2>
        {paymentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Plan
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Payment ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Method
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {format(
                        new Date(payment.createdAt || payment.date),
                        "MMM d, yyyy",
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {payment.paymentFor || payment.plan}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-navy">
                      {formatCurrency(
                        payment.amount ? payment.amount / 100 : payment.amount,
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                      {payment.razorpayPaymentId || payment.paymentId}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {payment.paymentMethod || payment.method}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === "SUCCESS"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <p className="text-gray-500 text-lg">No payment history found.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CustomerPayments;
