# ================================================
# Evolution API - Test Script
# ================================================
# Ejecutar  : .\test-evolution.ps1
# Requisitos: PowerShell 5+, instancia conectada a WhatsApp
# ================================================
# CONFIGURACION — edita estos valores antes de ejecutar
# ================================================

$BASE_URL    = "https://whatsapp-api-production-8261.up.railway.app"
$API_KEY     = "e45f8sigjom6wb950c1xq8st52y85sax"
$INSTANCE    = "Pruebas"
$TEST_NUMBER = "573186139890"
$WEBHOOK_URL = "https://webhook.site/6b843c85-194e-4ca3-a0f6-af6ddcaffc81"
$PDF_PATH    = "C:\Users\user\Downloads\DefinicionRoles.pdf"

# ================================================

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

function Show-Result($success, $message) {
    if ($success) {
        Write-Host "  OK  $message" -ForegroundColor Green
    } else {
        Write-Host "  FAIL  $message" -ForegroundColor Red
    }
}

# ------------------------------------------------
# PASO 1 — Health check del servidor
# ------------------------------------------------
Show-Section "1. Health Check del servidor"
try {
    $health = Invoke-RestMethod -Uri "$BASE_URL" -Method GET
    Show-Result $true "Servidor activo — version: $($health.version)"
} catch {
    Show-Result $false "Servidor no responde: $($_.Exception.Message)"
    Write-Host "Verifica que BASE_URL sea correcto y el servicio este activo en Railway." -ForegroundColor Yellow
    exit
}

# ------------------------------------------------
# PASO 2 — Verificar conexion de la instancia
# ------------------------------------------------
Show-Section "2. Verificar conexion de la instancia '$INSTANCE'"
try {
    $state = Invoke-RestMethod `
        -Uri "$BASE_URL/instance/connectionState/$INSTANCE" `
        -Method GET -Headers $headers

    $currentState = $state.instance.state

    if ($currentState -eq "open") {
        Show-Result $true "Instancia conectada (state: open)"
    } else {
        Show-Result $false "Instancia NO conectada (state: $currentState)"
        Write-Host ""
        Write-Host "La instancia no esta conectada a WhatsApp." -ForegroundColor Yellow
        Write-Host "Para conectarla, corre este comando y sigue las instrucciones:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Invoke-RestMethod -Uri '$BASE_URL/instance/connect/$INSTANCE' -Method GET -Headers @{apikey='$API_KEY'} | ConvertTo-Json" -ForegroundColor White
        Write-Host ""
        Write-Host "Presiona ENTER para continuar de todas formas, o Ctrl+C para cancelar." -ForegroundColor Yellow
        Read-Host
    }
} catch {
    Show-Result $false "No se pudo verificar la instancia: $($_.Exception.Message)"
    Write-Host "Verifica que INSTANCE y API_KEY sean correctos." -ForegroundColor Yellow
    exit
}

# ------------------------------------------------
# PASO 3 — Configurar webhook
# ------------------------------------------------
Show-Section "3. Configurar Webhook"
try {
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
        -Method POST -Headers $headers -Body $body | Out-Null

    Show-Result $true "Webhook configurado en $WEBHOOK_URL"
    Write-Host "  Abre esa URL en el navegador para ver los eventos en tiempo real." -ForegroundColor Gray
} catch {
    Show-Result $false "Error configurando webhook: $($_.Exception.Message)"
}

