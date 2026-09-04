import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Ticket,
  Zap,
  ShieldCheck,
  PartyPopper,
  ArrowRight,
  Compass,
  MousePointerClick,
  CreditCard,
  Sparkles,
} from "lucide-react";
import founder from "@/assets/founder.jpeg";
import ceo from "@/assets/ceo.jpeg";
export const Route = createFileRoute("/aboutus")({
  head: () => ({
    meta: [
      { title: "About Us — SiiKET" },
      {
        name: "description",
        content:
          "SiiKET is an online ticketing platform built to make discovering and booking live experiences simple, secure, and exciting.",
      },
      { property: "og:title", content: "About SiiKET" },
      {
        property: "og:description",
        content:
          "Learn about SiiKET's mission to connect people with the live experiences they love.",
      },
    ],
  }),
  component: About,
});

/* ---------------- Static content ---------------- */

const WHAT_WE_DO = [
  {
    icon: Ticket,
    title: "Easy Ticketing",
    desc: "Discover and book tickets in just a few steps.",
  },
  {
    icon: Zap,
    title: "Fast & Simple",
    desc: "A smooth booking experience across web and mobile.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "Secure transactions through authorized payment gateways.",
  },
  {
    icon: PartyPopper,
    title: "Live Experiences",
    desc: "Sports, concerts, entertainment and more.",
  },
];

const HOW_IT_WORKS = [
  {
    icon: Compass,
    title: "Discover",
    desc: "Find upcoming events that match your interests.",
  },
  {
    icon: MousePointerClick,
    title: "Choose",
    desc: "Explore event details and available tickets.",
  },
  {
    icon: CreditCard,
    title: "Book",
    desc: "Complete your booking through a secure payment process.",
  },
  {
    icon: Sparkles,
    title: "Experience",
    desc: "Receive your ticket and enjoy the event.",
  },
];

const STATS = [
  { value: "10K+", label: "Tickets Sold" },
  { value: "100+", label: "Events" },
  { value: "50+", label: "Organizers" },
  { value: "4+", label: "Categories" },
];

const TEAM = [
  { name: "Udipta Sarma", role: "Founder", initials: "US", image: founder },
  { name: "Rahul Kumar Bajoria", role: "CEO", initials: "RB", image: ceo },
];

/* ---------------- Small building blocks ---------------- */

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-3">
      {children}
    </p>
  );
}

/* A lightweight decorative "event wall" used in place of real photography.
   Built from the existing token system so it always matches the theme. */
function EventWallPattern({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-dark ${className}`}
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.10) 0, transparent 35%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.08) 0, transparent 40%), radial-gradient(circle at 50% 100%, rgba(255,255,255,0.10) 0, transparent 45%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 1px, transparent 14px)",
          color: "white",
        }}
      />
      <div className="relative h-full w-full grid place-items-center">
        <Ticket className="h-16 w-16 text-white/20" strokeWidth={1.25} />
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */

function About() {
  return (
    <div className="min-h-screen">
      {/* 1. Hero */}
      <section className="px-4 sm:px-8 pt-14 pb-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-4">
            About SiiKET
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            We Get You Closer to the{" "}
            <span className="text-primary">Moments That Matter</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            SiiKET is built to make discovering and booking live experiences
            simple, secure, and exciting.
          </p>
        </div>

      </section>

      {/* 2. Who We Are */}
    
      {/* 3. What We Do */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 mt-24">
        <div className="text-center max-w-xl mx-auto">
          <SectionEyebrow>What We Do</SectionEyebrow>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Everything you need to get in
          </h2>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHAT_WE_DO.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition-colors"
            >
              <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-5 font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Mission */}
      <section className="mt-24">
        <div className="relative overflow-hidden bg-dark text-dark-foreground py-20 px-4 sm:px-8">
          <span
            aria-hidden
            className="pointer-events-none select-none absolute -top-10 left-1/2 -translate-x-1/2 text-[220px] sm:text-[320px] font-black text-white/5 leading-none"
          >
            "
          </span>
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/60 mb-4">
              Our Mission
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Making Every Experience Easier to Reach
            </h2>
            <p className="mt-6 text-white/70 max-w-xl mx-auto">
              Our mission is to simplify the way people discover, access,
              and experience live events — while giving event organizers
              reliable technology to manage and grow their ticketing
              operations.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Why SiiKET / How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 mt-24">
        <div className="text-center max-w-xl mx-auto">
          <SectionEyebrow>Why SiiKET</SectionEyebrow>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            From discovery to the door
          </h2>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className="relative">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%-1.25rem)] w-[calc(100%-1.5rem)] border-t border-dashed border-border" />
              )}
              <div className="relative rounded-2xl border border-border bg-card p-6 h-full">
                <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-5 text-xs font-bold tracking-wide text-muted-foreground">
                  0{i + 1}
                </p>
                <h3 className="mt-1 font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Leadership */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 mt-24">
        <div className="text-center max-w-xl mx-auto">
          <SectionEyebrow>Leadership</SectionEyebrow>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Meet the Team
          </h2>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          {TEAM.map((person) => (
            <div
              key={person.name}
              className="group rounded-3xl border border-border bg-card p-8 text-center hover:border-primary/50 transition-colors"
            >
              <div className="mx-auto  rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-primary-foreground text-2xl font-extrabold shadow-md transition-transform group-hover:scale-105">
               <img src={person.image} alt={person.name} />
              </div>
              <h3 className="mt-6 text-lg font-bold">{person.name}</h3>
              <p className="text-sm text-primary font-semibold">
                {person.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Numbers */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 mt-24">
        <div className="rounded-3xl border border-border bg-card px-6 sm:px-10 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-extrabold text-primary">
                {s.value}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. For Event Organizers */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 mt-24">
        <div className="rounded-3xl bg-primary text-primary-foreground px-6 sm:px-12 py-14 text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Have an Event to Host?
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            Take your event from announcement to attendance with SiiKET's
            ticketing platform.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-background text-foreground px-7 py-3 font-semibold hover:opacity-90 transition"
          >
            Become an Organizer <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 9. Final CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12 mt-24 mb-24 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Your Next Experience Starts Here
        </h2>
        <p className="mt-4 text-muted-foreground">
          Discover something worth remembering.
        </p>
        <Link
          to="/events"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-8 py-3 font-semibold hover:opacity-90 transition shadow-[0_10px_30px_-10px_rgba(30,40,210,0.5)]"
        >
          Explore Events <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}