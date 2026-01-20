import { useEffect, useState } from "react";
import {
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  Target,
  Activity,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import intelligenceService from "../../services/intelligenceService";

const AdminIntelligence = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [conversionData, setConversionData] = useState([]);
  const [slaData, setSlaData] = useState([]);
  const [coachEffectiveness, setCoachEffectiveness] = useState([]);
  const [dropoffRisks, setDropoffRisks] = useState([]);
  const [funnelSimulation, setFunnelSimulation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await intelligenceService.getOverview();
      setOverview(data);
    } catch (error) {
      console.error("Error loading intelligence overview:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load overview",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadConversionPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await intelligenceService.getConversionPrediction();
      setConversionData(data);
    } catch (error) {
      console.error("Error loading conversion prediction:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load conversion prediction",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAdminSLA = async () => {
    setLoading(true);
    try {
      const data = await intelligenceService.getAdminSLA();
      setSlaData(data);
    } catch (error) {
      console.error("Error loading admin SLA:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCoachEffectiveness = async () => {
    setLoading(true);
    try {
      const data = await intelligenceService.getCoachEffectiveness();
      setCoachEffectiveness(data);
    } catch (error) {
      console.error("Error loading coach effectiveness:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDropoffRisks = async () => {
    setLoading(true);
    try {
      const data = await intelligenceService.getDropoffRisk();
      setDropoffRisks(data);
    } catch (error) {
      console.error("Error loading dropoff risks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFunnelSimulation = async () => {
    setLoading(true);
    try {
      const data = await intelligenceService.simulateFunnel({
        improveFollowUp: true,
        followUpBoost: 0.1,
        coachEffectivenessBoost: 0.15,
      });
      setFunnelSimulation(data);
    } catch (error) {
      console.error("Error loading funnel simulation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case "conversion":
        if (conversionData.length === 0) loadConversionPrediction();
        break;
      case "sla":
        if (slaData.length === 0) loadAdminSLA();
        break;
      case "coach":
        if (coachEffectiveness.length === 0) loadCoachEffectiveness();
        break;
      case "dropoff":
        if (dropoffRisks.length === 0) loadDropoffRisks();
        break;
      case "funnel":
        if (!funnelSimulation) loadFunnelSimulation();
        break;
      default:
        break;
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading intelligence...</div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <div className="text-center">
            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-navy mb-2">
              Error Loading Intelligence
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadOverview}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-secondary font-bold text-navy mb-2">
          Intelligence & Insights
        </h1>
        <p className="text-gray-600">
          AI-powered analytics and operational decision support
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => handleTabChange("overview")}
          className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "overview"
              ? "border-navy text-navy"
              : "border-transparent text-gray-600 hover:text-navy"
          }`}
        >
          <div className="flex items-center gap-2">
            <Lightbulb size={18} />
            Overview
          </div>
        </button>
        <button
          onClick={() => handleTabChange("conversion")}
          className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "conversion"
              ? "border-navy text-navy"
              : "border-transparent text-gray-600 hover:text-navy"
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={18} />
            Conversion Prediction
          </div>
        </button>
        <button
          onClick={() => handleTabChange("sla")}
          className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "sla"
              ? "border-navy text-navy"
              : "border-transparent text-gray-600 hover:text-navy"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock size={18} />
            Admin SLA
          </div>
        </button>
        <button
          onClick={() => handleTabChange("coach")}
          className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "coach"
              ? "border-navy text-navy"
              : "border-transparent text-gray-600 hover:text-navy"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={18} />
            Coach Effectiveness
          </div>
        </button>
        <button
          onClick={() => handleTabChange("dropoff")}
          className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "dropoff"
              ? "border-navy text-navy"
              : "border-transparent text-gray-600 hover:text-navy"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            Drop-off Risks
          </div>
        </button>
        <button
          onClick={() => handleTabChange("funnel")}
          className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
            activeTab === "funnel"
              ? "border-navy text-navy"
              : "border-transparent text-gray-600 hover:text-navy"
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={18} />
            Funnel Simulation
          </div>
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && overview && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-navy to-navy/90 text-white">
            <div className="flex items-start gap-4">
              <Activity size={48} className="text-orange flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Operational Intelligence Layer
                </h2>
                <p className="text-white/90">{overview.description}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {overview.features.map((feature) => (
              <Card
                key={feature.id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-navy font-bold">{feature.id}</span>
                  </div>
                  <h3 className="font-bold text-navy text-lg leading-tight">
                    {feature.name}
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Problem:</p>
                    <p className="text-gray-800">{feature.problemSolved}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Solution:</p>
                    <p className="text-gray-800">{feature.whatItDoes}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Output:</p>
                    <p className="text-gray-800">{feature.output}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Conversion Prediction Tab */}
      {activeTab === "conversion" && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy">
              Demo Conversion Prediction
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={loadConversionPrediction}
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading predictions...</div>
            </div>
          ) : conversionData.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">No active demos to analyze</p>
              <p className="text-gray-500 text-sm">
                Demos must have status: ATTENDED, INTERESTED, or PAYMENT_PENDING
              </p>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Demo ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Score
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Risk Level
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Reasons
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {conversionData.map((demo) => (
                    <tr
                      key={demo.demoId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm font-mono text-gray-600">
                        {demo.demoId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-navy h-2 rounded-full"
                              style={{ width: `${demo.conversionScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-navy">
                            {demo.conversionScore}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            demo.riskLevel === "LOW"
                              ? "bg-green-100 text-green-800"
                              : demo.riskLevel === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {demo.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <ul className="list-disc list-inside space-y-1">
                          {demo.reasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Admin SLA Tab */}
      {activeTab === "sla" && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy">
              Admin Follow-up SLA Tracking
            </h2>
            <Button variant="outline" size="sm" onClick={loadAdminSLA}>
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading SLA data...</div>
            </div>
          ) : slaData.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No SLA data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Demo ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Follow-up Time
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      SLA Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {slaData.map((item) => (
                    <tr
                      key={item.demoId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm font-mono text-gray-600">
                        {item.demoId}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {item.followUpMinutes} minutes
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.slaStatus === "EXCELLENT"
                              ? "bg-green-100 text-green-800"
                              : item.slaStatus === "WARNING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.slaStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Coach Effectiveness Tab */}
      {activeTab === "coach" && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy">
              Coach Effectiveness Index
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={loadCoachEffectiveness}
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading coach data...</div>
            </div>
          ) : coachEffectiveness.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No coach data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Coach ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Total Demos
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Conversion Rate
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Interest Rate
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Effectiveness Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coachEffectiveness.map((coach) => (
                    <tr
                      key={coach.coachId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm font-mono text-gray-600">
                        {coach.coachId}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {coach.totalJudgedDemos}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {(coach.conversionRate * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {(coach.interestRate * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-navy h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, Math.max(0, coach.coachScore))}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-navy">
                            {Math.round(coach.coachScore)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Drop-off Risks Tab */}
      {activeTab === "dropoff" && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy">
              Early Drop-off Risk Detection
            </h2>
            <Button variant="outline" size="sm" onClick={loadDropoffRisks}>
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading risk data...</div>
            </div>
          ) : dropoffRisks.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No risk data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Demo ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Risk Level
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Risk Reasons
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dropoffRisks.map((demo) => (
                    <tr
                      key={demo.demoId}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm font-mono text-gray-600">
                        {demo.demoId}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {demo.status}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            demo.riskLevel === "LOW"
                              ? "bg-green-100 text-green-800"
                              : demo.riskLevel === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {demo.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {demo.riskReasons.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1">
                            {demo.riskReasons.map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400">
                            No risks detected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Funnel Simulation Tab */}
      {activeTab === "funnel" && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy">
              What-if Funnel Simulator
            </h2>
            <Button variant="outline" size="sm" onClick={loadFunnelSimulation}>
              Run Simulation
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Running simulation...</div>
            </div>
          ) : !funnelSimulation ? (
            <div className="text-center py-12">
              <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Simulate the impact of operational improvements
              </p>
              <Button variant="primary" onClick={loadFunnelSimulation}>
                Run Simulation
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-navy mb-4">
                    Current Performance
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Attendance Rate
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {(
                          funnelSimulation.current.attendanceRate * 100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Conversion Rate
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {(
                          funnelSimulation.current.conversionRate * 100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">
                    Simulated Performance
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-green-700 mb-1">
                        Attendance Rate
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {(
                          funnelSimulation.simulated.attendanceRate * 100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 mb-1">
                        Conversion Rate
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {(
                          funnelSimulation.simulated.conversionRate * 100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-navy mb-2">
                  Simulation Assumptions:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {funnelSimulation.assumptions.map((assumption, idx) => (
                    <li key={idx}>{assumption}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminIntelligence;
