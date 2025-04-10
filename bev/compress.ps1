$filePath = ".\GFirestoreNodeCollapser.xpi"

if (Test-Path $filePath) {
    Remove-Item $filePath
}

Compress-Archive -Path ./GFirestoreNodeCollapser/* -DestinationPath $filePath
