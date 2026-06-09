#  Configuración Local - Evolution API

Guía paso a paso para ejecutar Evolution API localmente con Docker Compose.

---

## Requisitos Previos

- **Docker** (versión 20.10+) y **Docker Compose** (versión 2.0+)
- **Git**
- Una línea de comandos (terminal/PowerShell)
- Un teléfono con WhatsApp instalado (para pruebas del QR)

---

##  Inicio Rápido (3 minutos)

### 1 Copiar configuración de desarrollo

```bash
cp .env.development .env
```

### 2 Iniciar los contenedores

```bash
docker-compose up -d
```

### 3 Verificar que todo está corriendo

```bash
# Espera 10-15 segundos a que PostgreSQL esté listo
curl -X GET http://localhost:8080/instance/fetchInstances \
  -H "apikey: test-local-key-429683C4C977415CAAFCCE10F7D57E11"
```

**Respuesta esperada:**
```json
{
  "data": []
}
```

También debería de retornar código 200 en el puerto donde se esta ejecutando evolution api como el siguiente:

```json
{"status":200,"message":"Welcome to the Evolution API, it is working!","version":"2.3.7","clientName":"evolution_local","manager":"http://localhost:8080/manager","documentation":"https://doc.evolution-api.com","whatsappWebVersion":"2.3000.1041122824"}
```


---

##  Pruebas Básicas

Hay dos maneras de hacer pruebas, por medio de terminal como esta a continuación o por la interfaz gráfica que ofrece Evolution Api en localhost puerto 8080 o la url donde se hospeda. 
### Crear una Instancia

```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: test-local-key-429683C4C977415CAAFCCE10F7D57E11" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "test-local",
    "integration": "WHATSAPP-BAILEYS",
    "token": "token-test-123",
    "qrcode": true
  }'
```

**Respuesta esperada:**
```json
{
  "instance": {
    "instanceName": "test-local",
    "state": "open",
    "webhook": {}
  }
}
```

### Obtener el QR Code

```bash
curl -X GET http://localhost:8080/instance/connect/test-local \
  -H "apikey: test-local-key-429683C4C977415CAAFCCE10F7D57E11"
```

Recibirás un Base64 que puedes decodificar con:
- https://www.base64-image.de/ (pegar el resultado)
- O con `base64` en terminal (Linux/Mac)

Escanea el QR con tu teléfono WhatsApp y ¡se conectará!

### Obtener Estado de la Instancia

```bash
curl -X GET http://localhost:8080/instance/connectionState/test-local \
  -H "apikey: test-local-key-429683C4C977415CAAFCCE10F7D57E11"
```

Deberías ver:
```json
{
  "instance": "test-local",
  "state": "open"
}
```

### Enviar un Mensaje de Prueba

Una vez que el QR esté escaneado y la instancia conectada:

```bash
curl -X POST http://localhost:8080/message/sendText/test-local \
  -H "apikey: test-local-key-429683C4C977415CAAFCCE10F7D57E11" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "34123456789",
    "text": "¡Hola desde Evolution API!"
  }'
```

---

## Variables Importantes

| Variable | Valor Local | Descripción |
|---|---|---|
| `AUTHENTICATION_API_KEY` | `test-local-key-...` | Clave para todas las peticiones |
| `SERVER_URL` | `http://localhost:8080` | URL base del servidor |
| `DATABASE_CONNECTION_URI` | PostgreSQL en Docker | Conexión a DB local |
| `CACHE_REDIS_URI` | Redis en Docker | Redis local para cache |
| `WEBHOOK_GLOBAL_ENABLED` | `false` | Webhooks desactivados (sin URL pública) |

---

## Comandos Docker Útiles

| Comando | Descripción |
|---|---|
| `docker-compose up -d` | Inicia los contenedores en background |
| `docker-compose logs -f api` | Ver logs en vivo de la API |
| `docker-compose logs -f evolution-postgres` | Ver logs de PostgreSQL |
| `docker-compose ps` | Ver estado de contenedores |
| `docker-compose down` | Detener y eliminar contenedores |
| `docker-compose down -v` | Detener y eliminar TODO (incluyendo datos) |

---

## Troubleshooting

###  Error: "Connection refused"

**Causa:** PostgreSQL todavía está iniciando
**Solución:** Espera 20-30 segundos y reinicia:
```bash
docker-compose restart evolution-postgres
docker-compose restart api
```

### Error: "apikey not found"

**Causa:** La clave API es incorrecta
**Solución:** Verifica que uses exactamente: `test-local-key-429683C4C977415CAAFCCE10F7D57E11`

### Error: "QR code not generated"

**Causa:** La instancia no está lista
**Solución:** 
1. Verifica que la instancia esté en estado `open`
2. Reinicia la API: `docker-compose restart api`
3. Crea una nueva instancia

### Los puertos están en uso

**Causa:** Ya hay un contenedor corriendo
**Solución:** Detén todo e inicia de nuevo:
```bash
docker-compose down
docker-compose up -d
```

---

## Próximo Paso: Webhooks Públicos

Para recibir webhooks (mensajes que llegan a WhatsApp), necesitas una URL pública.
Opciones:

### Opción 1: ngrok (rápido para testing)
```bash
# Terminal 1: inicia Evolution
docker-compose up

# Terminal 2: expone localhost:8080
ngrok http 8080

# Copia la URL, ej: https://abc123.ngrok.io
```

Luego actualiza `.env`:
```env
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_URL=https://abc123.ngrok.io/webhooks
```

### Opción 2: Railway (para producción)
Revisar el PRD completo en `docs/PRD_evolution_api.md` sección 3 (Deployment)

---

## Referencias

- **API Docs:** http://localhost:3000 (frontend local)
- **Swagger/OpenAPI:** http://localhost:8080/api-docs
- **PRD Completo:** `docs/PRD_evolution_api.md`
- **Repo Oficial:** https://github.com/EvolutionAPI/evolution-api

---

## Validación Completa (Checklist)

- [ ] Docker y Docker Compose instalados
- [ ] Repositorio clonado
- [ ] `.env.development` copiado a `.env`
- [ ] `docker-compose up -d` ejecutado
- [ ] Instancias vacías con GET `/instance/fetchInstances`
- [ ] Instancia creada exitosamente
- [ ] QR generado (Base64 recibido)
- [ ] QR escaneado con WhatsApp
- [ ] Instancia en estado `open`
- [ ] Mensaje de prueba enviado exitosamente


---

## Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose logs api`
2. Reinicia todo: `docker-compose down && docker-compose up -d`
3. Verifica el PRD: `docs/PRD_evolution_api.md`
