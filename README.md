# Training Calendar Excel Generator

A Python tool that generates comprehensive monthly training calendar Excel spreadsheets with progress tracking and analytics charts.

## Features

### Sheet 1: Training Calendar
- **Employee Information**: ID, Name, Department, Training Level
- **Progress Tracking**:
  - Progress percentage with data bar visualization
  - Training status indicators (On Track, In Progress, Needs Attention)
- **Attendance Tracking**:
  - Daily attendance (Present/Absent/Training Day/Weekend)
  - Days present and absent counts
  - Completion rate calculation
- **Visual Formatting**:
  - Color-coded training levels (Senior/Mid/Junior)
  - Conditional formatting for attendance
  - Frozen panes for easy navigation

### Sheet 2: Training Analytics
Multiple charts and data tables for comprehensive analysis:

1. **Training Progress by Employee** - Bar chart showing individual progress percentages
2. **Training Completion Distribution** - Pie chart showing status breakdown (Completed, In Progress, Not Started, Overdue)
3. **Daily Training Activity Trend** - Line chart showing trainings conducted and participants over time
4. **Department Training Overview** - Stacked bar chart showing completed vs in-progress trainings by department

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Generate calendar for current month:
```bash
python training_calendar_generator.py
```

### Specify year and month:
```bash
python training_calendar_generator.py --year 2025 --month 12
```

### Custom output filename:
```bash
python training_calendar_generator.py --output my_calendar.xlsx
```

### All options:
```bash
python training_calendar_generator.py --year 2025 --month 11 --output training_nov.xlsx
```

## Output

The script generates an Excel file (default: `training_calendar_YYYY_MM.xlsx`) with:
- Formatted calendar sheet with attendance tracking
- Analytics dashboard with multiple charts
- Sample employee data for demonstration

## Legend

| Code | Meaning |
|------|---------|
| P | Present |
| A | Absent |
| T | Training Day |
| WE | Weekend |

## Requirements

- Python 3.7+
- openpyxl >= 3.1.0

## Customization

To use with real employee data, modify the `sample_employees` list in the `create_training_calendar()` function with your actual employee information.

## License

MIT License
