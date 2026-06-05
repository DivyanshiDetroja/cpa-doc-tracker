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


make_pdf("goldman_w2.pdf", [
    "W-2 Wage and Tax Statement",
    "Tax Year: 2025",
    "Employer: Goldman Sachs & Co. LLC",
    "Employee: Sarah Johnson",
    "SSN: XXX-XX-1234",
    "Wages, tips, other compensation: $185,000.00",
    "Federal income tax withheld: $42,000.00",
    "Social security wages: $160,200.00",
    "Social security tax withheld: $9,932.40",
    "Medicare wages and tips: $185,000.00",
    "Medicare tax withheld: $2,682.50",
])

make_pdf("fidelity_1099div_wrongyear.pdf", [
    "Form 1099-DIV — Dividends and Distributions",
    "Tax Year: 2024",
    "Payer: Fidelity Investments",
    "Recipient: Sarah Johnson",
    "SSN: XXX-XX-1234",
    "Total ordinary dividends: $3,240.00",
    "Qualified dividends: $2,900.00",
    "Total capital gain distributions: $540.00",
])

make_pdf("chase_1099int.pdf", [
    "Form 1099-INT — Interest Income",
    "Tax Year: 2025",
    "Payer: Chase Bank, N.A.",
    "Recipient: Sarah Johnson",
    "SSN: XXX-XX-1234",
    "Interest income: $1,120.00",
    "Early withdrawal penalty: $0.00",
])

make_pdf("random_bank_statement.pdf", [
    "Account Statement",
    "Tax Year: 2025",
    "Institution: Wells Fargo Bank",
    "Account Holder: Sarah Johnson",
    "Account Number: XXXXXX7890",
    "Statement Period: January 1, 2025 — December 31, 2025",
    "Opening Balance: $12,400.00",
    "Closing Balance: $15,850.00",
    "This is a general account statement, not a tax form.",
])

make_pdf("freelance_1099nec_wrongclient.pdf", [
    "Form 1099-NEC — Nonemployee Compensation",
    "Tax Year: 2025",
    "Payer: Acme Consulting Group",
    "Recipient: S. Johnson LLC",
    "EIN: XX-XXXXXXX",
    "Nonemployee compensation: $28,500.00",
])

print("All dummy PDFs generated.")
