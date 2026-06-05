"""Run once to generate demo PDFs: python generate_dummy_pdfs.py"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

OUT = os.path.join(os.path.dirname(__file__), "..", "dummy_docs")
os.makedirs(OUT, exist_ok=True)


def make_pdf(filename: str, lines: list[str]):
    path = os.path.join(OUT, filename)
    c = canvas.Canvas(path, pagesize=letter)
    y = 740
    for line in lines:
        c.drawString(72, y, line)
        y -= 20
    c.save()
    print(f"Created {path}")


# Accepted: Balance Sheet, correct entity and year
make_pdf("balance_sheet.pdf", [
    "Balance Sheet",
    "Statement of Financial Position",
    "Entity: Meridian Retail Group LLC",
    "As of December 31, 2025",
    "Fiscal Year: 2025",
    "",
    "ASSETS",
    "  Cash and Cash Equivalents:          $1,240,000",
    "  Accounts Receivable (net):          $3,870,000",
    "  Inventory:                          $2,150,000",
    "  Prepaid Expenses:                     $180,000",
    "  Property, Plant & Equipment (net):  $4,600,000",
    "  Total Assets:                       $12,040,000",
    "",
    "LIABILITIES & EQUITY",
    "  Accounts Payable:                   $1,830,000",
    "  Accrued Liabilities:                  $420,000",
    "  Long-Term Debt:                     $3,200,000",
    "  Members Equity:                     $6,590,000",
    "  Total Liabilities & Equity:        $12,040,000",
])

# Accepted: Income Statement, correct entity and year
make_pdf("income_statement.pdf", [
    "Income Statement",
    "Statement of Operations",
    "Entity: Meridian Retail Group LLC",
    "For the Fiscal Year Ended December 31, 2025",
    "Fiscal Year: 2025",
    "",
    "Revenue",
    "  Net Sales:                          $18,450,000",
    "  Other Income:                          $120,000",
    "  Total Revenue:                      $18,570,000",
    "",
    "Expenses",
    "  Cost of Goods Sold:                $11,200,000",
    "  Selling, General & Administrative:  $4,300,000",
    "  Depreciation & Amortization:          $610,000",
    "  Interest Expense:                     $190,000",
    "  Total Expenses:                    $16,300,000",
    "",
    "Net Income:                           $2,270,000",
])

# Rejected: Cash Flow Statement — wrong fiscal year (2024)
make_pdf("cash_flow_fy2024.pdf", [
    "Cash Flow Statement",
    "Statement of Cash Flows",
    "Entity: Meridian Retail Group LLC",
    "For the Fiscal Year Ended December 31, 2024",
    "Fiscal Year: 2024",
    "",
    "Operating Activities",
    "  Net Income:                         $1,980,000",
    "  Depreciation:                         $580,000",
    "  Changes in Working Capital:          ($340,000)",
    "  Net Cash from Operations:           $2,220,000",
    "",
    "Investing Activities",
    "  Capital Expenditures:               ($750,000)",
    "  Net Cash from Investing:            ($750,000)",
    "",
    "Financing Activities",
    "  Repayment of Debt:                  ($400,000)",
    "  Net Cash from Financing:            ($400,000)",
    "",
    "Net Increase in Cash:                $1,070,000",
])

# Accepted: Accounts Receivable Aging Report, correct entity and year
make_pdf("ar_aging_report.pdf", [
    "Accounts Receivable Aging Report",
    "Entity: Meridian Retail Group LLC",
    "As of December 31, 2025",
    "Fiscal Year: 2025",
    "",
    "Customer                    Current     31-60 Days   61-90 Days   90+ Days",
    "Apex Distribution Co.      $420,000       $80,000      $15,000          $0",
    "Blueridge Wholesale        $310,000       $45,000           $0          $0",
    "Cascade Merchants          $195,000      $120,000      $42,000     $18,000",
    "Delta Supply Partners      $540,000            $0           $0          $0",
    "Eastpoint Retail Inc.      $280,000       $60,000       $8,000      $5,000",
    "",
    "Total Current:           $2,870,000",
    "Total 31-60 Days:          $305,000",
    "Total 61-90 Days:           $65,000",
    "Total 90+ Days:             $23,000",
    "Gross AR:                $3,263,000",
    "Allowance for Doubtful Accounts: ($393,000)",  # rounding note
    "Net AR:                  $3,870,000",
])

# Unrecognized: Lease Agreement — not on required list
make_pdf("office_lease_agreement.pdf", [
    "Commercial Lease Agreement",
    "Entity: Meridian Retail Group LLC",
    "Date: March 1, 2024",
    "Landlord: Greenfield Properties LLC",
    "Tenant: Meridian Retail Group LLC",
    "Premises: 450 Commerce Drive, Suite 200",
    "Lease Term: March 1, 2024 through February 28, 2027",
    "Monthly Rent: $18,500",
    "Security Deposit: $37,000",
    "This agreement is entered into between the above-named parties.",
    "All terms and conditions are subject to local commercial tenancy law.",
])

print("All dummy PDFs generated.")
