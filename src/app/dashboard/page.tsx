"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserCheck,
  MessageSquare,
  CalendarClock,
  Plus,
  Send,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ClientDialog } from "@/components/client-dialog";
import { DeleteDialog } from "@/components/delete-dialog";

interface Client {
  id: string;
  name: string;
  phone: string;
  reminderDay: number;
  isActive: boolean;
  optedOut: boolean;
  notes: string | null;
  createdAt: string;
  _count: { smsLogs: number };
}

interface Stats {
  totalClients: number;
  activeClients: number;
  sentThisMonth: number;
  nextReminderDay: number | null;
  nextReminderName: string | null;
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);

  const fetchData = useCallback(async () => {
    const [clientsRes, statsRes] = await Promise.all([
      fetch("/api/clients"),
      fetch("/api/stats"),
    ]);
    setClients(await clientsRes.json());
    setStats(await statsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleActive = async (client: Client) => {
    await fetch(`/api/clients/${client.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !client.isActive }),
    });
    toast.success(`${client.name} ${client.isActive ? "deactivated" : "activated"}`);
    fetchData();
  };

  const handleSendTest = async (client: Client) => {
    toast.loading(`Sending test SMS to ${client.name}...`);
    const res = await fetch(`/api/clients/${client.id}/send-test`, {
      method: "POST",
    });
    const data = await res.json();
    toast.dismiss();
    if (data.success) {
      toast.success(data.message);
    } else {
      toast.error(data.message || "Failed to send SMS");
    }
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteClient) return;
    await fetch(`/api/clients/${deleteClient.id}`, { method: "DELETE" });
    toast.success(`${deleteClient.name} deleted`);
    setDeleteClient(null);
    fetchData();
  };

  const handleSave = async (data: {
    name: string;
    phone: string;
    reminderDay: number;
    notes?: string;
  }) => {
    if (editClient) {
      await fetch(`/api/clients/${editClient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast.success(`${data.name} updated`);
    } else {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to create client");
        return;
      }
      toast.success(`${data.name} added`);
    }
    setDialogOpen(false);
    setEditClient(null);
    fetchData();
  };

  const getStatusBadge = (client: Client) => {
    if (client.optedOut)
      return <Badge variant="destructive">Opted Out</Badge>;
    if (client.isActive)
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>;
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const statCards = [
    {
      label: "Total Clients",
      value: stats?.totalClients ?? "—",
      icon: Users,
      color: "text-[#2563EB]",
      bg: "bg-blue-50",
    },
    {
      label: "Active",
      value: stats?.activeClients ?? "—",
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Sent This Month",
      value: stats?.sentThisMonth ?? "—",
      icon: MessageSquare,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Next Reminder",
      value: stats?.nextReminderDay
        ? `Day ${stats.nextReminderDay}`
        : "—",
      icon: CalendarClock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      subtitle: stats?.nextReminderName || undefined,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Manage clients and SMS reminders
          </p>
        </div>
        <Button
          className="bg-[#2563EB] hover:bg-[#1D4ED8]"
          onClick={() => {
            setEditClient(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="rounded-2xl shadow-sm border-0 bg-white">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
                <div className={`${stat.bg} p-2.5 rounded-xl`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Table */}
      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardContent className="p-0">
          <div className="p-5 border-b">
            <h2 className="font-semibold text-lg">Clients</h2>
          </div>
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              Loading clients...
            </div>
          ) : clients.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No clients yet. Add your first client to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Reminder Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client, i) => (
                    <TableRow
                      key={client.id}
                      className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                    >
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.phone}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm">
                          <CalendarClock className="w-3.5 h-3.5 text-muted-foreground" />
                          Day {client.reminderDay}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(client)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={client.isActive}
                          onCheckedChange={() => handleToggleActive(client)}
                          disabled={client.optedOut}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleSendTest(client)}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Send Test SMS
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditClient(client);
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setDeleteClient(client)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ClientDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditClient(null);
        }}
        client={editClient}
        onSave={handleSave}
      />

      <DeleteDialog
        open={!!deleteClient}
        onOpenChange={(open) => {
          if (!open) setDeleteClient(null);
        }}
        clientName={deleteClient?.name || ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}
