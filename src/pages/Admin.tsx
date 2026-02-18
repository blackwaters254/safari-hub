import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import DashboardSection from "@/components/admin/DashboardSection";
import MembersSection from "@/components/admin/MembersSection";
import BookingsSection from "@/components/admin/BookingsSection";
import EventsSection from "@/components/admin/EventsSection";
import ExperiencesSection from "@/components/admin/ExperiencesSection";
import SupportSection from "@/components/admin/SupportSection";
import StaffSection from "@/components/admin/StaffSection";
import HotelsSection from "@/components/admin/HotelsSection";

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  const [bookings, setBookings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      toast.error("Access denied. Admin only.");
      navigate("/");
      return;
    }
    setIsAdmin(true);
    setLoading(false);
    fetchAll();
  };

  const fetchAll = useCallback(async () => {
    const [b, e, x, m, t, s, h] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("created_at", { ascending: false }),
      supabase.from("experiences").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("staff_members").select("*").order("created_at", { ascending: false }),
      supabase.from("hotel_contacts").select("*").order("created_at", { ascending: false }),
    ]);
    setBookings(b.data || []);
    setEvents(e.data || []);
    setExperiences(x.data || []);
    setMembers(m.data || []);
    setTickets(t.data || []);
    setStaff(s.data || []);
    setHotels(h.data || []);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) return <main className="min-h-screen pt-24 flex items-center justify-center"><p>Loading...</p></main>;
  if (!isAdmin) return null;

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection bookings={bookings} members={members} tickets={tickets} staff={staff} events={events} experiences={experiences} hotels={hotels} />;
      case "members":
        return <MembersSection members={members} />;
      case "bookings":
        return <BookingsSection bookings={bookings} onRefresh={fetchAll} />;
      case "events":
        return <EventsSection events={events} onRefresh={fetchAll} />;
      case "experiences":
        return <ExperiencesSection experiences={experiences} onRefresh={fetchAll} />;
      case "support":
        return <SupportSection tickets={tickets} onRefresh={fetchAll} />;
      case "staff":
        return <StaffSection staff={staff} onRefresh={fetchAll} />;
      case "hotels":
        return <HotelsSection hotels={hotels} onRefresh={fetchAll} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen pt-16">
      <div className="flex">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
          stats={{ members: members.length, bookings: bookings.length, tickets: tickets.filter((t) => t.status === "open").length, staff: staff.length }}
        />
        <div className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">
          <AdminMobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
          {renderSection()}
        </div>
      </div>
    </main>
  );
}
