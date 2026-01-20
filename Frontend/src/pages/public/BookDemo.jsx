import { useForm } from "react-hook-form";
import api from "../../lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FloatingChessPieces from "../../components/common/FloatingChessPieces";
import { bookDemoSchema } from "../../utils/validationSchemas";
import demoService from "../../services/demoService";

const BookDemo = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(bookDemoSchema),
    defaultValues: {
      timezone: "Asia/Kolkata",
      country: "India",
    },
  });

  const onSubmit = async (data) => {
    try {
      // Calculate scheduledStart and scheduledEnd
      const scheduledStart = new Date(
        `${data.preferred_date}T${data.preferred_time}:00`,
      );
      const scheduledEnd = new Date(scheduledStart.getTime() + 60 * 60 * 1000); // Add 1 hour

      const payload = {
        studentName: data.studentName,
        parentName: data.parentName,
        parentEmail: data.parentEmail,
        timezone: data.timezone,
        scheduledStart: scheduledStart.toISOString(),
        scheduledEnd: scheduledEnd.toISOString(),
        country: data.country,
        studentAge: data.studentAge,
      };

      console.log("Submitting demo booking:", payload);
      const demoData = await demoService.create(payload);
      console.log("Demo booked successfully:", demoData);

      // Navigate to thank you page with demo data
      navigate("/thank-you", {
        state: { demoData },
      });
    } catch (err) {
      console.error("Demo booking error:", err);
      console.error("Error response:", err.response);
      setError("root", {
        type: "manual",
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to book demo. Please try again.",
      });
    }
  };

  const timezones = [
    { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
    { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
    { value: "America/New_York", label: "America/New_York (EST)" },
    { value: "Europe/London", label: "Europe/London (GMT)" },
  ];

  const countries = [
    { value: "India", label: "India" },
    { value: "United States", label: "United States" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "Canada", label: "Canada" },
    { value: "Australia", label: "Australia" },
    { value: "Singapore", label: "Singapore" },
    { value: "UAE", label: "UAE" },
  ];

  return (
    <div
      className="min-h-screen py-16 px-6 relative"
      style={{
        backgroundImage: "url(/Chess/Background.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      {/* Back to Home button - top-left corner */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/">
          <button className="flex items-center gap-2 text-white hover:text-orange transition-colors">
            <span className="text-xl">←</span>
            <span className="font-semibold">Back to Home</span>
          </button>
        </Link>
      </div>
      {/* Back to Login button - top-right corner */}
      <div className="absolute top-6 right-6 z-20">
        <Link to="/login">
          <button className="flex items-center gap-2 text-white hover:text-orange transition-colors">
            <span className="font-semibold">Back to Login</span>
            <span className="text-xl">→</span>
          </button>
        </Link>
      </div>
      <div className="container mx-auto max-w-2xl relative z-10">
        <Card className="bg-white/10 backdrop-blur-md border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-secondary font-bold text-white mb-2">
              Book a Free Demo
            </h1>
            <p className="text-white/90">
              Experience our coaching methodology firsthand
            </p>
          </div>

          {errors.root && (
            <div className="bg-red-500/20 border border-red-400 text-white px-4 py-3 rounded-lg mb-6">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
              id="studentName"
              label="Student Name"
              placeholder="Enter student's name"
              error={errors.studentName}
              labelClassName="text-white"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              {...register("studentName")}
            />

            <FormInput
              id="parentName"
              label="Parent Name"
              placeholder="Enter parent's name"
              error={errors.parentName}
              labelClassName="text-white"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              {...register("parentName")}
            />

            <FormInput
              id="parentEmail"
              label="Parent Email"
              type="email"
              placeholder="parent@example.com"
              error={errors.parentEmail}
              labelClassName="text-white"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              {...register("parentEmail")}
            />

            <FormInput
              id="studentAge"
              label="Student Age"
              type="number"
              placeholder="Enter student's age"
              error={errors.studentAge}
              labelClassName="text-white"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              {...register("studentAge", { valueAsNumber: true })}
            />

            <FormSelect
              id="country"
              label="Country"
              options={countries}
              error={errors.country}
              labelClassName="text-white"
              className="bg-white/10 border-white/20 text-white"
              {...register("country")}
            />

            <FormSelect
              id="timezone"
              label="Timezone"
              options={timezones}
              error={errors.timezone}
              labelClassName="text-white"
              className="bg-white/10 border-white/20 text-white"
              {...register("timezone")}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormInput
                id="preferred_date"
                label="Preferred Date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                error={errors.preferred_date}
                labelClassName="text-white"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                {...register("preferred_date")}
              />

              <FormInput
                id="preferred_time"
                label="Preferred Time"
                type="time"
                error={errors.preferred_time}
                labelClassName="text-white"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                {...register("preferred_time")}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-orange hover:bg-orange/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Booking..." : "Book Free Demo"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default BookDemo;
