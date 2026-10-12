import base64
import html
from datetime import datetime
from io import BytesIO

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.platypus import (
    Flowable, KeepTogether, ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

PAGE_W, PAGE_H = letter
MARGIN_X = 64
FRAME_PAD = 6  # SimpleDocTemplate's frame pads each side by 6pt
TEXT_X = MARGIN_X + FRAME_PAD  # where flowable text starts; canvas drawing aligns to it
CONTENT_W = PAGE_W - 2 * TEXT_X

# Helvetica only covers Latin-1, and models like to emit typographic variants (e.g. "five‑minute"
# with U+2011) that render as black boxes. Map them to characters the font has.
_CHAR_MAP = str.maketrans({
    "‐": "-", "‑": "-", "‒": "–", "−": "-", "⁃": "-",
    " ": " ", " ": " ", " ": " ", " ": " ", " ": " ", " ": " ", " ": " ",
    "​": "", "‌": "", "‍": "", "⁠": "", "﻿": "",
    "′": "'", "″": '"', "∕": "/",
})


def clean(text) -> str:
    """Normalize model output for the PDF fonts, then escape it for ReportLab's mini-markup."""
    if text is None:
        return ""
    return html.escape(str(text).translate(_CHAR_MAP).strip())


class PDFGenerator:
    """Generate PDF documents from meeting minutes data."""

    TEMPLATES = {
        "professional": {
            "name": "Professional",
            "description": "Navy title band, blue accents",
            "primary_color": "#10213f",
            "accent_color": "#2f56f0",
        },
        "minimal": {
            "name": "Minimal",
            "description": "Black and white, serif headings",
            "primary_color": "#111111",
            "accent_color": "#111111",
        },
        "modern": {
            "name": "Modern",
            "description": "A color for each section",
            "primary_color": "#172033",
            "accent_color": "#2f56f0",
        },
    }

    # Modern: one hue per section, same order as the app (Summary, Discussion, Decisions, Actions, Next steps).
    SECTION_HUES = ["#2f56f0", "#6a48dc", "#0b7f74", "#9a5b00", "#b8285f"]

    def __init__(self, template: str = "professional"):
        self.template = template if template in self.TEMPLATES else "professional"
        cfg = self.TEMPLATES[self.template]
        self.primary = HexColor(cfg["primary_color"])
        self.accent = HexColor(cfg["accent_color"])
        self.text = HexColor("#1d2433") if self.template != "minimal" else HexColor("#111111")
        self.muted = HexColor("#5b6475") if self.template != "minimal" else HexColor("#555555")
        self.rule = HexColor("#dfe3ea") if self.template != "minimal" else HexColor("#c8c8c8")
        self.heading_font = "Times-Bold" if self.template == "minimal" else "Helvetica-Bold"
        self._styles()

    def _styles(self):
        base = dict(fontName="Helvetica", fontSize=10, leading=15, textColor=self.text)
        self.s_body = ParagraphStyle("body", **base, spaceAfter=4)
        self.s_muted = ParagraphStyle("muted", **{**base, "textColor": self.muted})
        self.s_topic = ParagraphStyle("topic", **{**base, "fontName": "Helvetica-Bold", "fontSize": 10.5}, spaceAfter=1)
        self.s_label = ParagraphStyle("label", **{**base, "fontSize": 7.5, "leading": 10, "textColor": self.muted})
        self.s_meta = ParagraphStyle("meta", **{**base, "fontSize": 9.5, "leading": 13})
        self.s_cell = ParagraphStyle("cell", **{**base, "fontSize": 9.5, "leading": 13})
        self.s_cell_muted = ParagraphStyle("cellm", **{**base, "fontSize": 9.5, "leading": 13, "textColor": self.muted})
        title_color = white if self.template == "professional" else self.primary
        title_font = "Times-Bold" if self.template == "minimal" else "Helvetica-Bold"
        self.s_title = ParagraphStyle("title", fontName=title_font, fontSize=24, leading=29, textColor=title_color)

    # ---------- page furniture ----------

    def _title_block_height(self, title: str) -> float:
        _w, h = Paragraph(title, self.s_title).wrap(CONTENT_W, PAGE_H)
        return h

    def _first_page(self, c, doc):
        if self.template == "professional":
            band_h = self._band_h
            c.saveState()
            c.setFillColor(self.primary)
            c.rect(0, PAGE_H - band_h, PAGE_W, band_h, stroke=0, fill=1)
            c.setFillColor(self.accent)
            c.rect(0, PAGE_H - band_h, PAGE_W, 4, stroke=0, fill=1)
            c.setFillColor(HexColor("#a9b8d8"))
            c.setFont("Helvetica", 9)
            c.drawString(TEXT_X, PAGE_H - 40, "Meeting minutes")
            p = Paragraph(self._title, self.s_title)
            _w, h = p.wrap(CONTENT_W, PAGE_H)
            p.drawOn(c, TEXT_X, PAGE_H - 50 - h)
            c.restoreState()
        self._footer(c, doc)

    def _footer(self, c, doc):
        c.saveState()
        c.setStrokeColor(self.rule)
        c.setLineWidth(0.6)
        c.line(TEXT_X, 44, PAGE_W - TEXT_X, 44)
        c.setFont("Helvetica", 7.5)
        c.setFillColor(self.muted)
        title = self._plain_title if len(self._plain_title) <= 70 else self._plain_title[:67] + "..."
        c.drawString(TEXT_X, 32, title)
        c.restoreState()

    # ---------- content blocks ----------

    def _header(self, minutes: dict) -> list:
        story = []
        if self.template == "professional":
            story.append(Spacer(1, self._band_h - 56 + 22))  # band is drawn on the canvas; push content below it
        else:
            story.append(Paragraph(self._title, self.s_title))
            story.append(Spacer(1, 10))
            if self.template == "modern":
                story.append(HueBar(self.SECTION_HUES))
            else:
                story.append(Rule(CONTENT_W, 1.2, self.text))
            story.append(Spacer(1, 14))

        attendees = [a for a in (minutes.get("attendees") or []) if str(a).strip()]
        actions = minutes.get("action_items") or []
        cells = [
            ("Date", clean(minutes.get("date")) or "Not stated"),
            ("Attendees", clean(", ".join(str(a) for a in attendees)) or "Not stated"),
            ("Action items", str(len(actions))),
        ]
        row = [[Paragraph(label, self.s_label) for label, _ in cells],
               [Paragraph(value, self.s_meta) for _, value in cells]]
        meta = Table(row, colWidths=[CONTENT_W * 0.22, CONTENT_W * 0.6, CONTENT_W * 0.18])
        meta.setStyle(TableStyle([
            ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story += [meta, Spacer(1, 18)]
        return story

    def _heading(self, no: int, title: str) -> Flowable:
        hue = HexColor(self.SECTION_HUES[(no - 1) % len(self.SECTION_HUES)])
        return SectionHeading(
            no, title, template=self.template, font=self.heading_font, text_color=self.primary,
            accent=hue if self.template == "modern" else self.accent, muted=self.muted, rule=self.rule,
        )

    def _bullets(self, items: list, color) -> ListFlowable:
        return ListFlowable(
            [ListItem(Paragraph(clean(i), self.s_body), leftIndent=14, value="square") for i in items],
            bulletType="bullet", start="square", bulletFontSize=5, bulletColor=color,
            bulletOffsetY=-3, leftIndent=14,
        )

    def _actions_table(self, items: list) -> Table:
        header = ["", Paragraph("Task", self.s_label), Paragraph("Owner", self.s_label), Paragraph("Due", self.s_label)]
        rows = [header]
        for item in items:
            owner = clean(item.get("owner"))
            due = clean(item.get("due_date"))
            rows.append([
                CheckBox(self.muted),
                Paragraph(clean(item.get("task")), self.s_cell),
                Paragraph(owner if owner and owner.lower() != "unassigned" else "Unassigned",
                          self.s_cell if owner and owner.lower() != "unassigned" else self.s_cell_muted),
                Paragraph(due if due and due.lower() not in ("null", "none", "not set") else "No date",
                          self.s_cell if due and due.lower() not in ("null", "none", "not set") else self.s_cell_muted),
            ])
        table = Table(rows, colWidths=[18, CONTENT_W * 0.6 - 18, CONTENT_W * 0.22, CONTENT_W * 0.18], repeatRows=1)
        table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, 0), 0), ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
            ("TOPPADDING", (0, 1), (-1, -1), 8), ("BOTTOMPADDING", (0, 1), (-1, -1), 8),
            ("LINEBELOW", (0, 0), (-1, -1), 0.6, self.rule),
        ]))
        return table

    # ---------- build ----------

    def generate(self, minutes: dict) -> str:
        """Build the PDF and return it base64-encoded."""
        self._plain_title = (str(minutes.get("title") or "Meeting minutes")).translate(_CHAR_MAP).strip()
        self._title = clean(self._plain_title)
        self._band_h = 50 + self._title_block_height(self._title) + 30

        story = self._header(minutes)
        sections = [
            ("Summary", minutes.get("summary")),
            ("Discussion", minutes.get("discussion_points")),
            ("Decisions", minutes.get("decisions")),
            ("Action items", minutes.get("action_items")),
            ("Next steps", minutes.get("next_steps")),
        ]
        no = 0
        for title, content in sections:
            if not content:
                continue
            no += 1
            heading = self._heading(no, title)
            hue = HexColor(self.SECTION_HUES[(no - 1) % len(self.SECTION_HUES)]) if self.template == "modern" else self.accent
            if title == "Summary":
                block = [Paragraph(clean(content).replace("\n", "<br/>"), self.s_body)]
            elif title == "Discussion":
                block = [[Paragraph(clean(p.get("topic")), self.s_topic),
                          Paragraph(clean(p.get("details")), self.s_muted), Spacer(1, 9)]
                         for p in content]
            elif title == "Action items":
                block = [self._actions_table(content)]
            else:
                block = [self._bullets(content, hue)]
            # Lists of flowables are topics that must not split; wrap them after the first.
            first = block[0] if isinstance(block[0], list) else [block[0]]
            rest = [KeepTogether(b) if isinstance(b, list) else b for b in block[1:]]
            # Keep each heading with the start of its content.
            story += [KeepTogether([heading, Spacer(1, 8), *first]), *rest, Spacer(1, 18)]

        generated = datetime.now().strftime("%B %d, %Y")
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=letter, leftMargin=MARGIN_X, rightMargin=MARGIN_X, topMargin=56, bottomMargin=64,
            title=self._plain_title, author="Minutes Generator",
        )
        doc.build(story, onFirstPage=self._first_page, onLaterPages=self._footer,
                  canvasmaker=lambda *a, **k: NumberedCanvas(*a, generated=generated, muted=self.muted, **k))
        return base64.b64encode(buffer.getvalue()).decode("utf-8")

    @classmethod
    def get_templates(cls) -> list:
        """Return list of available templates."""
        return [{"id": key, **value} for key, value in cls.TEMPLATES.items()]


