# ================================================
# Evolution API - Test Script
# ================================================
# Ejecutar: .\test-evolution.ps1
# Requiere: instancia conectada a WhatsApp
# ================================================

$BASE_URL    = "https://whatsapp-api-production-8261.up.railway.app"
$API_KEY     = "e45f8sigjom6wb950c1xq8st52y85sax"
$INSTANCE    = "store-abc"
$TEST_NUMBER = "573186139890"
$WEBHOOK_URL = "https://webhook.site/3d2ae1ec-114e-4a42-b2ac-0dbd16e19828"   # <-- pega aqui tu URL de webhook.site

$headers = @{
    "apikey"       = $API_KEY
    "Content-Type" = "application/json"
}

function Show-Section($title) {
    Write-Host ""
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host " $title" -ForegroundColor Cyan
    Write-Host "===========================================" -ForegroundColor Cyan
}

# ------------------------------------------
# 0. Configurar webhook en la instancia
# ------------------------------------------
Show-Section "0. Configurar Webhook"
$body = @{
    webhook = @{
        url      = $WEBHOOK_URL
        enabled  = $true
        byEvents = $false
        base64   = $false
        events   = @(
            "MESSAGES_UPSERT",
            "MESSAGES_UPDATE",
            "MESSAGES_DELETE",
            "SEND_MESSAGE",
            "CONNECTION_UPDATE",
            "QRCODE_UPDATED",
            "CONTACTS_UPDATE"
        )
    }
} | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri "$BASE_URL/webhook/set/$INSTANCE" `
    -Method POST -Headers $headers -Body $body | ConvertTo-Json

Write-Host "Webhook configurado. Verificando..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/webhook/find/$INSTANCE" `
    -Method GET -Headers $headers | ConvertTo-Json

# ------------------------------------------
# 1. Health check
# ------------------------------------------
Show-Section "1. Health Check"
Invoke-RestMethod -Uri "$BASE_URL" -Method GET | ConvertTo-Json

# ------------------------------------------
# 2. Estado de la instancia
# ------------------------------------------
Show-Section "2. Estado de la instancia"
Invoke-RestMethod -Uri "$BASE_URL/instance/connectionState/$INSTANCE" `
    -Method GET -Headers $headers | ConvertTo-Json

# ------------------------------------------
# 3. Texto
# ------------------------------------------
Show-Section "3. Enviar mensaje de texto"
$body = @{ number = $TEST_NUMBER; text = "Test Evolution API - texto" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE_URL/message/sendText/$INSTANCE" `
    -Method POST -Headers $headers -Body $body | ConvertTo-Json

# ------------------------------------------
# 4. Imagen
# ------------------------------------------
Show-Section "4. Enviar imagen"
$body = @{
    number    = $TEST_NUMBER
    mediatype = "image"
    media     = "https://picsum.photos/400"
    caption   = "Test imagen desde Evolution API"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE_URL/message/sendMedia/$INSTANCE" `
    -Method POST -Headers $headers -Body $body | ConvertTo-Json

# ------------------------------------------
# 5. Audio (nota de voz)
# ------------------------------------------
Show-Section "5. Enviar audio (nota de voz)"
$body = @{
    number  = $TEST_NUMBER
    audio   = "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
    caption = "Test audio"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE_URL/message/sendWhatsAppAudio/$INSTANCE" `
    -Method POST -Headers $headers -Body $body | ConvertTo-Json

# ------------------------------------------
# 6. Video
# ------------------------------------------
Show-Section "6. Enviar video"
$body = @{
    number    = $TEST_NUMBER
    mediatype = "video"
    media     = "https://www.w3schools.com/html/mov_bbb.mp4"
    caption   = "Test video desde Evolution API"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE_URL/message/sendMedia/$INSTANCE" `
    -Method POST -Headers $headers -Body $body | ConvertTo-Json

# ------------------------------------------
# 7. Documento
# ------------------------------------------
Show-Section "7. Enviar documento"
$body = @{
    number    = $TEST_NUMBER
    mediatype = "document"
    media     = "https://www.africau.edu/images/default/sample.pdf"
    caption   = "Test documento PDF"
    fileName  = "sample.pdf"
    mimetype  = "application/pdf"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE_URL/message/sendMedia/$INSTANCE" `
    -Method POST -Headers $headers -Body $body | ConvertTo-Json

# ------------------------------------------
# 8. Ubicacion
# ------------------------------------------
Show-Section "8. Enviar ubicacion"
$body = @{
    number    = $TEST_NUMBER
    latitude  = 3.4516
    longitude = -76.5320
    name      = "Cali, Colombia"
    address   = "Universidad Javeriana Cali"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE_URL/message/sendLocation/$INSTANCE" `
    -Method POST -Headers $headers -Body $body | ConvertTo-Json

# ------------------------------------------
# 9. Contacto
# ------------------------------------------
Show-Section "9. Enviar contacto"
$body = @{
    number   = $TEST_NUMBER
    contact  = @(
        @{
            fullName    = "Santiago Arango"
            wuid        = "573001234567"
            phoneNumber = "+57 300 123 4567"
        }
    )
} | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri "$BASE_URL/message/sendContact/$INSTANCE" `
    -Method POST -Headers $headers -Body $body | ConvertTo-Json

# ------------------------------------------
# 10. Poll
# ------------------------------------------
Show-Section "10. Enviar encuesta (poll)"
$body = @{
    number        = $TEST_NUMBER
    name          = "Cual es tu color favorito?"
    selectableCount = 1
    values        = @("Rojo", "Azul", "Verde", "Amarillo")
} | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE_URL/message/sendPoll/$INSTANCE" `
    -Method POST -Headers $headers -Body $body | ConvertTo-Json

# ------------------------------------------
# 11. Verificar numero en WhatsApp
# ------------------------------------------
Show-Section "11. Verificar si numero existe en WhatsApp"
$body = @{ numbers = @($TEST_NUMBER) } | ConvertTo-Json
Invoke-RestMethod -Uri "$BASE_URL/chat/whatsappNumbers/$INSTANCE" `
    -Method POST -Headers $headers -Body $body | ConvertTo-Json

# ------------------------------------------
# 12. Foto de perfil del contacto
# ------------------------------------------
Show-Section "12. Obtener foto de perfil"
$body = @{ number = $TEST_NUMBER } | ConvertTo-Json
$result = Invoke-RestMethod -Uri "$BASE_URL/chat/fetchProfilePictureUrl/$INSTANCE" `
    -Method POST -Headers $headers -Body $body
$result | ConvertTo-Json

# La URL retornada es una URL firmada de WhatsApp que expira en segundos.
# Esto es comportamiento esperado — en produccion logicfy la descarga
# inmediatamente al recibirla. Si ves "Bad URL hash" al abrir en el
# navegador, significa que ya expiro (normal).
if ($result.profilePictureUrl) {
    Write-Host "Foto de perfil obtenida correctamente." -ForegroundColor Green
    Write-Host "NOTA: La URL expira en segundos, es comportamiento normal de WhatsApp." -ForegroundColor Yellow
} else {
    Write-Host "Sin foto de perfil publica o numero no encontrado." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host " TESTS COMPLETADOS" -ForegroundColor Green
Write-Host " Revisa webhook.site para ver los eventos" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
