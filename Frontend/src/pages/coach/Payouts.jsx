import { useEffect, useState } from "react";
import { format } from "date-fns";
import Card from "../../components/common/Card";
import coachPayoutService from "../../services/coachPayoutService";

const CoachPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: 0,
    currentMonth: 0,
    pendingPayouts: 0,
  });

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const data = await coachPayoutService.getMyPayoutHistory();
      setPayouts(data);

      // Calculate stats
      const totalEarned = data
        .filter((p) => p.status === "PROCESSED")
        .reduce((sum, p) => sum + p.amount, 0);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const currentMonthEarned = data
        .filter((p) => {
          const payoutDate = new Date(p.createdAt);
          return (
            payoutDate.getMonth() === currentMonth &&
            payoutDate.getFullYear() === currentYear &&
            p.status === "PROCESSED"
          );
        })
        .reduce((sum, p) => sum + p.amount, 0);

      const pendingPayouts = data.filter(
        (p) => p.status === "INITIATED",
      ).length;

      setStats({
        totalEarned,
        currentMonth: currentMonthEarned,
        pendingPayouts,
      });
    } catch (error) {
      console.error("Error loading payouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PROCESSED: "bg-green-100 text-green-700",
      INITIATED: "bg-yellow-100 text-yellow-700",
      FAILED: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading payouts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          My Payouts
        </h1>
        <p className="text-gray-600">Track your earnings and payout history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <div className="text-sm text-gray-600 mb-1">Total Earned</div>
          <div className="text-3xl font-bold text-navy">
            ₹{stats.totalEarned.toLocaleString()}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">This Month</div>
          <div className="text-3xl font-bold text-green-600">
            ₹{stats.currentMonth.toLocaleString()}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">Pending Payouts</div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats.pendingPayouts}
          </div>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card>
        <h2 className="text-xl font-semibold text-navy mb-4">Payout History</h2>

        {payouts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💵</div>
            <h3 className="text-xl font-semibold text-navy mb-2">
              No Payouts Yet
            </h3>
            <p className="text-gray-600">
              Your payout history will appear here once payouts are processed
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Period
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Breakdown
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Processed Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{payout.payoutPeriod}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(payout.periodStart), "MMM dd")} -{" "}
                        {format(new Date(payout.periodEnd), "MMM dd, yyyy")}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-navy">
                        ₹{payout.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payout.currency}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm space-y-1">
                        {payout.breakdown?.classesCount > 0 && (
                          <div className="text-gray-600">
                            {payout.breakdown.classesCount} classes × ₹
                            {payout.breakdown.perClassRate}
                          </div>
                        )}
                        {payout.breakdown?.batchesCount > 0 && (
                          <div className="text-gray-600">
                            {payout.breakdown.batchesCount} batches × ₹
                            {payout.breakdown.perBatchRate}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(payout.status)}
                      {payout.status === "FAILED" && payout.failureReason && (
                        <div className="text-xs text-red-600 mt-1">
                          {payout.failureReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {payout.processedAt
                        ? format(
                            new Date(payout.processedAt),
                            "MMM dd, yyyy h:mm a",
                          )
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CoachPayouts;
