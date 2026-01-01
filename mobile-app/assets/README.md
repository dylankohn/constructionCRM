# Assets Directory

This directory should contain the following app assets:

## Required Files

1. **icon.png** (1024x1024)
   - App icon that appears on the home screen
   - Should be a simple, recognizable design
   - Recommended: Use your company logo or a construction-themed icon

2. **splash.png** (2048x2048)
   - Splash screen shown while app is loading
   - Background color is set to #234848 in app.json
   - Should work well with the dark teal background

3. **adaptive-icon.png** (1024x1024)
   - Android adaptive icon (foreground)
   - Background color is set to #234848 in app.json
   - Should be a simple icon that works with background

4. **favicon.png** (48x48 or higher)
   - Small icon for web version
   - Can be the same as icon.png but smaller

## Creating Placeholder Assets

If you don't have custom assets yet, you can use placeholders:

### Using online tools:
- [makeappicon.com](https://makeappicon.com/) - Generate all icon sizes
- [appicon.co](https://appicon.co/) - Free icon generator
- [iconkitchen.com](https://icon.kitchen/) - Android adaptive icon tool

### Using design software:
- Create a 1024x1024 image with your logo/design
- Save as icon.png
- Copy and rename for splash.png (it will be centered automatically)
- Create adaptive-icon.png with simpler design for Android

## Default Colors

The app uses these brand colors:
- Primary: #4DA3A2 (Teal)
- Dark: #234848 (Dark Teal)
- Secondary: #99CFCE (Light Teal)

Make sure your assets complement these colors.

## Notes

- All images should be PNG format with transparency
- Higher resolution is better (Expo will resize automatically)
- Keep file sizes reasonable (< 1MB per image)
- Test your icons on both light and dark backgrounds

