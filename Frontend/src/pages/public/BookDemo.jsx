import { useForm } from "react-hook-form";
import api from "../../lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
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
    <div className="min-h-screen bg-cream py-16 px-6 relative">
      <FloatingChessPieces />
      <div className="container mx-auto max-w-2xl relative z-10">
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-secondary font-bold text-navy mb-2">
              Book a Free Demo
            </h1>
            <p className="text-gray-600">
              Experience our coaching methodology firsthand
            </p>
          </div>

          {errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormInput
              id="studentName"
              label="Student Name"
              placeholder="Enter student's name"
              error={errors.studentName}
              {...register("studentName")}
            />

            <FormInput
              id="parentName"
              label="Parent Name"
              placeholder="Enter parent's name"
              error={errors.parentName}
              {...register("parentName")}
            />

            <FormInput
              id="parentEmail"
              label="Parent Email"
              type="email"
              placeholder="parent@example.com"
              error={errors.parentEmail}
              {...register("parentEmail")}
            />

            <FormInput
              id="studentAge"
              label="Student Age"
              type="number"
              placeholder="Enter student's age"
              error={errors.studentAge}
              {...register("studentAge", { valueAsNumber: true })}
            />

            <FormSelect
              id="country"
              label="Country"
              options={countries}
              error={errors.country}
              {...register("country")}
            />

            <FormSelect
              id="timezone"
              label="Timezone"
              options={timezones}
              error={errors.timezone}
              {...register("timezone")}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormInput
                id="preferred_date"
                label="Preferred Date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                error={errors.preferred_date}
                {...register("preferred_date")}
              />

              <FormInput
                id="preferred_time"
                label="Preferred Time"
                type="time"
                error={errors.preferred_time}
                {...register("preferred_time")}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
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
