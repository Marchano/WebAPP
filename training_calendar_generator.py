#!/usr/bin/env python3
"""
Training Calendar Excel Generator

Generates a monthly calendar Excel sheet with:
- Training progress levels
- Individual name columns
- Progress taskbar
- Absence/Present tracking
- Charts for training analytics
"""

import calendar
from datetime import datetime, date
from openpyxl import Workbook
from openpyxl.styles import (
    Font, PatternFill, Alignment, Border, Side,
    NamedStyle
)
from openpyxl.formatting.rule import DataBarRule, ColorScaleRule
from openpyxl.chart import (
    BarChart, PieChart, LineChart, Reference
)
from openpyxl.chart.label import DataLabelList
from openpyxl.utils import get_column_letter


def create_training_calendar(year=None, month=None, output_filename=None):
    """
    Create a training calendar Excel file with progress tracking and charts.

    Args:
        year: Year for the calendar (default: current year)
        month: Month for the calendar (default: current month)
        output_filename: Output file name (default: training_calendar_YYYY_MM.xlsx)
    """
    # Set defaults
    if year is None:
        year = datetime.now().year
    if month is None:
        month = datetime.now().month
    if output_filename is None:
        output_filename = f"training_calendar_{year}_{month:02d}.xlsx"

    # Create workbook
    wb = Workbook()

    # Create sheets
    calendar_sheet = wb.active
    calendar_sheet.title = "Training Calendar"
    charts_sheet = wb.create_sheet("Training Analytics")

    # Sample data for demonstration
    sample_employees = [
        {"name": "John Smith", "department": "Engineering", "level": "Senior"},
        {"name": "Jane Doe", "department": "Marketing", "level": "Mid"},
        {"name": "Bob Johnson", "department": "Sales", "level": "Junior"},
        {"name": "Alice Brown", "department": "Engineering", "level": "Mid"},
        {"name": "Charlie Wilson", "department": "HR", "level": "Senior"},
        {"name": "Diana Martinez", "department": "Finance", "level": "Junior"},
        {"name": "Eve Anderson", "department": "Engineering", "level": "Senior"},
        {"name": "Frank Thomas", "department": "Marketing", "level": "Mid"},
    ]

    # Define styles
    header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
    header_font = Font(color="FFFFFF", bold=True, size=11)
    subheader_fill = PatternFill(start_color="B4C6E7", end_color="B4C6E7", fill_type="solid")

    present_fill = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")
    absent_fill = PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid")

    thin_border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )

    # Get calendar info
    cal = calendar.Calendar()
    month_name = calendar.month_name[month]
    days_in_month = calendar.monthrange(year, month)[1]

    # ==========================================
    # SHEET 1: Training Calendar
    # ==========================================

    # Title
    calendar_sheet.merge_cells('A1:Z1')
    title_cell = calendar_sheet['A1']
    title_cell.value = f"Training Calendar - {month_name} {year}"
    title_cell.font = Font(size=18, bold=True, color="1F4E79")
    title_cell.alignment = Alignment(horizontal='center', vertical='center')
    calendar_sheet.row_dimensions[1].height = 30

    # Headers row
    headers = [
        "ID", "Employee Name", "Department", "Training Level",
        "Progress (%)", "Training Status", "Days Present", "Days Absent",
        "Completion Rate"
    ]

    # Add day columns
    for day in range(1, days_in_month + 1):
        day_date = date(year, month, day)
        day_name = day_date.strftime("%a")
        headers.append(f"{day}\n{day_name}")

    # Write headers
    header_row = 3
    for col, header in enumerate(headers, 1):
        cell = calendar_sheet.cell(row=header_row, column=col, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        cell.border = thin_border

    calendar_sheet.row_dimensions[header_row].height = 40

    # Write employee data
    import random
    random.seed(42)  # For reproducible sample data

    data_start_row = header_row + 1

    for idx, employee in enumerate(sample_employees, 1):
        row = data_start_row + idx - 1

        # Generate sample attendance data
        present_days = 0
        absent_days = 0
        training_completed = random.randint(3, 15)

        # Employee ID
        calendar_sheet.cell(row=row, column=1, value=f"EMP{idx:03d}").border = thin_border

        # Employee Name
        name_cell = calendar_sheet.cell(row=row, column=2, value=employee["name"])
        name_cell.border = thin_border
        name_cell.font = Font(bold=True)

        # Department
        calendar_sheet.cell(row=row, column=3, value=employee["department"]).border = thin_border

        # Training Level
        level_cell = calendar_sheet.cell(row=row, column=4, value=employee["level"])
        level_cell.border = thin_border
        if employee["level"] == "Senior":
            level_cell.fill = PatternFill(start_color="FFD700", end_color="FFD700", fill_type="solid")
        elif employee["level"] == "Mid":
            level_cell.fill = PatternFill(start_color="87CEEB", end_color="87CEEB", fill_type="solid")
        else:
            level_cell.fill = PatternFill(start_color="98FB98", end_color="98FB98", fill_type="solid")

        # Progress percentage (will be calculated)
        progress = random.randint(20, 100)
        progress_cell = calendar_sheet.cell(row=row, column=5, value=progress/100)
        progress_cell.number_format = '0%'
        progress_cell.border = thin_border

        # Training Status
        if progress >= 80:
            status = "On Track"
            status_color = "00B050"
        elif progress >= 50:
            status = "In Progress"
            status_color = "FFC000"
        else:
            status = "Needs Attention"
            status_color = "FF0000"

        status_cell = calendar_sheet.cell(row=row, column=6, value=status)
        status_cell.font = Font(color=status_color, bold=True)
        status_cell.border = thin_border

        # Fill attendance for each day
        for day in range(1, days_in_month + 1):
            day_date = date(year, month, day)
            col = 9 + day  # After the first 9 columns

            # Weekend check
            if day_date.weekday() >= 5:  # Saturday or Sunday
                cell = calendar_sheet.cell(row=row, column=col, value="WE")
                cell.fill = PatternFill(start_color="D9D9D9", end_color="D9D9D9", fill_type="solid")
            else:
                # Random attendance (for demo purposes)
                is_present = random.random() > 0.15  # 85% attendance rate
                if is_present:
                    # Check if training occurred
                    had_training = random.random() > 0.6  # 40% training days
                    if had_training:
                        cell = calendar_sheet.cell(row=row, column=col, value="T")
                        cell.fill = PatternFill(start_color="00B0F0", end_color="00B0F0", fill_type="solid")
                    else:
                        cell = calendar_sheet.cell(row=row, column=col, value="P")
                        cell.fill = present_fill
                    present_days += 1
                else:
                    cell = calendar_sheet.cell(row=row, column=col, value="A")
                    cell.fill = absent_fill
                    absent_days += 1

            cell.alignment = Alignment(horizontal='center')
            cell.border = thin_border

        # Days Present
        calendar_sheet.cell(row=row, column=7, value=present_days).border = thin_border

        # Days Absent
        calendar_sheet.cell(row=row, column=8, value=absent_days).border = thin_border

        # Completion Rate
        if present_days > 0:
            completion_rate = present_days / (present_days + absent_days)
        else:
            completion_rate = 0
        rate_cell = calendar_sheet.cell(row=row, column=9, value=completion_rate)
        rate_cell.number_format = '0%'
        rate_cell.border = thin_border

    # Add data bar for progress column
    data_end_row = data_start_row + len(sample_employees) - 1
    progress_range = f"E{data_start_row}:E{data_end_row}"

    data_bar_rule = DataBarRule(
        start_type='num', start_value=0,
        end_type='num', end_value=1,
        color="63BE7B"
    )
    calendar_sheet.conditional_formatting.add(progress_range, data_bar_rule)

    # Set column widths
    column_widths = {
        'A': 8, 'B': 18, 'C': 14, 'D': 14, 'E': 12, 'F': 16, 'G': 12, 'H': 12, 'I': 14
    }
    for col, width in column_widths.items():
        calendar_sheet.column_dimensions[col].width = width

    # Day columns
    for col in range(10, 10 + days_in_month):
        calendar_sheet.column_dimensions[get_column_letter(col)].width = 5

    # Add legend
    legend_row = data_end_row + 3
    calendar_sheet.cell(row=legend_row, column=1, value="Legend:").font = Font(bold=True)

    legend_items = [
        ("P", "Present", "C6EFCE"),
        ("A", "Absent", "FFC7CE"),
        ("T", "Training Day", "00B0F0"),
        ("WE", "Weekend", "D9D9D9")
    ]

    for i, (code, desc, color) in enumerate(legend_items):
        col = 2 + (i * 2)
        cell = calendar_sheet.cell(row=legend_row, column=col, value=code)
        cell.fill = PatternFill(start_color=color, end_color=color, fill_type="solid")
        cell.alignment = Alignment(horizontal='center')
        cell.border = thin_border
        calendar_sheet.cell(row=legend_row, column=col+1, value=f"= {desc}")

    # ==========================================
    # SHEET 2: Training Analytics with Charts
    # ==========================================

    # Title
    charts_sheet.merge_cells('A1:L1')
    title_cell = charts_sheet['A1']
    title_cell.value = f"Training Analytics Dashboard - {month_name} {year}"
    title_cell.font = Font(size=18, bold=True, color="1F4E79")
    title_cell.alignment = Alignment(horizontal='center', vertical='center')
    charts_sheet.row_dimensions[1].height = 30

    # ----- Data Table 1: Training Progress by Employee -----
    charts_sheet.cell(row=3, column=1, value="Training Progress by Employee").font = Font(bold=True, size=12)

    progress_headers = ["Employee", "Progress %", "Trainings Completed", "Target"]
    for col, header in enumerate(progress_headers, 1):
        cell = charts_sheet.cell(row=4, column=col, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.border = thin_border

    for idx, employee in enumerate(sample_employees):
        row = 5 + idx
        charts_sheet.cell(row=row, column=1, value=employee["name"]).border = thin_border
        progress_val = random.randint(40, 100)
        charts_sheet.cell(row=row, column=2, value=progress_val).border = thin_border
        completed = random.randint(5, 20)
        charts_sheet.cell(row=row, column=3, value=completed).border = thin_border
        charts_sheet.cell(row=row, column=4, value=20).border = thin_border  # Target is 20

    # Create Bar Chart for Progress
    bar_chart = BarChart()
    bar_chart.type = "col"
    bar_chart.style = 10
    bar_chart.title = "Training Progress by Employee"
    bar_chart.y_axis.title = "Progress %"
    bar_chart.x_axis.title = "Employee"

    data = Reference(charts_sheet, min_col=2, min_row=4, max_row=4+len(sample_employees), max_col=2)
    categories = Reference(charts_sheet, min_col=1, min_row=5, max_row=4+len(sample_employees))
    bar_chart.add_data(data, titles_from_data=True)
    bar_chart.set_categories(categories)
    bar_chart.shape = 4
    bar_chart.width = 15
    bar_chart.height = 10

    charts_sheet.add_chart(bar_chart, "F3")

    # ----- Data Table 2: Training Completion Status -----
    status_start_row = 5 + len(sample_employees) + 3
    charts_sheet.cell(row=status_start_row, column=1, value="Training Completion Status").font = Font(bold=True, size=12)

    status_data = [
        ("Completed", random.randint(20, 40)),
        ("In Progress", random.randint(15, 30)),
        ("Not Started", random.randint(5, 15)),
        ("Overdue", random.randint(2, 10))
    ]

    status_headers = ["Status", "Count"]
    for col, header in enumerate(status_headers, 1):
        cell = charts_sheet.cell(row=status_start_row+1, column=col, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.border = thin_border

    for idx, (status, count) in enumerate(status_data):
        row = status_start_row + 2 + idx
        charts_sheet.cell(row=row, column=1, value=status).border = thin_border
        charts_sheet.cell(row=row, column=2, value=count).border = thin_border

    # Create Pie Chart for Status Distribution
    pie_chart = PieChart()
    pie_chart.title = "Training Completion Distribution"

    data = Reference(charts_sheet, min_col=2, min_row=status_start_row+1,
                     max_row=status_start_row+1+len(status_data))
    categories = Reference(charts_sheet, min_col=1, min_row=status_start_row+2,
                          max_row=status_start_row+1+len(status_data))
    pie_chart.add_data(data, titles_from_data=True)
    pie_chart.set_categories(categories)
    pie_chart.width = 12
    pie_chart.height = 10

    # Add data labels
    pie_chart.dataLabels = DataLabelList()
    pie_chart.dataLabels.showPercent = True
    pie_chart.dataLabels.showCatName = True

    charts_sheet.add_chart(pie_chart, "F" + str(status_start_row))

    # ----- Data Table 3: Daily Training Activity -----
    daily_start_row = status_start_row + len(status_data) + 5
    charts_sheet.cell(row=daily_start_row, column=1, value="Daily Training Activity").font = Font(bold=True, size=12)

    daily_headers = ["Date", "Trainings Conducted", "Participants"]
    for col, header in enumerate(daily_headers, 1):
        cell = charts_sheet.cell(row=daily_start_row+1, column=col, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.border = thin_border

    # Generate daily data for workdays only
    daily_data = []
    for day in range(1, min(days_in_month + 1, 16)):  # First 15 days for chart
        day_date = date(year, month, day)
        if day_date.weekday() < 5:  # Weekdays only
            trainings = random.randint(1, 5)
            participants = random.randint(5, 25)
            daily_data.append((day_date.strftime("%b %d"), trainings, participants))

    for idx, (date_str, trainings, participants) in enumerate(daily_data):
        row = daily_start_row + 2 + idx
        charts_sheet.cell(row=row, column=1, value=date_str).border = thin_border
        charts_sheet.cell(row=row, column=2, value=trainings).border = thin_border
        charts_sheet.cell(row=row, column=3, value=participants).border = thin_border

    # Create Line Chart for Daily Activity
    line_chart = LineChart()
    line_chart.title = "Daily Training Activity Trend"
    line_chart.style = 12
    line_chart.y_axis.title = "Count"
    line_chart.x_axis.title = "Date"

    data = Reference(charts_sheet, min_col=2, min_row=daily_start_row+1,
                     max_row=daily_start_row+1+len(daily_data), max_col=3)
    categories = Reference(charts_sheet, min_col=1, min_row=daily_start_row+2,
                          max_row=daily_start_row+1+len(daily_data))
    line_chart.add_data(data, titles_from_data=True)
    line_chart.set_categories(categories)
    line_chart.width = 15
    line_chart.height = 10

    charts_sheet.add_chart(line_chart, "F" + str(daily_start_row))

    # ----- Data Table 4: Department-wise Training Summary -----
    dept_start_row = daily_start_row + len(daily_data) + 5
    charts_sheet.cell(row=dept_start_row, column=1, value="Department Training Summary").font = Font(bold=True, size=12)

    departments = ["Engineering", "Marketing", "Sales", "HR", "Finance"]
    dept_headers = ["Department", "Total Hours", "Completed", "In Progress"]

    for col, header in enumerate(dept_headers, 1):
        cell = charts_sheet.cell(row=dept_start_row+1, column=col, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.border = thin_border

    for idx, dept in enumerate(departments):
        row = dept_start_row + 2 + idx
        charts_sheet.cell(row=row, column=1, value=dept).border = thin_border
        charts_sheet.cell(row=row, column=2, value=random.randint(50, 200)).border = thin_border
        charts_sheet.cell(row=row, column=3, value=random.randint(10, 30)).border = thin_border
        charts_sheet.cell(row=row, column=4, value=random.randint(5, 15)).border = thin_border

    # Create Stacked Bar Chart for Department Summary
    dept_chart = BarChart()
    dept_chart.type = "col"
    dept_chart.grouping = "stacked"
    dept_chart.title = "Department Training Overview"
    dept_chart.y_axis.title = "Count"
    dept_chart.x_axis.title = "Department"

    data = Reference(charts_sheet, min_col=3, min_row=dept_start_row+1,
                     max_row=dept_start_row+1+len(departments), max_col=4)
    categories = Reference(charts_sheet, min_col=1, min_row=dept_start_row+2,
                          max_row=dept_start_row+1+len(departments))
    dept_chart.add_data(data, titles_from_data=True)
    dept_chart.set_categories(categories)
    dept_chart.width = 12
    dept_chart.height = 10

    charts_sheet.add_chart(dept_chart, "F" + str(dept_start_row))

    # Set column widths for charts sheet
    charts_sheet.column_dimensions['A'].width = 20
    charts_sheet.column_dimensions['B'].width = 15
    charts_sheet.column_dimensions['C'].width = 20
    charts_sheet.column_dimensions['D'].width = 15

    # Freeze panes for better navigation
    calendar_sheet.freeze_panes = 'J4'

    # Save workbook
    wb.save(output_filename)
    print(f"Training calendar saved to: {output_filename}")
    return output_filename


def main():
    """Main function to generate the training calendar."""
    import argparse

    parser = argparse.ArgumentParser(description="Generate a training calendar Excel file")
    parser.add_argument("--year", type=int, help="Year for the calendar")
    parser.add_argument("--month", type=int, help="Month for the calendar (1-12)")
    parser.add_argument("--output", type=str, help="Output filename")

    args = parser.parse_args()

    create_training_calendar(
        year=args.year,
        month=args.month,
        output_filename=args.output
    )


if __name__ == "__main__":
    main()
