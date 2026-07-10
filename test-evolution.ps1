# ================================================
# Evolution API - Test Script
# ================================================
# Ejecutar: .\test-evolution.ps1
# Requiere: instancia conectada a WhatsApp
# ================================================

$BASE_URL    = ""
$API_KEY     = ""
$INSTANCE    = "Pruebas"
$TEST_NUMBER = "573186139890"
$WEBHOOK_URL = "https://webhook.site/a89d7088-4900-40c1-81f5-048390a8b392"

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
# 7. Documento PDF desde archivo local
# ------------------------------------------
Show-Section "7. Enviar documento PDF"

try {
    $pdfPath = "C:\Users\user\Downloads\DefinicionRoles.pdf"

    if (-not (Test-Path $pdfPath)) {
        throw "No se encontró el archivo PDF en la ruta indicada: $pdfPath"
    }

    $fileName = [System.IO.Path]::GetFileName($pdfPath)
    $pdfBytes = [System.IO.File]::ReadAllBytes($pdfPath)

    # IMPORTANTE: base64 limpio, sin data:application/pdf;base64,
    $pdfBase64 = [Convert]::ToBase64String($pdfBytes)

    Write-Host "PDF encontrado: $fileName" -ForegroundColor Yellow
    Write-Host "Tamaño: $([math]::Round($pdfBytes.Length / 1KB, 2)) KB" -ForegroundColor Yellow
    Write-Host "Enviando documento..." -ForegroundColor Yellow

    $docPayload = @{
        number    = $TEST_NUMBER
        mediatype = "document"
        mimetype  = "application/pdf"
        media     = $pdfBase64
        caption   = "Documento PDF de prueba"
        fileName  = $fileName
    }

    $docJson = $docPayload | ConvertTo-Json -Compress -Depth 5

    $response = Invoke-RestMethod `
        -Uri "$BASE_URL/message/sendMedia/$INSTANCE" `
        -Method POST `
        -Headers @{ apikey = $API_KEY } `
        -ContentType "application/json" `
        -Body $docJson

    Write-Host "Documento enviado correctamente." -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10

} catch {
    Write-Host "Error enviando documento: $($_.Exception.Message)" -ForegroundColor Red

    if ($_.Exception.Response) {
        $errStream = $_.Exception.Response.GetResponseStream()
        $errReader = New-Object System.IO.StreamReader($errStream)
        Write-Host "Response: $($errReader.ReadToEnd())" -ForegroundColor Red
    }
}

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
Write-Host " TESTS DE MENSAJES COMPLETADOS" -ForegroundColor Green
Write-Host " Revisa webhook.site para ver los eventos" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# ------------------------------------------
# 13. Verificar R2 - revisar ultimo mensaje con media
# ------------------------------------------
Show-Section "13. Verificar Cloudflare R2 (mensajes recibidos con media)"
Write-Host "Buscando mensajes recibidos con mediaUrl..." -ForegroundColor Yellow

$body = @{
    where = @{ key = @{ fromMe = $false } }
    limit = 20
} | ConvertTo-Json -Depth 5

$messages      = Invoke-RestMethod -Uri "$BASE_URL/chat/findMessages/$INSTANCE" `
    -Method POST -Headers $headers -Body $body
$mediaMessages = $messages.messages.records | Where-Object { $_.mediaUrl -ne $null -and $_.mediaUrl -ne "" }

if ($mediaMessages) {
    foreach ($msg in $mediaMessages) {
        Write-Host "  Tipo    : $($msg.messageType)" -ForegroundColor White
        Write-Host "  mediaUrl: $($msg.mediaUrl)" -ForegroundColor White
        if ($msg.mediaUrl -like "*r2.cloudflarestorage.com*") {
            Write-Host "  -> Cloudflare R2 activo!" -ForegroundColor Green
        } else {
            Write-Host "  -> URL no es de R2. Verifica variables S3_ en Railway." -ForegroundColor Red
        }
    }
} else {
    Write-Host "No hay mensajes con media aun. Manda una foto desde tu telefono y corre solo el test 13." -ForegroundColor Yellow
}

# ------------------------------------------
# 14. Session Management - Logout
# ------------------------------------------
<#Show-Section "14. Session Management - Logout"
Write-Host "Desconectando instancia (logout)..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/instance/logout/$INSTANCE" `
    -Method DELETE -Headers $headers | ConvertTo-Json

Write-Host "Esperando 3 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Estado despues del logout:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/instance/connectionState/$INSTANCE" `
    -Method GET -Headers $headers | ConvertTo-Json
#>

# ------------------------------------------
# 15. Session Management - Reconnect (nuevo QR)
# ------------------------------------------
<#Show-Section "15. Session Management - Reconnect"
Write-Host "Solicitando reconexion (nuevo QR o pairing code)..." -ForegroundColor Yellow
$connectResult = Invoke-RestMethod -Uri "$BASE_URL/instance/connect/$INSTANCE" `
    -Method GET -Headers $headers

if ($connectResult.base64) {
    Write-Host "QR generado. Para verlo, pega esta URL en el navegador:" -ForegroundColor Green
    Write-Host "data:image/png;base64,..." -ForegroundColor Gray
    Write-Host "(El base64 completo esta en la variable connectResult.base64)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "ACCION REQUERIDA: Escanea el QR con WhatsApp para reconectar." -ForegroundColor Cyan
    Write-Host "Cuando reconectes, el webhook recibira CONNECTION_UPDATE con state: open" -ForegroundColor Cyan
} else {
    $connectResult | ConvertTo-Json
}

Write-Host ""
Write-Host "Esperando 15 segundos para que escanees el QR..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "Estado despues de reconexion:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/instance/connectionState/$INSTANCE" `
    -Method GET -Headers $headers | ConvertTo-Json
#>
# ------------------------------------------
# 16. Session Management - Delete
# ------------------------------------------
<#Show-Section "16. Session Management - Delete instancia"
Write-Host "ATENCION: Esto borra la instancia y todos sus datos." -ForegroundColor Red
Write-Host "Presiona ENTER para continuar o Ctrl+C para cancelar..." -ForegroundColor Yellow
Read-Host

Invoke-RestMethod -Uri "$BASE_URL/instance/delete/$INSTANCE" `
    -Method DELETE -Headers $headers | ConvertTo-Json

Write-Host "Verificando que fue eliminada:" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/instance/fetchInstances" `
    -Method GET -Headers $headers | ConvertTo-Json

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host " TODOS LOS TESTS FINALIZADOS" -ForegroundColor Green
Write-Host "==========================================="  -ForegroundColor Green
Write-Host " Entregables cubiertos:" -ForegroundColor Green
Write-Host "  #8  - Todos los tipos de mensaje" -ForegroundColor Green
Write-Host "  #9  - Session management (logout/reconnect/delete)" -ForegroundColor Green
Write-Host "  #10 - Foto de perfil" -ForegroundColor Green
Write-Host "  #3  - Cloudflare R2 (test 13)" -ForegroundColor Green
Write-Host "==========================================="  -ForegroundColor Green
Write-Host " Pendiente manual:" -ForegroundColor Yellow
Write-Host "  #11 - Edita un mensaje desde tu telefono" -ForegroundColor Yellow
Write-Host "        y verifica MESSAGES_UPDATE en webhook.site" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Green#>