class NumberedCanvas(pdfcanvas.Canvas):
    """Defers page output so the footer can say 'Page 2 of 3'."""

    def __init__(self, *args, generated="", muted=None, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_pages = []
        self._generated = generated
        self._muted = muted

    def showPage(self):
        self._saved_pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._saved_pages)
        for state in self._saved_pages:
            self.__dict__.update(state)
            self.setFont("Helvetica", 7.5)
            self.setFillColor(self._muted)
            self.drawRightString(PAGE_W - TEXT_X, 32, f"Generated {self._generated}  ·  Page {self._pageNumber} of {total}")
            super().showPage()
        super().save()


class SectionHeading(Flowable):
    """'01  Summary' with a template-specific number treatment and rule."""

    def __init__(self, no, title, template, font, text_color, accent, muted, rule):
        super().__init__()
        self.no, self.title, self.template, self.font = no, title, template, font
        self.text_color, self.accent, self.muted, self.rule_color = text_color, accent, muted, rule
        self.height = 30

    def wrap(self, avail_w, avail_h):
        self.width = avail_w
        return avail_w, self.height

    def draw(self):
        c = self.canv
        label = f"{self.no:02d}"
        baseline = 12
        if self.template == "modern":
            # Tinted chip: the hue at ~14% over white, number in the full hue.
            r, g, b = self.accent.red, self.accent.green, self.accent.blue
            c.setFillColorRGB(1 - 0.14 * (1 - r), 1 - 0.14 * (1 - g), 1 - 0.14 * (1 - b))
            c.roundRect(0, baseline - 5, 24, 17, 8.5, stroke=0, fill=1)
            c.setFillColor(self.accent)
            c.setFont("Helvetica-Bold", 8.5)
            c.drawCentredString(12, baseline, label)
            x = 32
        else:
            c.setFillColor(self.accent if self.template == "professional" else self.muted)
            c.setFont("Helvetica-Bold", 9)
            c.drawString(0, baseline + 1, label)
            x = 22
        c.setFillColor(self.text_color)
        c.setFont(self.font, 13.5)
        c.drawString(x, baseline, self.title)
        if self.template != "modern":
            c.setStrokeColor(self.rule_color)
            c.setLineWidth(0.6)
            c.line(0, 0, self.width, 0)


class HueBar(Flowable):
    """Modern template's identity bar: one segment per section hue."""

    def __init__(self, hues):
        super().__init__()
        self.hues = hues

    def wrap(self, avail_w, avail_h):
        return 120, 5

    def draw(self):
        seg = 120 / len(self.hues)
        for i, hue in enumerate(self.hues):
            self.canv.setFillColor(HexColor(hue))
            self.canv.rect(i * seg, 0, seg, 5, stroke=0, fill=1)


class Rule(Flowable):
    def __init__(self, width, thickness, color):
        super().__init__()
        self.w, self.t, self.color = width, thickness, color

    def wrap(self, avail_w, avail_h):
        return self.w, self.t

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.t)
        self.canv.line(0, 0, self.w, 0)


class CheckBox(Flowable):
    """Empty box so printed minutes can be ticked off."""

    def __init__(self, color):
        super().__init__()
        self.color = color

    def wrap(self, avail_w, avail_h):
        return 9, 11

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(0.8)
        self.canv.roundRect(0, 1.5, 9, 9, 1.5, stroke=1, fill=0)
