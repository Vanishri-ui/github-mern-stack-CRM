$date = Get-Date -Format "yyyy-MM-dd_HH-mm"
$source = "C:\Users\VIVA\mern-crud"
$destination = "C:\Users\VIVA\backups\mern-portal-backup-$date.zip"

# Create Backups folder if not exists
New-Item -ItemType Directory -Force -Path "C:\Users\VIVA\backups" | Out-Null

# Create Zip (excluding node_modules to save space/time)
Write-Host "Creating backup... Please wait."
Compress-Archive -Path "$source\backend", "$source\frontend" -DestinationPath $destination -Force

Write-Host "✅ Backup successful!"
Write-Host "Saved to: $destination"
