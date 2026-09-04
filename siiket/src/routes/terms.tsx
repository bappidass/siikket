import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — SiiKET" },
      {
        name: "description",
        content:
          "Read SiiKET's Terms & Conditions governing the use of our platform, ticket bookings, payments, and user responsibilities.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
        <div className="mb-10">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Legal</p>

          <h1 className="mt-3 text-5xl font-bold tracking-tight text-gray-900">
            Terms & Conditions
          </h1>

          <p className="mt-4 text-gray-600 text-lg leading-8 max-w-2xl">
            These Terms & Conditions govern your use of the SiiKET platform, website, mobile
            application, and ticketing services. By accessing or using our Platform, you agree to
            comply with these Terms.
          </p>

          <p className="mt-6 text-sm text-gray-500">Last Updated: June 2026</p>
        </div>

        <div className="space-y-10 text-gray-700 leading-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Introduction</h2>

            <p>
              Welcome to <span className="font-semibold">SiiKET</span>. These Terms and Conditions
              ("Terms") govern your use of the SiiKET platform, website, mobile application, and
              ticketing services (collectively, the "Platform"). By accessing or using our Platform,
              you agree to comply with and be bound by these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">1.1 Platform Services</h2>

            <p className="text-gray-600">
              SiiKET is an online ticketing platform that facilitates the discovery, promotion, and
              purchase of tickets for sports events, concerts, and live entertainment. SiiKET acts
              solely as a ticketing agent and service provider and does not organize, host, or
              manage events unless explicitly stated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              1.2 User Accounts & Registration
            </h2>

            <ul className="space-y-4 list-disc pl-6 text-gray-600">
              <li>
                Users must create an account using valid information verified through a One-Time
                Password (OTP).
              </li>

              <li>
                You are responsible for maintaining the confidentiality of your account credentials
                and for all activities performed under your account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">1.3 Booking & Payments</h2>

            <ul className="space-y-4 list-disc pl-6 text-gray-600">
              <li>All ticket purchases are subject to availability and organizer approval.</li>

              <li>Payments must be completed through our authorized payment gateways.</li>

              <li>
                Upon successful payment, booking confirmations and ticket download links will be
                sent to your registered communication channels.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">1.4 Prohibited Activities</h2>

            <ul className="space-y-4 list-disc pl-6 text-gray-600">
              <li>Unauthorized resale of tickets for commercial gain.</li>

              <li>Attempting to bypass security measures or interfere with the Platform.</li>

              <li>Using the Platform for fraudulent, illegal, or abusive purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              1.5 Limitation of Liability
            </h2>

            <p className="text-gray-600">
              SiiKET is not responsible for event cancellations, postponements, schedule changes,
              venue changes, or the quality of event execution. These matters remain the sole
              responsibility of the respective Event Organizer.
            </p>
          </section>

          <section className="border-t pt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Us</h2>

            <p className="text-gray-600 mb-8">
              For any questions, disputes, policy clarifications, or grievance redressal, please
              contact us.
            </p>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a
                  href="mailto:hello@siiket.com"
                  className="mt-1 inline-block font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  hello@siiket.com
                </a>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <a
                  href="tel:+917002560493"
                  className="mt-1 inline-block font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  +91 7002560493
                </a>
              </div>

              <div>
                <p className="text-sm text-gray-500">Registered Address</p>

                <p className="mt-1 text-gray-900 leading-7">
                  House No. 4, Bakool Path
                  <br />
                  Ganesh Nagar Basistha,
                  <br />
                  Kamrup Metro
                  <br />
                  Assam-781029
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
