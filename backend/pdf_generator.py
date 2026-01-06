import base64
from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.units import inch
from reportlab.lib import colors
from datetime import datetime
import html


class PDFGenerator:
    """Generate PDF documents from meeting minutes data."""
    
    TEMPLATES = {
        "professional": {
            "name": "Professional",
            "description": "Clean, corporate-style layout",
            "primary_color": "#1a1a2e",
            "accent_color": "#0acaff"
        },
        "minimal": {
            "name": "Minimal",
            "description": "Simple, distraction-free design",
            "primary_color": "#333333",
            "accent_color": "#666666"
        },
        "modern": {
            "name": "Modern",
            "description": "Bold headers with vibrant accents",
            "primary_color": "#2d3748",
            "accent_color": "#48bb78"
        }
    }

    def __init__(self, template: str = "professional"):
        self.template = template
        self.template_config = self.TEMPLATES.get(template, self.TEMPLATES["professional"])
        self.styles = getSampleStyleSheet()
        self._setup_styles()

    def _escape_html(self, text: str) -> str:
        """Escape HTML special characters to prevent formatting issues."""
        if not text:
            return ""
        return html.escape(str(text))

    def _setup_styles(self):
        """Setup custom styles based on template."""
        primary = HexColor(self.template_config["primary_color"])
        accent = HexColor(self.template_config["accent_color"])
        
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=22,
            textColor=primary,
            spaceAfter=16,
            spaceBefore=0,
            fontName='Helvetica-Bold',
            leading=26,
            wordWrap='CJK'
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=13,
            textColor=accent,
            spaceBefore=14,
            spaceAfter=8,
            fontName='Helvetica-Bold',
            leading=16,
            wordWrap='CJK'
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=primary,
            spaceAfter=6,
            spaceBefore=2,
            leading=14,
            wordWrap='CJK'
        ))
        
        self.styles.add(ParagraphStyle(
            name='BulletItem',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=primary,
            spaceAfter=4,
            spaceBefore=2,
            leading=14,
            leftIndent=12,
            wordWrap='CJK'
        ))
        
        self.styles.add(ParagraphStyle(
            name='TopicTitle',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=primary,
            spaceAfter=2,
            spaceBefore=6,
            leading=14,
            fontName='Helvetica-Bold',
            wordWrap='CJK'
        ))
        
        self.styles.add(ParagraphStyle(
            name='TopicDetails',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=HexColor("#555555"),
            spaceAfter=8,
            spaceBefore=0,
            leading=14,
            leftIndent=12,
            wordWrap='CJK'
        ))
        
        self.styles.add(ParagraphStyle(
            name='MetaInfo',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=HexColor("#666666"),
            spaceAfter=3,
            leading=12,
            wordWrap='CJK'
        ))
        
        self.styles.add(ParagraphStyle(
            name='TableCell',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=HexColor("#1a1a2e"),
            leading=12,
            wordWrap='CJK'
        ))

    def generate(self, minutes: dict) -> str:
        """
        Generate PDF from minutes data and return as base64.
        
        Args:
            minutes: Dictionary containing meeting minutes data
            
        Returns:
            Base64 encoded PDF string
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=60,
            leftMargin=60,
            topMargin=50,
            bottomMargin=50
        )
        
        story = []
        
        # Title
        title = self._escape_html(minutes.get("title", "Meeting Minutes"))
        story.append(Paragraph(title, self.styles['CustomTitle']))
        
        # Meta information
        date = self._escape_html(minutes.get("date", "Not specified"))
        story.append(Paragraph(f"<b>Date:</b> {date}", self.styles['MetaInfo']))
        
        attendees = minutes.get("attendees", [])
        if attendees:
            attendees_text = self._escape_html(', '.join(str(a) for a in attendees))
            story.append(Paragraph(f"<b>Attendees:</b> {attendees_text}", self.styles['MetaInfo']))
        
        story.append(Spacer(1, 16))
        
        # Summary
        summary = minutes.get("summary", "")
        if summary:
            story.append(Paragraph("Summary", self.styles['CustomHeading']))
            story.append(Paragraph(self._escape_html(summary), self.styles['CustomBody']))
        
        # Discussion Points
        discussion_points = minutes.get("discussion_points", [])
        if discussion_points:
            story.append(Paragraph("Discussion Points", self.styles['CustomHeading']))
            for point in discussion_points:
                topic = self._escape_html(point.get("topic", ""))
                details = self._escape_html(point.get("details", ""))
                story.append(Paragraph(f"• {topic}", self.styles['TopicTitle']))
                if details:
                    story.append(Paragraph(details, self.styles['TopicDetails']))
        
        # Decisions
        decisions = minutes.get("decisions", [])
        if decisions:
            story.append(Paragraph("Decisions Made", self.styles['CustomHeading']))
            for decision in decisions:
                story.append(Paragraph(f"• {self._escape_html(decision)}", self.styles['BulletItem']))
        
        # Action Items
        action_items = minutes.get("action_items", [])
        if action_items:
            story.append(Paragraph("Action Items", self.styles['CustomHeading']))
            story.append(Spacer(1, 6))
            
            # Create table for action items with Paragraph cells for wrapping
            table_data = [[
                Paragraph("<b>Task</b>", self.styles['TableCell']),
                Paragraph("<b>Owner</b>", self.styles['TableCell']),
                Paragraph("<b>Due Date</b>", self.styles['TableCell'])
            ]]
            for item in action_items:
                task = self._escape_html(item.get("task", ""))
                owner = self._escape_html(item.get("owner", "Unassigned"))
                due = self._escape_html(item.get("due_date") or "Not set")
                table_data.append([
                    Paragraph(task, self.styles['TableCell']),
                    Paragraph(owner, self.styles['TableCell']),
                    Paragraph(due, self.styles['TableCell'])
                ])
            
            # Adjust column widths for better text wrapping
            table = Table(table_data, colWidths=[3.8*inch, 1.3*inch, 1.0*inch])
            accent = HexColor(self.template_config["accent_color"])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), accent),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ('BACKGROUND', (0, 1), (-1, -1), HexColor("#f8f9fc")),
                ('GRID', (0, 0), (-1, -1), 0.5, HexColor("#e0e3eb")),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor("#ffffff"), HexColor("#f8f9fc")]),
            ]))
            story.append(table)
        
        # Next Steps
        next_steps = minutes.get("next_steps", [])
        if next_steps:
            story.append(Spacer(1, 8))
            story.append(Paragraph("Next Steps", self.styles['CustomHeading']))
            for step in next_steps:
                story.append(Paragraph(f"• {self._escape_html(step)}", self.styles['BulletItem']))
        
        # Footer with generation info
        story.append(Spacer(1, 24))
        story.append(Paragraph(
            f"<i>Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</i>",
            self.styles['MetaInfo']
        ))
        
        # Build PDF
        doc.build(story)
        
        # Get PDF bytes and convert to base64
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return base64.b64encode(pdf_bytes).decode('utf-8')

    @classmethod
    def get_templates(cls) -> list:
        """Return list of available templates."""
        return [
            {"id": key, **value}
            for key, value in cls.TEMPLATES.items()
        ]
