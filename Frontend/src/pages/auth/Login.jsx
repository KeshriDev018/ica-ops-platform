import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FloatingChessPieces from "../../components/common/FloatingChessPieces";
import { loginSchema } from "../../utils/validationSchemas";
import useAuthStore from "../../store/authStore";
import useDemoStore from "../../store/demoStore";
import authService from "../../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  const { login, linkDemoAccount, role, token } = useAuthStore();
  const { demoData, clearDemoData } = useDemoStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if ((token || storedToken) && role) {
      if (role === "ADMIN") navigate("/admin/dashboard", { replace: true });
      else if (role === "COACH")
        navigate("/coach/dashboard", { replace: true });
      else if (role === "CUSTOMER")
        navigate("/customer/dashboard", { replace: true });
    }
  }, [token, role, navigate]);

  const onSubmit = async (data) => {
    try {
      const response = await authService.login(data.email, data.password);
      login(response.user, response.token);

      // Check if logging in with demo account email
      if (
        demoData &&
        demoData.parentEmail === data.email &&
        demoData.status === "CONVERTED"
      ) {
        // Link demo account data to user account
        linkDemoAccount(demoData);
        // Clear demo store after linking
        clearDemoData();
      }

      // Redirect based on role
      const userRole = response.user.role;
      if (userRole === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (userRole === "COACH") {
        navigate("/coach/dashboard", { replace: true });
      } else if (userRole === "CUSTOMER") {
        // For customers, check payment status first
        navigate("/customer/payment-check", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError("root", {
        type: "manual",
        message: err.message || "Invalid email or password",
      });
    }
  };

  const roleOptions = [
    { value: "CUSTOMER", label: "Parent/Student" },
    { value: "COACH", label: "Coach" },
    { value: "ADMIN", label: "Admin" },
  ];

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
              Welcome Back
            </h1>
            <p className="text-white/90">
              Login to your Indian Chess Academy account
            </p>
          </div>

          {successMessage && (
            <div className="bg-green-500/20 border border-green-400 text-white px-4 py-3 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {errors.root && (
            <div className="bg-red-500/20 border border-red-400 text-white px-4 py-3 rounded-lg mb-6">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
              id="email"
              label="Email"
              type="email"
              placeholder="your.email@example.com"
              error={errors.email}
              labelClassName="text-white"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              {...register("email")}
            />

            <FormInput
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password}
              labelClassName="text-white"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              {...register("password")}
            />

            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-white hover:text-orange transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-orange hover:bg-orange/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-white">
            Don't have an account?{" "}
            <Link
              to="/book-demo"
              className="text-orange hover:text-white transition-colors font-medium"
            >
              Book a Free Demo
            </Link>{" "}
            or{" "}
            <Link
              to="/demo-login"
              className="text-orange hover:text-white transition-colors font-medium"
            >
              Access Demo Account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
