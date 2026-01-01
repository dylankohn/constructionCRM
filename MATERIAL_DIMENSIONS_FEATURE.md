# Material Dimensions Feature

## Overview
The Construction CRM now includes intelligent material type detection that automatically recognizes material types (like lumber, pipe, concrete, etc.) and dynamically provides relevant dimension input fields.

## Features

### Automatic Material Type Detection
When you enter a material name, the system automatically detects the type based on keywords:

- **Lumber**: Keywords include `lumber`, `wood`, `timber`, `2x4`, `2x6`, `2x8`, `4x4`, `plywood`, `board`
  - Dimension fields: Length, Width, Thickness
  - Default unit: board feet

- **Pipe**: Keywords include `pipe`, `pvc`, `copper`, `pex`, `conduit`
  - Dimension fields: Length, Diameter
  - Default unit: linear feet

- **Concrete**: Keywords include `concrete`, `cement`, `mortar`, `grout`
  - Dimension fields: Length, Width, Height
  - Default unit: cubic yards

- **Drywall**: Keywords include `drywall`, `sheetrock`, `gypsum`
  - Dimension fields: Length, Width, Thickness
  - Default unit: sheets

- **Paint**: Keywords include `paint`, `stain`, `primer`, `sealer`
  - No dimension fields
  - Default unit: gallons

- **Roofing**: Keywords include `shingle`, `roofing`, `tile`, `membrane`
  - Dimension fields: Length, Width
  - Default unit: squares

- **Insulation**: Keywords include `insulation`, `foam`, `fiberglass`
  - Dimension fields: Length, Width, Thickness
  - Default unit: square feet

### Dynamic UI
- When a material type is detected, a highlighted notification appears
- Relevant dimension input fields are dynamically displayed in a dedicated section
- All dimensions are measured in inches by default
- The description field is automatically updated with the entered dimensions

### Example Usage

1. **Adding Lumber**:
   - Enter "2x4 Lumber" in the Material Name field
   - System detects "Lumber" type
   - Length, Width, and Thickness fields appear
   - Enter dimensions (e.g., Length: 96, Width: 3.5, Thickness: 1.5)
   - Unit automatically suggests "board feet"
   - Description auto-fills with: "Dimensions: length: 96", width: 3.5", thickness: 1.5""

2. **Adding Pipe**:
   - Enter "PVC Pipe" in the Material Name field
   - System detects "Pipe" type
   - Length and Diameter fields appear
   - Enter dimensions (e.g., Length: 120, Diameter: 2)
   - Unit automatically suggests "linear feet"

## Database Schema

The feature adds two new fields to the `job_materials` table:

```sql
material_type VARCHAR(50)  -- Stores the detected material type (lumber, pipe, etc.)
dimensions JSON            -- Stores dimension data as JSON (e.g., {"length": "96", "width": "3.5"})
```

### Migration
To enable this feature in your existing database, run:

```bash
mysql -u your_username -p your_database < add_material_dimensions.sql
```

## API Changes

### POST /materials
New optional fields:
- `material_type`: String (detected material type)
- `dimensions`: Object (dimension values)

Example payload:
```json
{
  "material_name": "2x4 Lumber",
  "material_type": "lumber",
  "dimensions": {
    "length": "96",
    "width": "3.5",
    "thickness": "1.5"
  },
  "quantity": "20",
  "unit": "board feet",
  ...
}
```

### PUT /materials/:id/:userId
Same new fields as POST endpoint.

## Benefits

1. **Faster Data Entry**: Automatically suggests relevant fields and units
2. **Consistency**: Standardizes how dimensions are recorded across materials
3. **Better Organization**: Dimensions are properly structured and searchable
4. **Intelligent Defaults**: Auto-sets appropriate units based on material type
5. **Flexibility**: Works with existing materials - dimensions are optional

## Future Enhancements

Possible improvements:
- Add more material types (metal, glass, tile, etc.)
- Calculate quantities based on dimensions automatically
- Support for metric units
- Material-specific calculators (board feet calculator for lumber, etc.)
- Import/export dimension templates
- Custom material type definitions per user

## Technical Details

### Frontend (JobMaterials.js)
- Uses React state to track detected material type
- Dynamically renders dimension fields based on material type configuration
- Auto-updates description field with formatted dimension string
- Sends dimension data as JSON to backend API

### Backend (server.js)
- Accepts `material_type` and `dimensions` in request body
- Stores dimensions as JSON string in MySQL
- Backward compatible - existing materials without dimensions continue to work

### Material Type Configuration
Material types are configured in the `materialTypes` object in `JobMaterials.js`:

```javascript
const materialTypes = {
  lumber: {
    keywords: ['lumber', 'wood', 'timber', '2x4', '2x6', '2x8', '4x4', 'plywood', 'board'],
    fields: ['length', 'width', 'thickness'],
    defaultUnit: 'board feet'
  },
  // ... more types
};
```

To add a new material type:
1. Add entry to `materialTypes` object
2. Define keywords array
3. Specify dimension fields needed
4. Set default unit

## Troubleshooting

**Q: Material type not being detected**
- Ensure the material name contains one of the defined keywords
- Keywords are case-insensitive

**Q: Dimension fields not appearing**
- Check that a material type was successfully detected (look for the green notification)
- Verify the material type has dimension fields defined

**Q: Database errors when saving**
- Ensure you've run the migration script to add the new columns
- Check that your MySQL version supports JSON column type (5.7.8+)

## Support
For questions or issues, please refer to the main README or contact support.

