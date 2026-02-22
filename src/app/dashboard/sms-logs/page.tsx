"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SmsLog {
  id: string;
  clientId: string;
  message: string;
  status: string;
  twilioSid: string | null;
  sentAt: string;
  client: { name: string; phone: string };
}

export default function SmsLogsPage() {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sms-logs")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Sent</Badge>;
      case "demo":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Demo</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SMS Logs</h1>
        <p className="text-muted-foreground text-sm">
          Message delivery history
        </p>
      </div>

      <Card className="rounded-2xl shadow-sm border-0 bg-white">
        <CardContent className="p-0">
          <div className="p-5 border-b flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#2563EB]" />
            <h2 className="font-semibold text-lg">Recent Messages</h2>
            <Badge variant="secondary" className="ml-auto">
              {logs.length} messages
            </Badge>
          </div>
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              Loading logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No SMS logs yet. Send a test message to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, i) => (
                    <TableRow
                      key={log.id}
                      className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                    >
                      <TableCell className="font-medium">
                        {log.client.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.client.phone}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {log.message}
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(log.sentAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
