import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — SiiKET" },
      {
        name: "description",
        content:
          "Read SiiKET's Privacy Policy to learn how we collect, use, protect, and safeguard your personal information when you use our platform.",
      },
    ],
  }),
  component: PrivacyPage,
});
function PrivacyPage() {
    return (
        <div className="min-h-screen">
            <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
                <div className="mb-16">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                        Legal
                    </p>

                    <h1 className="mt-3 text-5xl font-bold tracking-tight text-gray-900">
                        Privacy Policy
                    </h1>

                    <p className="mt-4 text-gray-600 text-lg leading-8 max-w-2xl">
                        We value your privacy and are committed to protecting your personal
                        information. This policy explains how SiiKET collects, uses, and
                        safeguards your data.
                    </p>

                    <p className="mt-6 text-sm text-gray-500">
                        Last Updated: June 2026
                    </p>
                </div>

                <div className="space-y-10 text-gray-700 leading-8">

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            1. Introduction
                        </h2>

                        <p>
                            At <span className="font-semibold">SiiKET</span>, we respect your
                            privacy and are committed to protecting the personal information you
                            share with us. This Privacy Policy outlines how we collect, use, and
                            safeguard your information whenever you access or use our platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                            2.1 Information We Collect
                        </h2>

                        <div className="space-y-6">

                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    Personal Identifiers
                                </h3>

                                <p className="mt-2 text-gray-600">
                                    Name, email address, phone number, and physical billing address.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    Transactional Information
                                </h3>

                                <p className="mt-2 text-gray-600">
                                    History of tickets purchased, payment reference IDs, and
                                    cancellation logs.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    Device Information
                                </h3>

                                <p className="mt-2 text-gray-600">
                                    IP address, browser type, cookies, and system information
                                    collected while using our platform.
                                </p>
                            </div>

                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                            2.2 How We Use Your Data
                        </h2>

                        <ul className="space-y-4 list-disc pl-6 text-gray-600">
                            <li>Account creation and OTP SMS verification.</li>
                            <li>Sending ticket confirmations and download links.</li>
                            <li>Managing customer support, disputes, cancellations, and refunds.</li>
                            <li>Providing important legal updates and event notifications.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                            2.3 Data Security & Sharing
                        </h2>

                        <div className="space-y-5 text-gray-600">
                            <p>
                                We do <span className="font-medium">not</span> sell your personal
                                information to third parties.
                            </p>

                            <p>
                                Your information is shared only with authorized payment gateways
                                to process secure transactions and with event organizers solely
                                for entry verification and crowd management.
                            </p>
                        </div>
                    </section>

                    <section className="border-t pt-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Contact Us
                        </h2>

                        <p className="text-gray-600 mb-8">
                            For any questions, disputes, policy clarifications, or grievance
                            redressal, please contact us.
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
                                    House No. 4, Bakul Path<br />
                                    Ganesh Nagar, Garbhanga<br />
                                    Kamrup Metropolitan<br />
                                    Assam, India
                                </p>
                            </div>

                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
