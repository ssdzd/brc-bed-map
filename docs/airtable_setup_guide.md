# Airtable Setup Guide for BRC BED Map

## Environment Variables Required

Create a `.env` file in the `app/` directory with the following variables:

```env
# Airtable Configuration
VITE_AIRTABLE_BASE_ID=your_base_id_here
VITE_AIRTABLE_TABLE_NAME=BED_Camp_Progress
VITE_AIRTABLE_PAT=your_pat_here
```

## Field Mappings

The application expects the following field names in your Airtable table:

| Application Field | Airtable Field Name | Description |
|------------------|-------------------|-------------|
| `camp_name` | `Camp Name` | The name of the camp |
| `placement_address` | `Matched Address` | The formatted address from your matching script |
| `bed_status` | `Status` | The BED status (color/status value) |

## Supported Address Formats

Your matching script should output addresses in these formats:

### Street Addresses
- `"C & 3:45"`
- `"Esplanade & 5:30"`
- `"A & 2:00"`

### Plaza Addresses
- `"3:00 Plaza"` (general plaza)
- `"3:00 Plaza Quarter A"` (specific quarter)
- `"4:30 Plaza Quarter B"`
- `"Center Camp Plaza"`
- `"Center Camp Quarter C"`

## Airtable Setup Steps

1. **Create your Airtable base** with a table named `BED_Camp_Progress`
2. **Add the required fields**:
   - `Camp Name` (Single line text)
   - `Matched Address` (Single line text)
   - `Status` (Single select or color field)
3. **Set up your matching script** to populate the `Matched Address` field
4. **Configure environment variables** in the `.env` file
5. **Test the connection** using the app's data source selector

## Optional Fields

The application can also use these optional fields if available:
- `Contact Name` (for `user_name`)
- `Email` (for `email`)
- `Buddy Name` (for `buddy_name`)
- `Notes` (for `notes`)

## Testing the Connection

1. Start the development server: `npm run dev`
2. Open the app in your browser
3. Use the data source selector to switch to "Airtable"
4. Check the console for any connection errors
5. Verify that camps are displaying on the map

## Troubleshooting

- **Connection failed**: Check your PAT and Base ID
- **No data showing**: Verify your table name and field names
- **Address parsing errors**: Ensure addresses match the supported formats
- **CORS issues**: Make sure your Airtable base allows API access 