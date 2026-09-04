import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/refund")({
    head: () => ({
        meta: [
            { title: "Cancellation & Refund Policy — SiiKET" },
            {
                name: "description",
                content:
                    "Learn about SiiKET's cancellation and refund policy, including eligibility, refund timelines, and processing details.",
            },
        ],
    }),
    component: RefundPage,
});

function RefundPage() {
    return (
        <div className="min-h-screen">
            <main className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
                <div className="mb-16">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                        Legal
                    </p>

                    <h1 className="mt-3 text-5xl font-bold tracking-tight text-gray-900">
                        Cancellation & Refund Policy
                    </h1>

                    <p className="mt-4 text-gray-600 text-lg leading-8 max-w-2xl">
                        This Cancellation & Refund Policy explains when refunds are available,
                        how cancellations are handled, and the expected processing timelines
                        for purchases made through the SiiKET platform.
                    </p>

                    <p className="mt-6 text-sm text-gray-500">
                        Last Updated: June 2026
                    </p>
                </div>

                <div className="space-y-16 text-gray-700 leading-8">

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Introduction
                        </h2>

                        <p>
                            At <span className="font-semibold">SiiKET</span>, we aim to provide
                            transparent and fair procedures for canceled events, booking
                            modifications, and refund requests. Please read this policy
                            carefully before purchasing tickets.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                            3.1 Eligibility for Refunds
                        </h2>

                        <div className="space-y-8">

                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    Event Cancellations
                                </h3>

                                <p className="mt-2 text-gray-600">
                                    If an event is completely canceled by the Event Organizer, a
                                    full refund of the base ticket value will be initiated
                                    automatically to the original payment method.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    User-Initiated Cancellations
                                </h3>

                                <p className="mt-2 text-gray-600">
                                    Refund eligibility for cancellations requested by users depends
                                    entirely on the refund policy defined by the respective Event
                                    Organizer at the time of booking. Some tickets may be clearly
                                    marked as <span className="font-medium">"Non-Refundable"</span>.
                                </p>
                            </div>

                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                            3.2 Timeline & Processing
                        </h2>

                        <div className="space-y-6 text-gray-600">

                            <p>
                                Once a refund has been approved or automatically initiated due to
                                an event cancellation, the refund will be processed back to the
                                original payment source used during the purchase.
                            </p>

                            <p>
                                Refunds generally reflect in your account within
                                <span className="font-medium text-gray-900">
                                    {" "}4–5 working days
                                </span>,
                                depending on your bank or payment provider's processing cycle.
                            </p>

                        </div>
                    </section>

                    <section className="border-t pt-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Contact Us
                        </h2>

                        <p className="text-gray-600 mb-8">
                            For any questions, disputes, policy clarifications, or grievance
                            redressal regarding cancellations or refunds, please contact us.
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
                                    House No. 4, Bakul Path
                                    <br />
                                    Ganesh Nagar, Garbhanga
                                    <br />
                                    Kamrup Metropolitan
                                    <br />
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
