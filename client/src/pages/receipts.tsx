import { useRef, useState, useEffect } from "react";
import { Printer, FileText, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReceiptStatement, type ReceiptStatementData } from "@/components/receipt";

/* Print: hide app chrome, show only receipt */
const PRINT_STYLES = `
  @media print {
    body * { visibility: hidden !important; }
    .receipt-print-area, .receipt-print-area * { visibility: visible !important; }
    .receipt-print-area {
      position: fixed !important;
      inset: 0 !important;
      z-index: 99999 !important;
      background: white !important;
      padding: 24px !important;
      overflow: auto !important;
    }
  }
`;

const DEMO_RECEIPTS: ReceiptStatementData[] = [
  {
    type: "receipt",
    id: "RCP-2025-00142",
    date: "Feb 15, 2025",
    clinicName: "Radiant Med Spa",
    clinicAddress: "123 Wellness Blvd, Suite 400\nMiami, FL 33131",
    clinicPhone: "(305) 555-0142",
    patientName: "Sarah Mitchell",
    patientEmail: "sarah.mitchell@email.com",
    lineItems: [
      { description: "Botox — Forehead & Crow's Feet", quantity: 1, unitPrice: 450, amount: 450 },
      { description: "Consultation Fee", quantity: 1, unitPrice: 75, amount: 75 },
    ],
    subtotal: 525,
    tax: 42,
    total: 567,
    status: "paid",
    paymentMethod: "Visa •••• 4242",
    paidAt: "Feb 15, 2025 at 2:34 PM",
    notes: "First-time patient. Discount applied for referral.",
  },
  {
    type: "statement",
    id: "STMT-2025-0089",
    date: "Feb 1, 2025",
    dueDate: "Feb 28, 2025",
    clinicName: "Elite Dental Group",
    clinicAddress: "456 Park Avenue\nNew York, NY 10022",
    clinicPhone: "(212) 555-0198",
    patientName: "James Chen",
    patientEmail: "james.chen@email.com",
    lineItems: [
      { description: "Teeth Whitening — In-Office", amount: 399 },
      { description: "Routine Cleaning", amount: 150 },
      { description: "X-Rays — Full Set", amount: 120 },
    ],
    subtotal: 669,
    tax: 0,
    discount: 50,
    total: 619,
    status: "pending",
    notes: "Insurance claim #INS-2025-7721 pending. Patient responsible for balance.",
  },
];

export default function ReceiptsPage() {
  const [selected, setSelected] = useState<ReceiptStatementData | null>(null);
  const printStyleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!printStyleRef.current) {
      const el = document.createElement("style");
      el.id = "receipt-print-styles";
      el.textContent = PRINT_STYLES;
      document.head.appendChild(el);
      printStyleRef.current = el;
    }
    return () => {
      const el = document.getElementById("receipt-print-styles");
      if (el) el.remove();
      printStyleRef.current = null;
    };
  }, []);

  const handlePrint = () => {
    if (!selected) return;
    window.print();
  };

  return (
    <div className="flex flex-1 flex-col overflow-auto p-4 lg:p-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Receipts & Statements
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View and print payment receipts and billing statements for your clinic.
            </p>
          </div>
        </div>

        {selected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(null)}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to list
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>

            <div className="rounded-xl border bg-card p-4 md:p-6">
              <ReceiptStatement data={selected} />
            </div>

            {/* Hidden print area - visible only when printing via @media print */}
            {selected && (
              <div
                className="receipt-print-area pointer-events-none invisible fixed inset-0 z-[99999] overflow-auto bg-white p-6"
                aria-hidden
              >
                <ReceiptStatement data={selected} printMode />
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_RECEIPTS.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
                onClick={() => setSelected(item)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">
                        {item.clinicName}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        #{item.id}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.patientName}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      item.status === "paid"
                        ? "default"
                        : item.status === "overdue"
                        ? "destructive"
                        : "secondary"
                    }
                    className="shrink-0 text-xs"
                  >
                    {item.status}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {item.type}
                  </span>
                  <span className="font-bold text-primary">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
