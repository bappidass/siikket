import { Link } from "@tanstack/react-router";
import { MapPin, ArrowRight, Clock, Calendar1Icon } from "lucide-react";
import type { Event } from "@/lib/events-data";

export function EventCard({ event }: { event: Event }) {
  return (
    <div className="group flex flex-col">
      <Link to="/events/$id" params={{ id: event.id }} className="block">
        <div className="relative aspect-5/6 overflow-hidden rounded-xl bg-card shadow-sm">
          {event.countdown && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-primary text-primary-foreground text-xs flex items-center justify-between px-3 py-2">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-4 h-4"/>
                Time to end
              </span>
              <span className="font-mono">06:34:15</span>
            </div>
          )}
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-101"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="px-1 pt-4">
        <h3 className="text-lg font-bold text-foreground truncate">{event.title}</h3>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar1Icon className="h-3.5 w-3.5" />
            {event.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {event.city}
          </span>
        </div>
        <Link
          to="/events/$id"
          params={{ id: event.id }}
          className="mt-4 inline-flex items-center font-bold gap-2 text-sm  text-primary hover:gap-3 transition-all"
        >
          Book now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
