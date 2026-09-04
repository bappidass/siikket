
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // This is a demo reset - in a real app, you would send a reset email via backend
    setTimeout(() => {
      setIsLoading(false);
      
      if (email) {
        setIsSubmitted(true);
        toast({
          title: "Reset email sent",
          description: "Check your inbox for password reset instructions",
        });
      } else {
        toast({
          title: "Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
      }
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <Mail className="h-8 w-8 text-gray-700" />
          </div>
        </div>
        <h3 className="text-xl font-medium text-gray-800">Check your email</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          We've sent a password reset link to <span className="font-medium text-gray-600">{email}</span>
        </p>
        <div className="pt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="w-full border-blue-200 hover:bg-blue-50 text-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="reset-email" className="flex items-center text-gray-700">
          <Mail className="mr-2 h-4 w-4 text-gray-700" />
          Email
        </Label>
        <Input
          id="reset-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="appearance-none rounded-md relative block w-full border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          disabled={isLoading}
        />
      </div>

      <div>
        <Button
          type="submit"
          className="w-full rounded-md h-11 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-medium transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Sending reset link...
            </span>
          ) : (
            "Send reset link"
          )}
        </Button>
      </div>

      <div className="text-center">
        <Button
          variant="link"
          type="button"
          onClick={() => navigate("/auth")}
          className="text-sm text-gray-800 hover:text-gray-800 flex items-center mx-auto"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back to login
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;