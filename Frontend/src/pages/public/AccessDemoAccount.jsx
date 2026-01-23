import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import CurrencyConverter from "../../components/common/CurrencyConverter";
import useDemoStore from "../../store/demoStore";
import paymentService from "../../services/paymentService";
import { format } from "date-fns";
import api from "../../lib/api";
import PreferenceMismatchModal from "../../components/demo/PreferenceMismatchModal";
const AccessDemoAccount = () => {
  const navigate = useNavigate();
  const { demoData, demoEmail, hasDemoAccess, updateDemoPreferences, updateDemoInterest } = useDemoStore();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meetingLink, setMeetingLink] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // Selected plan for payment
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Mismatch modal state
  const [showMismatchModal, setShowMismatchModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);

  // Student marks their interest in the demo
  const [interestStatus, setInterestStatus] = useState(
    demoData?.studentInterest || "PENDING",
  );
  const [interestLoading, setInterestLoading] = useState(false);

  // Student preferences
  const [preferences, setPreferences] = useState({
    classType: demoData?.preferredClassType || null,
    level: demoData?.studentLevel || null,
  });
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  // Check if preferences are already saved in database
  const [preferencesSaved, setPreferencesSaved] = useState(
    !!(demoData?.preferredClassType && demoData?.studentLevel)
  );
  
  // Determine if preferences should be locked (already saved or converted)
  const preferencesLocked = preferencesSaved || demoData?.status === "CONVERTED";
  // Determine if interest is locked (already marked or converted)
  const interestLocked = interestStatus !== "PENDING" || demoData?.status === "CONVERTED";

  const handleMarkInterest = async (interest) => {
    setInterestLoading(true);
    try {
      const response = await api.patch(`/demos/${demoData._id}/interest`, {
        interest,
      });
      setInterestStatus(interest);
      // Update store to persist the change
      updateDemoInterest(interest);
      alert("Your interest has been updated.");
    } catch (error) {
      alert("Failed to update interest: " + error.message);
    } finally {
      setInterestLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences.classType || !preferences.level) {
      alert("Please select both coaching type and your level.");
      return;
    }

    setPreferencesLoading(true);
    try {
      await api.patch(`/demos/${demoData._id}/preferences`, {
        preferredClassType: preferences.classType,
        studentLevel: preferences.level,
      });
      // Mark as permanently saved
      setPreferencesSaved(true);
      // Update store to persist the change
      updateDemoPreferences(preferences);
      alert("Preferences saved successfully! You can view them but cannot change them now.");
    } catch (error) {
      alert("Failed to save preferences: " + error.message);
    } finally {
      setPreferencesLoading(false);
    }
  };

  useEffect(() => {
    // Check if user has demo access
    if (!hasDemoAccess()) {
      // Redirect to demo login if no access
      navigate("/demo-login", { replace: true });
      return;
    }

    const loadData = async () => {
      try {
        // Set INR plans
        const inrPlans = [
          {
            plan_id: "1-1",
            name: "Personalized 1-on-1 Coaching",
            price: 2999,
            billing_cycle: "monthly",
            features: [
              "8 personalized sessions per month",
              "Customized learning plan",
              "Dedicated coach assignment",
              "Flexible scheduling",
              "Progress tracking & reports",
              "Tournament preparation",
            ],
          },
          {
            plan_id: "group",
            name: "Engaging Group Coaching",
            price: 1499,
            billing_cycle: "monthly",
            features: [
              "12 group sessions per month",
              "Small batches (max 6 students)",
              "Age & skill-based grouping",
              "Interactive learning environment",
              "Peer learning & practice games",
              "Monthly tournaments",
            ],
          },
        ];
        setPlans(inrPlans);

        // Get demo meeting link if available
        if (demoData?._id && demoData?.meetingLink) {
          setMeetingLink(demoData.meetingLink);
        }
      } catch (error) {
        console.error("Error loading demo account data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [demoData, demoEmail, hasDemoAccess, navigate]);

  const handlePlanSelect = (plan) => {
    // Check if there's a preference mismatch
    const preferredType = demoData?.preferredClassType;
    const selectedType = plan.plan_id;
    
    // Normalize types for comparison
    const normalizedPreferred = preferredType?.toUpperCase();
    const normalizedSelected = selectedType === "1-1" ? "1-1" : "GROUP";
    
    // If preferences exist and don't match
    if (preferredType && normalizedPreferred !== normalizedSelected) {
      setPendingPlan(plan);
      setShowMismatchModal(true);
      return;
    }
    
    // No mismatch, select plan directly
    setSelectedPlan(plan);
  };

  const handleConfirmMismatch = () => {
    // User confirmed they want to continue with mismatched plan
    setSelectedPlan(pendingPlan);
    setShowMismatchModal(false);
    setPendingPlan(null);
  };

  const handleChangePreference = () => {
    // Close modal and scroll to preferences section
    setShowMismatchModal(false);
    setPendingPlan(null);
    
    // Scroll to preferences section
    const preferencesSection = document.getElementById("preferences-section");
    if (preferencesSection) {
      preferencesSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
    if (!selectedPlan) {
      alert("Please select a plan first");
      return;
    }
    
    setProcessing(true);
    try {
      // Create payment order with selected plan details
      const response = await api.post("/payments/create-demo-order", {
        amount: Math.round(selectedPlan.price * 100), // Convert to paise
        demoId: demoData._id,
        planId: selectedPlan.plan_id,
        billingCycle: "MONTHLY",
      });
      
      const order = response.data;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      const orderData = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        orderId: order.orderId,
      };

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ICA Chess Academy",
        description: `${selectedPlan.name} - Payment for ${demoData.studentName}`,
        order_id: orderData.orderId,
        prefill: {
          name: demoData.parentName,
          email: demoData.parentEmail,
          contact: demoData.parentPhone,
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

      const verificationData = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        demoId: demoData._id,
        amount: demoData.paymentAmount / 100, // Convert paise to rupees
        billingCycle: "MONTHLY",
      };

      await paymentService.verifyPayment(verificationData);

      alert(
        "✅ Payment successful!\n\n✓ Your student account has been created\n✓ Subscription is now active\n✓ Password setup email sent to " +
          demoData.parentEmail +
          "\n\nPlease check your email to set up your password and login!",
      );

      // Reload page to show updated status
      window.location.reload();
    } catch (error) {
      console.error("Payment verification error:", error);
      alert(
        "❌ Payment verification failed: " +
          (error.response?.data?.message || error.message) +
          "\n\nPlease contact support with your payment details.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  const formatDateTime = (dateString) => {
    if (!dateString) return "To be confirmed";
    const date = new Date(dateString);
    return format(date, "EEEE, MMMM d, yyyy • h:mm a");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-gray-500">Loading demo account...</div>
      </div>
    );
  }

  if (!demoData) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <Card className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-secondary font-bold text-navy mb-4">
            No Demo Data Found
          </h2>
          <p className="text-gray-600 mb-6">
            Please book a demo first or login with your demo email.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/book-demo")}
              className="flex-1"
            >
              Book Demo
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate("/demo-login")}
              className="flex-1"
            >
              Demo Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-6">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-secondary font-bold text-navy mb-3">
            Your Demo Account
          </h1>
          <p className="text-gray-600 text-lg">
            Access your demo session details and make payment to unlock full
            features
          </p>
        </div>

        {/* Demo Information */}
        <Card className="bg-gradient-to-r from-navy to-navy/90 text-white">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-secondary font-bold mb-4">
                Demo Session Details
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/80 mb-1">Student Name</p>
                  <p className="text-lg font-semibold">
                    {demoData.studentName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Parent Name</p>
                  <p className="text-lg font-semibold">{demoData.parentName}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Email</p>
                  <p className="text-lg font-semibold">
                    {demoData.parentEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Student Age</p>
                  <p className="text-lg font-semibold">
                    {demoData.studentAge} years
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Country</p>
                  <p className="text-lg font-semibold">{demoData.country}</p>
                </div>
                {/* Student Interest Section */}
                <div>
                  <p className="text-sm text-white/80 mb-1">Your Interest</p>
                  <div className="flex gap-2 items-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        interestStatus === "INTERESTED"
                          ? "bg-green-200 text-green-900"
                          : interestStatus === "NOT_INTERESTED"
                            ? "bg-red-200 text-red-900"
                            : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      {interestStatus}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        interestLoading || interestLocked || interestStatus === "INTERESTED"
                      }
                      onClick={() => handleMarkInterest("INTERESTED")}
                    >
                      {interestStatus === "INTERESTED" ? "✓ Marked" : "Mark Interested"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        interestLoading || interestLocked || interestStatus === "NOT_INTERESTED"
                      }
                      onClick={() => handleMarkInterest("NOT_INTERESTED")}
                    >
                      {interestStatus === "NOT_INTERESTED" ? "✓ Marked" : "Not Interested"}
                    </Button>
                  </div>
                </div>

                {/* Student Preferences */}
                <div className={`mt-6 p-4 rounded-lg border ${
                  preferencesLocked
                    ? "bg-white/5 border-white/10 opacity-70" 
                    : "bg-white/5 border-white/10"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Your Preferences</h3>
                    {preferencesLocked && (
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">✓ Saved</span>
                    )}
                  </div>
                  
                  {/* Coaching Type Selection */}
                  <div className="mb-4">
                    <label className="block text-sm text-white/80 mb-2">
                      Preferred Coaching Type *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={preferencesLocked}
                        onClick={() => !preferencesLocked && setPreferences({ ...preferences, classType: "1-1" })}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          preferences.classType === "1-1"
                            ? "border-orange bg-orange/10"
                            : "border-white/20 hover:border-white/40"
                        } ${preferencesLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="font-semibold">1-on-1 Coaching</div>
                        <div className="text-xs text-white/70 mt-1">Personalized attention</div>
                      </button>
                      <button
                        type="button"
                        disabled={preferencesLocked}
                        onClick={() => !preferencesLocked && setPreferences({ ...preferences, classType: "GROUP" })}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          preferences.classType === "GROUP"
                            ? "border-orange bg-orange/10"
                            : "border-white/20 hover:border-white/40"
                        } ${preferencesLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="font-semibold">Group Coaching</div>
                        <div className="text-xs text-white/70 mt-1">Learn with peers</div>
                      </button>
                    </div>
                  </div>

                  {/* Level Selection */}
                  <div className="mb-4">
                    <label className="block text-sm text-white/80 mb-2">
                      Your Chess Level *
                    </label>
                    <select
                      value={preferences.level || ""}
                      disabled={preferencesLocked}
                      onChange={(e) => !preferencesLocked && setPreferences({ ...preferences, level: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-orange disabled:cursor-not-allowed disabled:opacity-80"
                    >
                      <option value="" disabled>Select your level</option>
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>

                  {/* Save Button or Status Message */}
                  {!preferencesLocked ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleSavePreferences}
                      disabled={preferencesLoading || !preferences.classType || !preferences.level}
                      className="w-full"
                    >
                      {preferencesLoading ? "Saving..." : "Save Preferences"}
                    </Button>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-green-400 text-sm">
                        ✓ Your preferences have been saved and locked.
                      </p>
                      <p className="text-white/50 text-xs mt-1">
                        {demoData?.status === "CONVERTED" 
                          ? "Preferences cannot be changed after conversion."
                          : "You can view your preferences but cannot change them."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-secondary font-bold mb-4">
                Schedule
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/80 mb-1">Demo Date & Time</p>
                  <p className="text-lg font-semibold">
                    {formatDateTime(demoData.scheduledStart)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Timezone</p>
                  <p className="text-lg font-semibold">{demoData.timezone}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      demoData.status === "BOOKED"
                        ? "bg-blue-500 text-white"
                        : demoData.status === "ATTENDED"
                          ? "bg-green-500 text-white"
                          : "bg-gray-500 text-white"
                    }`}
                  >
                    {demoData.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Demo Meeting Link */}
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl">🎓</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-secondary font-bold text-orange-900 mb-2">
                Attend Your Demo Session
              </h3>
              {meetingLink ? (
                <>
                  <p className="text-orange-800 mb-4">
                    Your demo session link is ready. Click below to join at the
                    scheduled time.
                  </p>
                  <a
                    href={meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button variant="primary" size="lg">
                      Join Demo Session
                    </Button>
                  </a>
                </>
              ) : (
                <p className="text-orange-800">
                  Your demo meeting link will be shared by our team before the
                  scheduled session time. Please check your email or contact
                  support.
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Payment Status */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-secondary font-bold text-navy">
                Payment Status
              </h3>
              <p className="text-gray-600 text-sm">
                Complete payment to unlock full account access
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                demoData.status === "CONVERTED"
                  ? "bg-green-100 text-green-800"
                  : demoData.status === "PAYMENT_PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {demoData.status === "CONVERTED"
                ? "PAID"
                : demoData.status === "PAYMENT_PENDING"
                  ? "PENDING"
                  : demoData.status}
            </span>
          </div>

          {/* Show Pay Now button only if status is INTERESTED */}
          {demoData.status === "INTERESTED" && demoData.status !== "CONVERTED" && selectedPlan && (
            <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-2 border-orange">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy mb-1">
                    ✓ Plan Selected - Ready to Pay
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedPlan.name}
                  </p>
                  <p className="text-sm font-semibold text-navy mt-1">
                    Amount: ₹{selectedPlan.price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Secure payment • No hidden charges
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handlePayNow}
                  disabled={processing}
                  className="min-w-[160px]"
                >
                  {processing ? "Opening..." : "💳 Pay Now"}
                </Button>
              </div>
            </div>
          )}

          {/* Show message when admin verification is pending */}
          {demoData.status !== "INTERESTED" && demoData.status !== "CONVERTED" && (
            <div className="mb-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300">
              <div className="text-center">
                <div className="text-4xl mb-3">🕒</div>
                <h3 className="text-xl font-semibold text-navy mb-2">
                  Application Under Review
                </h3>
                <p className="text-gray-700 mb-3">
                  Thank you for your interest! Our admissions team is currently reviewing your demo session and profile.
                </p>
                <p className="text-gray-600 text-sm">
                  Once verified, you'll be able to select a plan and proceed with payment to begin your chess journey with us. We'll notify you via email once the review is complete.
                </p>
                <div className="mt-4 p-3 bg-white/60 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Status:</span> Pending Admin Verification
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Currency Converter */}
        {demoData.status !== "CONVERTED" && (
          <CurrencyConverter amount={selectedPlan?.price || 2999} />
        )}

        {/* Subscription Plans */}
        {demoData.status === "INTERESTED" && demoData.status !== "CONVERTED" && (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-secondary font-bold text-navy mb-2">
                Choose Your Learning Plan
              </h2>
              <p className="text-gray-600">
                Select a plan and make payment to continue your chess journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => {
                const isSelected = selectedPlan?.plan_id === plan.plan_id;
                const isRecommended = demoData?.preferredClassType?.toLowerCase() === plan.plan_id;
                
                return (
                  <Card
                    key={plan.plan_id}
                    className={`hover:shadow-lg transition-all cursor-pointer border-2 ${
                      isSelected
                        ? "border-orange bg-orange-50"
                        : isRecommended
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 hover:border-orange"
                    }`}
                  >
                    {isRecommended && (
                      <div className="mb-3">
                        <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          ✓ RECOMMENDED FOR YOU
                        </span>
                      </div>
                    )}
                    {isSelected && (
                      <div className="mb-3">
                        <span className="inline-block bg-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                          ✓ SELECTED
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-secondary font-bold text-navy mb-2">
                        {plan.name}
                      </h3>
                      <div className="text-4xl font-bold text-navy mb-1">
                        ₹{plan.price.toLocaleString("en-IN")}
                        <span className="text-lg font-normal text-gray-600">
                          /month
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 capitalize">
                        Monthly billing • No hidden fees
                      </p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-olive mr-2 font-bold text-lg flex-shrink-0">
                            ✓
                          </span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={isSelected ? "primary" : isRecommended ? "primary" : "outline"}
                      size="lg"
                      onClick={() => handlePlanSelect(plan)}
                      className="w-full"
                    >
                      {isSelected ? "✓ Selected" : `Select ₹${plan.price.toLocaleString("en-IN")}`}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Already Paid Message */}
        {demoData.status === "CONVERTED" && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-4xl">✓</span>
              </div>
              <h3 className="text-2xl font-secondary font-bold text-green-900 mb-3">
                Payment Complete!
              </h3>
              <p className="text-green-800 text-lg mb-4">
                Your account has been activated. Login to access your full
                dashboard.
              </p>
              <div className="space-y-3 max-w-md mx-auto">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="w-full"
                >
                  Login to Main Dashboard
                </Button>
                <p className="text-green-700 text-sm">
                  Use your email (<strong>{demoData.parentEmail}</strong>) and
                  the password you set up to login.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Back Button */}
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>

      {/* Preference Mismatch Modal */}
      <PreferenceMismatchModal
        isOpen={showMismatchModal}
        onClose={() => setShowMismatchModal(false)}
        onConfirm={handleConfirmMismatch}
        onChangePreference={handleChangePreference}
        preferredType={demoData?.preferredClassType}
        selectedType={pendingPlan?.plan_id}
        selectedPlan={pendingPlan}
      />
    </div>
  );
};

export default AccessDemoAccount;
