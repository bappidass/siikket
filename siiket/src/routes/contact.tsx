import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — SiiKET" },
      { name: "description", content: "Get in touch with SiiKET for any questions about bookings, events, or partnerships." },
    ],
  }),
  component: ContactPage,
});

function FloatingInput({
  label,
  type = "text",
  defaultValue,
  placeholder,
}: {
  label: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[#1f2a44]/70 mb-2">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-[#1f2a44]/30 focus:border-[#1f2a44] focus:outline-none text-sm text-[#1f2a44] placeholder:text-[#1f2a44]/40 py-2"
      />
    </label>
  );
}

function ContactPage() {
  return (
    <div className="min-h-screen">
      <main className="flex justify-center items- py-10 md:py-20 px-2">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] p-3 grid md:grid-cols-[minmax(0,420px)_1fr] gap-0 overflow-hidden">
          {/* Left panel */}
          <div className="relative rounded-xl overflow-hidden bg-linear-to-br from-[#1f2a44] via-[#1a2238] to-[#0f1729] text-white p-10 min-h-140">
            <h2 className="text-2xl font-bold">Contact Information</h2>
            <p className="mt-2 text-sm text-white/70">Say something to start a live chat!</p>

            <div className="mt-14 space-y-8 text-sm">
              <div className="flex items-center gap-5">
                <Phone className="h-5 w-5 shrink-0" />
                <span>+91 77350 51922</span>
              </div>
              <div className="flex items-center gap-5">
                <Mail className="h-5 w-5 shrink-0" />
                <span>hello@siiket.com</span>
              </div>
              <div className="flex items-start gap-5">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                 House No. 04, Bakool Path, Ganesh Nagar Basistha, Kamrup Metro Assam-781029
                </span>
              </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute -bottom-10 right-8 h-44 w-44 rounded-full bg-white/5" />
            <div className="absolute bottom-16 right-24 h-24 w-24 rounded-full bg-white/10" />
          </div>

          <form className="p-10 md:p-14 pb-6 flex flex-col">
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-10">
              <FloatingInput label="First Name" />
              <FloatingInput label="Last Name" defaultValue="" />
              <FloatingInput label="Email" type="email" />
              <FloatingInput label="Phone Number" defaultValue="+91" />
              <div className="sm:col-span-2">
                <FloatingInput label="Message" placeholder="Write your message.." />
              </div>
            </div>

            <div className="mt-auto pt-12 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-[#1d4ed8] hover:bg-[#1e40af] transition-colors text-white px-8 py-3.5 text-sm font-medium shadow-[0_10px_25px_-10px_rgba(29,78,216,0.7)]"
              >
                <MessageCircle className="h-4 w-4" />
                Contact Us
              </button>
            </div>
          </form>
        </div>
      </main>

    </div>
  );
}
