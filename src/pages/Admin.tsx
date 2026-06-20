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
import OpportunitiesSection from "@/components/admin/OpportunitiesSection";
import ToursSection from "@/components/admin/ToursSection";
import PaymentSettingsSection from "@/components/admin/PaymentSettingsSection";
import DashboardCompact from "@/components/admin/DashboardCompact";
import DashboardClassified from "@/components/admin/DashboardClassified";
import DashboardModeToggle, { DashboardMode, getStoredMode, setStoredMode } from "@/components/admin/DashboardModeToggle";

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
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [dbTours, setDbTours] = useState<any[]>([]);

  useEffect(() => {
    checkAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdmin = async () => {
    try {
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
      await fetchAll();
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = useCallback(async () => {
    const [b, e, x, m, t, s, h, o, a, tr] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("created_at", { ascending: false }),
      supabase.from("experiences").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("staff_members").select("*").order("created_at", { ascending: false }),
      supabase.from("hotel_contacts").select("*").order("created_at", { ascending: false }),
      supabase.from("opportunities").select("*").order("created_at", { ascending: false }),
      supabase.from("applications").select("*").order("created_at", { ascending: false }),
      supabase.from("tours").select("*").order("sort_order", { ascending: true }),
    ]);
    setBookings(b.data || []);
    setEvents(e.data || []);
    setExperiences(x.data || []);
    setMembers(m.data || []);
    setTickets(t.data || []);
    setStaff(s.data || []);
    setHotels(h.data || []);
    setOpportunities(o.data || []);
    setApplications(a.data || []);
    setDbTours(tr.data || []);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm font-medium">Loading admin console...</p>
        </div>
      </div>
    );
  }
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
      case "opportunities":
        return <OpportunitiesSection opportunities={opportunities} applications={applications} onRefresh={fetchAll} />;
      case "tours":
        return <ToursSection tours={dbTours} onRefresh={fetchAll} />;
      case "payments":
        return <PaymentSettingsSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
        stats={{ members: members.length, bookings: bookings.length, tickets: tickets.filter((t) => t.status === "open").length, staff: staff.length }}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminMobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
