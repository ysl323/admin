Set-Location "e:\demo\my1\my1"

git config --global user.email "admin@example.com"
git config --global user.name "Admin"

Write-Host "Adding files..."
git add -A

Write-Host "Committing..."
git commit -m "Add export import course features"

Write-Host "Pushing..."
git push origin master
