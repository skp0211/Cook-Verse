"""Generate CookVerse documentation PDF from markdown."""
import re
from pathlib import Path
from fpdf import FPDF

DOCS_DIR = Path(__file__).parent
MD_FILE = DOCS_DIR / "CookVerse-Documentation.md"
PDF_FILE = DOCS_DIR / "CookVerse-Documentation.pdf"


class DocPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(100, 100, 100)
            self.cell(0, 8, "CookVerse Application Documentation", align="C", new_x="LMARGIN", new_y="NEXT")
            self.ln(2)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")


def sanitize(text: str) -> str:
    text = text.replace("\u2014", "-").replace("\u2013", "-")
    text = text.replace("\u2018", "'").replace("\u2019", "'")
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    text = text.replace("\u2022", "-").replace("\u2192", "->")
    text = re.sub(r"[^\x00-\xFF]", "", text)
    if len(text) > 200:
        text = text[:197] + "..."
    return text


def write_line(pdf: FPDF, text: str, h: float = 5.5):
    text = sanitize(text)
    if not text.strip():
        pdf.ln(2)
        return
    pdf.set_x(pdf.l_margin)
    try:
        pdf.multi_cell(0, h, text)
    except Exception:
        w = pdf.epw
        words = text.split()
        chunk = ""
        for word in words:
            test = (chunk + " " + word).strip()
            if pdf.get_string_width(test) < w - 2:
                chunk = test
            else:
                if chunk:
                    pdf.set_x(pdf.l_margin)
                    pdf.cell(0, h, chunk, new_x="LMARGIN", new_y="NEXT")
                chunk = word
        if chunk:
            pdf.set_x(pdf.l_margin)
            pdf.cell(0, h, chunk, new_x="LMARGIN", new_y="NEXT")


def render_md_to_pdf():
    pdf = DocPDF()
    pdf.set_margins(15, 15, 15)
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    lines = MD_FILE.read_text(encoding="utf-8").splitlines()
    in_code = False
    code_buffer = []

    for line in lines:
        raw = line.rstrip()

        if raw.strip().startswith("```"):
            if in_code:
                pdf.set_font("Courier", "", 8)
                pdf.set_fill_color(245, 245, 245)
                for cl in code_buffer:
                    write_line(pdf, cl, h=4.5)
                pdf.ln(2)
                code_buffer = []
                in_code = False
            else:
                in_code = True
            continue

        if in_code:
            code_buffer.append(raw)
            continue

        # Skip ASCII diagram lines
        if raw.strip().startswith(("┌", "│", "└", "├", "▼", "─")):
            continue

        if raw.strip() == "---":
            pdf.ln(2)
            pdf.set_draw_color(200, 200, 200)
            pdf.line(10, pdf.get_y(), 200, pdf.get_y())
            pdf.ln(4)
            continue

        if raw.startswith("# "):
            pdf.ln(4)
            pdf.set_font("Helvetica", "B", 20)
            pdf.set_text_color(74, 20, 140)
            write_line(pdf, raw[2:].strip(), h=10)
            pdf.ln(2)
            continue

        if raw.startswith("## "):
            pdf.ln(3)
            pdf.set_font("Helvetica", "B", 14)
            pdf.set_text_color(40, 40, 40)
            write_line(pdf, raw[3:].strip(), h=8)
            pdf.ln(1)
            continue

        if raw.startswith("### "):
            pdf.ln(2)
            pdf.set_font("Helvetica", "B", 11)
            pdf.set_text_color(60, 60, 60)
            write_line(pdf, raw[4:].strip(), h=7)
            pdf.ln(1)
            continue

        if raw.startswith("|") and "|" in raw[1:]:
            pdf.set_font("Helvetica", "", 8)
            pdf.set_text_color(30, 30, 30)
            cells = [c.strip() for c in raw.strip("|").split("|")]
            if all(set(c) <= {"-", ":"} for c in cells):
                continue
            write_line(pdf, " | ".join(cells), h=5)
            continue

        if raw.startswith("- ") or raw.startswith("* "):
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(40, 40, 40)
            write_line(pdf, "  - " + raw[2:].strip())
            continue

        if re.match(r"^\d+\.\s", raw):
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(40, 40, 40)
            write_line(pdf, "  " + raw.strip())
            continue

        if raw.strip().startswith("**") and raw.strip().endswith("**"):
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(40, 40, 40)
            write_line(pdf, raw.strip().strip("*"), h=6)
            continue

        if raw.strip():
            text = re.sub(r"\*\*([^*]+)\*\*", r"\1", raw)
            text = re.sub(r"`([^`]+)`", r"\1", text)
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(40, 40, 40)
            write_line(pdf, text)
        else:
            pdf.ln(2)

    pdf.output(str(PDF_FILE))
    print(f"PDF created: {PDF_FILE}")


if __name__ == "__main__":
    render_md_to_pdf()