# ------------------------------------------------
# PASO 4 — Mensaje de texto
# ------------------------------------------------
Show-Section "4. Enviar mensaje de texto"
try {
    $body = @{ number = $TEST_NUMBER; text = "Test Evolution API - texto" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/message/sendText/$INSTANCE" `
        -Method POST -Headers $headers -Body $body | Out-Null
    Show-Result $true "Mensaje de texto enviado"
} catch {
    Show-Result $false "Error: $($_.Exception.Message)"
}

# ------------------------------------------------
# PASO 5 — Imagen
# ------------------------------------------------
Show-Section "5. Enviar imagen"
try {
    $body = @{
        number    = $TEST_NUMBER
        mediatype = "image"
        media     = "https://picsum.photos/400"
        caption   = "Test imagen desde Evolution API"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/message/sendMedia/$INSTANCE" `
        -Method POST -Headers $headers -Body $body | Out-Null
    Show-Result $true "Imagen enviada"
} catch {
    Show-Result $false "Error: $($_.Exception.Message)"
}

# ------------------------------------------------
# PASO 6 — Audio (nota de voz)
# ------------------------------------------------
Show-Section "6. Enviar audio (nota de voz)"
try {
    $body = @{
        number = $TEST_NUMBER
        audio  = "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/message/sendWhatsAppAudio/$INSTANCE" `
        -Method POST -Headers $headers -Body $body | Out-Null
    Show-Result $true "Audio enviado"
} catch {
    Show-Result $false "Error: $($_.Exception.Message)"
}

# ------------------------------------------------
# PASO 7 — Video
# ------------------------------------------------
Show-Section "7. Enviar video"
try {
    $body = @{
        number    = $TEST_NUMBER
        mediatype = "video"
        media     = "https://www.w3schools.com/html/mov_bbb.mp4"
        caption   = "Test video desde Evolution API"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/message/sendMedia/$INSTANCE" `
        -Method POST -Headers $headers -Body $body | Out-Null
    Show-Result $true "Video enviado"
} catch {
    Show-Result $false "Error: $($_.Exception.Message)"
}

# ------------------------------------------------
# PASO 8 — Documento PDF
# ------------------------------------------------
Show-Section "8. Enviar documento PDF"
try {
    if (-not (Test-Path $PDF_PATH)) {
        throw "Archivo no encontrado en: $PDF_PATH — edita la variable PDF_PATH al inicio del script"
    }

    $fileName  = [System.IO.Path]::GetFileName($PDF_PATH)
    $pdfBytes  = [System.IO.File]::ReadAllBytes($PDF_PATH)
    $pdfBase64 = [Convert]::ToBase64String($pdfBytes)
    $sizeKB    = [math]::Round($pdfBytes.Length / 1KB, 2)

    Write-Host "  Archivo : $fileName ($sizeKB KB)" -ForegroundColor Gray

    $docPayload = @{
        number    = $TEST_NUMBER
        mediatype = "document"
        mimetype  = "application/pdf"
        media     = $pdfBase64
        caption   = "Test documento PDF"
        fileName  = $fileName
    }

    $docJson   = $docPayload | ConvertTo-Json -Compress -Depth 5
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($docJson)

    $req               = [System.Net.HttpWebRequest]::Create("$BASE_URL/message/sendMedia/$INSTANCE")
    $req.Method        = "POST"
    $req.ContentType   = "application/json"
    $req.ContentLength = $bodyBytes.Length
    $req.Headers.Add("apikey", $API_KEY)

    $stream = $req.GetRequestStream()
    $stream.Write($bodyBytes, 0, $bodyBytes.Length)
    $stream.Close()

    $req.GetResponse() | Out-Null
    Show-Result $true "Documento PDF enviado ($sizeKB KB)"

} catch {
    Show-Result $false "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $s = $_.Exception.Response.GetResponseStream()
        $r = New-Object System.IO.StreamReader($s)
        Write-Host "  Detalle: $($r.ReadToEnd())" -ForegroundColor Red
    }
}

# ------------------------------------------------
# PASO 9 — Ubicacion
# ------------------------------------------------
Show-Section "9. Enviar ubicacion"
try {
    $body = @{
        number    = $TEST_NUMBER
        latitude  = 3.4516
        longitude = -76.5320
        name      = "Cali, Colombia"
        address   = "Universidad Javeriana Cali"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/message/sendLocation/$INSTANCE" `
        -Method POST -Headers $headers -Body $body | Out-Null
    Show-Result $true "Ubicacion enviada"
} catch {
    Show-Result $false "Error: $($_.Exception.Message)"
}

# ------------------------------------------------
# PASO 10 — Contacto
# ------------------------------------------------
Show-Section "10. Enviar contacto"
try {
    $body = @{
        number  = $TEST_NUMBER
        contact = @(
            @{
                fullName    = "Santiago Arango"
                wuid        = "573001234567"
                phoneNumber = "+57 300 123 4567"
            }
        )
    } | ConvertTo-Json -Depth 5
    Invoke-RestMethod -Uri "$BASE_URL/message/sendContact/$INSTANCE" `
        -Method POST -Headers $headers -Body $body | Out-Null
    Show-Result $true "Contacto enviado"
} catch {
    Show-Result $false "Error: $($_.Exception.Message)"
}

# ------------------------------------------------
# PASO 11 — Poll (encuesta)
# ------------------------------------------------
Show-Section "11. Enviar encuesta (poll)"
try {
    $body = @{
        number          = $TEST_NUMBER
        name            = "Cual es tu color favorito?"
        selectableCount = 1
        values          = @("Rojo", "Azul", "Verde", "Amarillo")
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/message/sendPoll/$INSTANCE" `
        -Method POST -Headers $headers -Body $body | Out-Null
    Show-Result $true "Encuesta enviada"
} catch {
    Show-Result $false "Error: $($_.Exception.Message)"
}

# ------------------------------------------------
# PASO 12 — Verificar numero en WhatsApp
# ------------------------------------------------
Show-Section "12. Verificar si el numero existe en WhatsApp"
try {
    $body   = @{ numbers = @($TEST_NUMBER) } | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$BASE_URL/chat/whatsappNumbers/$INSTANCE" `
        -Method POST -Headers $headers -Body $body

    $exists = $result[0].exists
    Show-Result $exists "Numero $TEST_NUMBER $(if ($exists) { 'existe' } else { 'NO existe' }) en WhatsApp"
} catch {
    Show-Result $false "Error: $($_.Exception.Message)"
}

# ------------------------------------------------
# PASO 13 — Foto de perfil
# ------------------------------------------------
Show-Section "13. Obtener foto de perfil"
try {
    $body   = @{ number = $TEST_NUMBER } | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$BASE_URL/chat/fetchProfilePictureUrl/$INSTANCE" `
        -Method POST -Headers $headers -Body $body

    if ($result.profilePictureUrl) {
        Show-Result $true "Foto de perfil obtenida correctamente"
        Write-Host "  NOTA: La URL expira en segundos — comportamiento normal de WhatsApp." -ForegroundColor Gray
    } else {
        Show-Result $false "Sin foto de perfil publica para este numero"
    }
} catch {
    Show-Result $false "Error: $($_.Exception.Message)"
}

# ------------------------------------------------
# PASO 14 — Verificar Cloudflare R2
# ------------------------------------------------
Show-Section "14. Verificar Cloudflare R2 (mensajes recibidos con media)"
try {
    $body = @{
        where = @{ key = @{ fromMe = $false } }
        limit = 10
    } | ConvertTo-Json -Depth 5

    $messages      = Invoke-RestMethod -Uri "$BASE_URL/chat/findMessages/$INSTANCE" `
        -Method POST -Headers $headers -Body $body
    $mediaMessages = $messages.messages.records | Where-Object { $_.mediaUrl -ne $null -and $_.mediaUrl -ne "" }

    if ($mediaMessages) {
        foreach ($msg in $mediaMessages) {
            if ($msg.mediaUrl -like "*r2.cloudflarestorage.com*") {
                Show-Result $true "R2 activo — $($msg.messageType): $($msg.mediaUrl)"
            } else {
                Show-Result $false "URL no es de R2: $($msg.mediaUrl)"
            }
        }
    } else {
        Write-Host "  INFO: No hay mensajes recibidos con media aun." -ForegroundColor Yellow
        Write-Host "  Para probar R2: manda una foto desde tu telefono al numero conectado y corre este paso de nuevo." -ForegroundColor Gray
    }
} catch {
    Show-Result $false "Error: $($_.Exception.Message)"
}

# ------------------------------------------------
# PASO 15 — Session Management: Logout
# ------------------------------------------------
Show-Section "15. Session Management — Logout"
Write-Host "  Esto desconecta la instancia de WhatsApp." -ForegroundColor Yellow
Write-Host "  Presiona ENTER para continuar o Ctrl+C para saltar este paso..." -ForegroundColor Yellow
Read-Host

try {
    Invoke-RestMethod -Uri "$BASE_URL/instance/logout/$INSTANCE" `
        -Method DELETE -Headers $headers | Out-Null
    Show-Result $true "Logout ejecutado"

    Start-Sleep -Seconds 3

    $state = Invoke-RestMethod `
        -Uri "$BASE_URL/instance/connectionState/$INSTANCE" `
        -Method GET -Headers $headers
    Write-Host "  Estado post-logout: $($state.instance.state)" -ForegroundColor Gray
} catch {
    Show-Result $false "Error: $($_.Exception.Message)"
}

# ------------------------------------------------
# PASO 16 — Session Management: Reconnect
# ------------------------------------------------
Show-Section "16. Session Management — Reconnect"
try {
    $connectResult = Invoke-RestMethod `
        -Uri "$BASE_URL/instance/connect/$INSTANCE" `
        -Method GET -Headers $headers

    if ($connectResult.base64) {
        Show-Result $true "QR generado correctamente"
        Write-Host "  Para reconectar: abre WhatsApp > Dispositivos vinculados > Vincular dispositivo" -ForegroundColor Gray
        Write-Host "  O usa pairing code: GET $BASE_URL/instance/connect/$INSTANCE`?number=$TEST_NUMBER" -ForegroundColor Gray
    } else {
        $connectResult | ConvertTo-Json
    }

    Write-Host "  Esperando 15 segundos para que escanees el QR..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15

    $state = Invoke-RestMethod `
        -Uri "$BASE_URL/instance/connectionState/$INSTANCE" `
        -Method GET -Headers $headers
    Write-Host "  Estado post-reconnect: $($state.instance.state)" -ForegroundColor Gray

    if ($state.instance.state -eq "open") {
        Show-Result $true "Reconexion exitosa"
    } else {
        Show-Result $false "No se reconecto en 15 segundos — escanea el QR y verifica manualmente"
    }
} catch {
    Show-Result $false "Error: $($_.Exception.Message)"
}

# ------------------------------------------------
# PASO 17 — Session Management: Delete
# ------------------------------------------------
Show-Section "17. Session Management — Delete instancia"
Write-Host "  ATENCION: Esto elimina la instancia y TODOS sus datos de la BD." -ForegroundColor Red
Write-Host "  Presiona ENTER para continuar o Ctrl+C para cancelar..." -ForegroundColor Yellow
Read-Host

try {
    Invoke-RestMethod -Uri "$BASE_URL/instance/delete/$INSTANCE" `
        -Method DELETE -Headers $headers | Out-Null
    Show-Result $true "Instancia eliminada"

    $instances = Invoke-RestMethod -Uri "$BASE_URL/instance/fetchInstances" `
        -Method GET -Headers $headers
    $stillExists = $instances | Where-Object { $_.instance.instanceName -eq $INSTANCE }

    if ($stillExists) {
        Show-Result $false "La instancia aun aparece en la lista"
    } else {
        Show-Result $true "Confirmado: instancia no existe en la lista"
    }
} catch {
    Show-Result $false "Error: $($_.Exception.Message)"
}

# ------------------------------------------------
# RESUMEN FINAL
# ------------------------------------------------
Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host " TODOS LOS TESTS FINALIZADOS" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host " Entregables cubiertos:" -ForegroundColor Green
Write-Host "  #3  — Cloudflare R2 (paso 14)" -ForegroundColor Green
Write-Host "  #8  — Todos los tipos de mensaje (pasos 4-11)" -ForegroundColor Green
Write-Host "  #9  — Session management (pasos 15-17)" -ForegroundColor Green
Write-Host "  #10 — Foto de perfil (paso 13)" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host " Pendiente manual:" -ForegroundColor Yellow
Write-Host "  #11 — Edita un mensaje desde tu telefono" -ForegroundColor Yellow
Write-Host "         y verifica MESSAGES_UPDATE en webhook.site" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Green
