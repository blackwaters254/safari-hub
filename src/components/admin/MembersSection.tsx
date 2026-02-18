import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Mail, Phone, Calendar } from "lucide-react";

interface Props {
  members: any[];
}

export default function MembersSection({ members }: Props) {
  const [search, setSearch] = useState("");

  const filtered = members.filter((m) =>
    `${m.first_name} ${m.last_name} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Registered Members</h2>
        <span className="text-sm text-muted-foreground">{members.length} total</span>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="space-y-2">
        {filtered.map((m) => (
          <div key={m.id} className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{m.first_name} {m.last_name}</h3>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {m.email}</span>
                  {m.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {m.phone}</span>}
                </div>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date(m.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No members found</p>}
      </div>
    </div>
  );
}
