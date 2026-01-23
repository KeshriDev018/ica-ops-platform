import { useEffect, useState } from "react";
import { Save, AlertCircle } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import coachService from "../../services/coachService";
import { TIMEZONE_OPTIONS } from "../../utils/timezoneConstants";

const CoachProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showTimezoneConfirm, setShowTimezoneConfirm] = useState(false);
  const [pendingTimezone, setPendingTimezone] = useState(null);

  // Form states
  const [basicInfo, setBasicInfo] = useState({
    fullName: "",
    phoneNumber: "",
    country: "",
    timezone: "",
    languages: [],
    bio: "",
    experienceYears: 0,
    specialization: [],
  });

  const [payoutInfo, setPayoutInfo] = useState({
    method: "UPI",
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    },
    upiId: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await coachService.getMyProfile();
      setProfile(data);

      // Populate basic info
      setBasicInfo({
        fullName: data.fullName || "",
        phoneNumber: data.phoneNumber || "",
        country: data.country || "",
        timezone: data.timezone || "",
        languages: data.languages || [],
        bio: data.bio || "",
        experienceYears: data.experienceYears || 0,
        specialization: data.specialization || [],
      });

      // Populate payout info
      setPayoutInfo({
        method: data.payout?.method || "UPI",
        bankDetails: data.payout?.bankDetails || {
          accountHolderName: "",
          accountNumber: "",
          ifscCode: "",
          bankName: "",
        },
        upiId: data.payout?.upiId || "",
      });

      setError(null);
    } catch (err) {
      console.error("Profile load error:", err);
      // If profile doesn't exist (404), it's okay - user can create it
      if (err.response?.status === 404) {
        setError(
          "No profile found. Please fill in your details below to create your profile.",
        );
      } else {
        setError(
          "Failed to load profile: " +
            (err.response?.data?.message || err.message),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoChange = (field, value) => {
    if (field === "timezone" && profile && profile.timezone !== value) {
      // Show confirmation for timezone change
      setPendingTimezone(value);
      setShowTimezoneConfirm(true);
      return;
    }
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const confirmTimezoneChange = () => {
    setBasicInfo((prev) => ({ ...prev, timezone: pendingTimezone }));
    setShowTimezoneConfirm(false);
    setPendingTimezone(null);
  };

  const cancelTimezoneChange = () => {
    setShowTimezoneConfirm(false);
    setPendingTimezone(null);
  };

  const handlePayoutChange = (field, value) => {
    if (field.startsWith("bank")) {
      const bankField = field.replace("bank", "").toLowerCase();
      setPayoutInfo((prev) => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [bankField]: value },
      }));
    } else {
      setPayoutInfo((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSaveBasicInfo = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await coachService.updateMyProfile(basicInfo);
      
      // Check if message included (timezone update with class count)
      if (response.message) {
        setSuccess(response.message);
      } else {
        setSuccess("Profile updated successfully!");
      }
      
      setTimeout(() => setSuccess(null), 5000);
      await loadProfile(); // Reload to get fresh data
    } catch (err) {
      setError("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayoutInfo = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await coachService.updateMyPayoutDetails(payoutInfo);
      setSuccess("Payout details updated! Pending admin verification.");
      setTimeout(() => setSuccess(null), 3000);
      await loadProfile(); // Reload to get updated verification status
    } catch (err) {
      setError("Failed to update payout details: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          My Profile
        </h1>
        <p className="text-gray-600">
          Manage your personal and payout information
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <h2 className="text-xl font-semibold text-navy mb-4">
          Basic Information
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={basicInfo.fullName}
              onChange={(e) =>
                handleBasicInfoChange("fullName", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={basicInfo.phoneNumber}
              onChange={(e) =>
                handleBasicInfoChange("phoneNumber", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <input
              type="text"
              value={basicInfo.country}
              onChange={(e) => handleBasicInfoChange("country", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone *
            </label>
            <select
              value={basicInfo.timezone}
              onChange={(e) =>
                handleBasicInfoChange("timezone", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent"
              required
            >
              <option value="">Select timezone...</option>
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              ⚠️ Changing timezone will update ALL your scheduled classes
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience (Years)
            </label>
            <input
              type="number"
              value={basicInfo.experienceYears}
              onChange={(e) =>
                handleBasicInfoChange(
                  "experienceYears",
                  parseInt(e.target.value) || 0,
                )
              }
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={basicInfo.bio}
              onChange={(e) => handleBasicInfoChange("bio", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="primary"
            onClick={handleSaveBasicInfo}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Basic Info"}
          </Button>
        </div>
      </Card>

      {/* Payout Information */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-navy">
            Payout Information
          </h2>
          {profile?.payout?.isVerified ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              ✓ Verified
            </span>
          ) : (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
              ⏳ Pending Verification
            </span>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payout Method *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="UPI"
                checked={payoutInfo.method === "UPI"}
                onChange={(e) => handlePayoutChange("method", e.target.value)}
                className="mr-2"
              />
              UPI
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="BANK"
                checked={payoutInfo.method === "BANK"}
                onChange={(e) => handlePayoutChange("method", e.target.value)}
                className="mr-2"
              />
              Bank Account
            </label>
          </div>
        </div>

        {payoutInfo.method === "UPI" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UPI ID *
            </label>
            <input
              type="text"
              value={payoutInfo.upiId}
              onChange={(e) => handlePayoutChange("upiId", e.target.value)}
              placeholder="yourname@upi"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Holder Name *
              </label>
              <input
                type="text"
                value={payoutInfo.bankDetails.accountHolderName}
                onChange={(e) =>
                  handlePayoutChange("bankAccountHolderName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number *
              </label>
              <input
                type="text"
                value={payoutInfo.bankDetails.accountNumber}
                onChange={(e) =>
                  handlePayoutChange("bankAccountNumber", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code *
              </label>
              <input
                type="text"
                value={payoutInfo.bankDetails.ifscCode}
                onChange={(e) =>
                  handlePayoutChange("bankIfscCode", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                value={payoutInfo.bankDetails.bankName}
                onChange={(e) =>
                  handlePayoutChange("bankBankName", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Any changes to payout details will require
            admin verification before payouts can be processed.
          </p>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="primary"
            onClick={handleSavePayoutInfo}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Payout Info"}
          </Button>
        </div>
      </Card>

      {/* Payout Rates (Read-only, set by admin) */}
      {profile && (
        <Card>
          <h2 className="text-xl font-semibold text-navy mb-4">
            Your Rates (Set by Admin)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Per Class Rate</div>
              <div className="text-2xl font-bold text-navy">
                ₹{profile.payoutPerClass || 0}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Per Batch Rate</div>
              <div className="text-2xl font-bold text-navy">
                ₹{profile.payoutPerBatch || 0}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Timezone Change Confirmation Modal */}
      {showTimezoneConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <h3 className="text-xl font-bold text-navy mb-4">
              ⚠️ Confirm Timezone Change
            </h3>
            <p className="text-gray-700 mb-4">
              Changing your timezone will update{" "}
              <strong>ALL your scheduled classes</strong> (past and future) to
              reflect the new timezone.
            </p>
            <p className="text-gray-700 mb-6">
              Are you sure you want to change from{" "}
              <strong>{profile?.timezone}</strong> to{" "}
              <strong>{pendingTimezone}</strong>?
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={cancelTimezoneChange}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmTimezoneChange}
                className="flex-1"
              >
                Yes, Update Timezone
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CoachProfile;
