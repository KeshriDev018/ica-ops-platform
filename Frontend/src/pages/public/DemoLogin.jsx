import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import FormInput from "../../components/forms/FormInput";
import FloatingChessPieces from "../../components/common/FloatingChessPieces";
import useDemoStore from "../../store/demoStore";
import demoAccountService from "../../services/demoAccountService";

// Validation schema
const demoLoginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
});

const DemoLogin = () => {
  const navigate = useNavigate();
  const setDemoData = useDemoStore((state) => state.setDemoData);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(demoLoginSchema),
  });

  const onSubmit = async (data) => {
    try {
      // Verify demo exists for this email (backend validation)
      const demoData = await demoAccountService.verifyDemoByEmail(data.email);

      // Store demo data in Zustand store
      setDemoData(demoData);

      // Navigate to demo account page
      navigate("/demo-access", { replace: true });
    } catch (err) {
      setError("root", {
        type: "manual",
        message:
          err.message ||
          "No demo found for this email. Please book a demo first.",
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12 relative"
      style={{
        backgroundImage: "url(/Chess/Background.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      {/* Back to Home button positioned in top-left corner */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/">
          <button className="flex items-center gap-2 text-white hover:text-orange transition-colors">
            <span className="text-xl">←</span>
            <span className="font-semibold">Back to Home</span>
          </button>
        </Link>
      </div>
      <div className="max-w-md w-full relative z-10">
        <Card className="bg-white/10 backdrop-blur-md border border-white/20">
          <div className="text-center mb-8">
            <img
              src="/LOGO.png"
              alt="Indian Chess Academy Logo"
              className="h-[128px] w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-secondary font-bold text-white mb-2">
              Access Demo Account
            </h1>
            <p className="text-white/90">
              Enter your email to access your demo session details
            </p>
          </div>

          {errors.root && (
            <div className="bg-red-500/20 border border-red-400 text-white px-4 py-3 rounded-lg mb-6">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email used for demo booking"
              error={errors.email}
              hint="Use the email you provided when booking your demo"
              labelClassName="text-white"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              {...register("email")}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-orange hover:bg-orange/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Access Demo Account"}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="text-center">
              <p className="text-sm text-white">
                Don't have a demo booked?{" "}
                <button
                  onClick={() => navigate("/book-demo")}
                  className="text-orange hover:text-white transition-colors font-medium"
                >
                  Book a Free Demo
                </button>
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-white">
                Already have a full account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-orange hover:text-white transition-colors font-medium"
                >
                  Login Here
                </button>
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-400 rounded-lg">
            <p className="text-sm text-white">
              <strong>💡 Note:</strong> This is for accessing your demo session
              details. After payment, you'll receive a password setup email to
              create your full account.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DemoLogin;
